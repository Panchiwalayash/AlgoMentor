import os
import re
import logging
import sys
from typing import Dict, List, Optional, Any

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import yaml


logger = logging.getLogger("algo_mentor.rag")
logger.setLevel(logging.INFO)

# Default path for persistent storage
DEFAULT_STORAGE_DIR = os.path.join(os.path.dirname(__file__), "rag_storage")
DEFAULT_MATERIAL_DIR = os.path.join(os.path.dirname(__file__), "course_material")


def parse_markdown_with_frontmatter(file_path: str) -> tuple[Dict[str, Any], str]:
    """Parse Markdown file separating YAML frontmatter from body content."""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    frontmatter = {}
    content = text

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                frontmatter = yaml.safe_load(parts[1]) or {}
                content = parts[2]
            except Exception as e:
                logger.warning(f"Failed to parse frontmatter in {file_path}: {e}")

    return frontmatter, content.strip()


def chunk_markdown_content(topic_id: str, frontmatter: Dict[str, Any], content: str) -> List[Dict[str, Any]]:
    """
    Split markdown content into section chunks based on headers.
    Preserves topic metadata, section headers, and context.
    """
    chunks = []
    topic_title = frontmatter.get("title", topic_id.replace("-", " ").title())
    difficulty = frontmatter.get("difficulty", "intermediate")
    category = frontmatter.get("category", "Computer Science")

    # Split by section headers (## or #)
    section_pattern = r"(?=(?:^|\n)#{1,3}\s+)"
    raw_sections = re.split(section_pattern, content)

    chunk_idx = 0
    for section in raw_sections:
        section = section.strip()
        if not section:
            continue

        # Extract section title from first line
        first_line = section.split("\n", 1)[0].strip()
        section_title = re.sub(r"^#{1,3}\s*", "", first_line) if first_line.startswith("#") else "General Overview"

        chunks.append({
            "id": f"{topic_id}_chunk_{chunk_idx}",
            "topic_id": topic_id,
            "topic_title": topic_title,
            "difficulty": difficulty,
            "category": category,
            "section_title": section_title,
            "text": section,
            "chunk_idx": chunk_idx,
        })
        chunk_idx += 1

    return chunks


class RAGManager:
    def __init__(self, storage_dir: str = DEFAULT_STORAGE_DIR, material_dir: str = DEFAULT_MATERIAL_DIR):
        self.storage_dir = storage_dir
        self.material_dir = material_dir
        self.chroma_client = None
        self.collection = None
        self.use_chroma = False

        self._init_chroma()

    def _init_chroma(self):
        """Initialize ChromaDB client and collection."""
        try:
            import chromadb
            from chromadb.utils import embedding_functions

            os.makedirs(self.storage_dir, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.storage_dir)

            # Use default or sentence-transformer embedding function
            emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            self.collection = self.chroma_client.get_or_create_collection(
                name="algo_mentor_course_material",
                embedding_function=emb_fn,
                metadata={"hnsw:space": "cosine"}
            )
            self.use_chroma = True
            logger.info("ChromaDB initialized successfully for RAGManager.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization failed: {e}. Falling back to lightweight memory retriever.")
            self.use_chroma = False

    def build_index(self, material_dir: Optional[str] = None) -> int:
        """
        Scan course_material directory, chunk documents, and index into ChromaDB.
        Returns total number of chunks indexed.
        """
        dir_to_scan = material_dir or self.material_dir
        if not os.path.exists(dir_to_scan):
            logger.error(f"Material directory '{dir_to_scan}' does not exist.")
            return 0

        all_chunks = []
        for file_name in os.listdir(dir_to_scan):
            if file_name.endswith(".md"):
                file_path = os.path.join(dir_to_scan, file_name)
                topic_id = os.path.splitext(file_name)[0]
                frontmatter, content = parse_markdown_with_frontmatter(file_path)
                if "id" in frontmatter:
                    topic_id = frontmatter["id"]

                chunks = chunk_markdown_content(topic_id, frontmatter, content)
                all_chunks.extend(chunks)

        if not all_chunks:
            logger.warning("No markdown topic files found to index.")
            return 0

        if self.use_chroma and self.collection:
            ids = [c["id"] for c in all_chunks]
            documents = [c["text"] for c in all_chunks]
            metadatas = [
                {
                    "topic_id": c["topic_id"],
                    "topic_title": c["topic_title"],
                    "difficulty": c["difficulty"],
                    "category": c["category"],
                    "section_title": c["section_title"],
                    "chunk_idx": c["chunk_idx"],
                }
                for c in all_chunks
            ]

            # Upsert into ChromaDB collection
            self.collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
            logger.info(f"Indexed {len(all_chunks)} chunks across {len(set(c['topic_id'] for c in all_chunks))} topics into ChromaDB.")
        else:
            logger.info(f"Fallback mode: {len(all_chunks)} chunks prepared.")

        return len(all_chunks)

    def get_topic_overview(self, topic_id: str) -> str:
        """
        Retrieve a modal topic overview for the given topic_id.
        """
        if self.use_chroma and self.collection:
            try:
                res = self.collection.get(
                    where={"topic_id": topic_id},
                    limit=10,
                )
                docs = res.get("documents", [])
                metas = res.get("metadatas", [])
                if docs:
                    # Pick overview section or combine first 2 chunks
                    overview_chunks = []
                    for doc, meta in zip(docs, metas):
                        sec_title = meta.get("section_title", "").lower()
                        if "overview" in sec_title or "intuition" in sec_title or meta.get("chunk_idx") == 0:
                            overview_chunks.append(doc)

                    if overview_chunks:
                        return "\n\n".join(overview_chunks[:2])
                    return "\n\n".join(docs[:2])
            except Exception as e:
                logger.warning(f"Error fetching topic overview from Chroma: {e}")

        # Fallback reading from raw markdown file
        target_file = os.path.join(self.material_dir, f"{topic_id}.md")
        if os.path.exists(target_file):
            _, content = parse_markdown_with_frontmatter(target_file)
            sections = content.split("---")
            return sections[0].strip() if len(sections) > 0 else content[:600]

        return f"Topic: {topic_id.replace('-', ' ').title()}. Practice core concepts, intuition, and edge cases."

    def retrieve_context(self, topic_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve relevant grounded context chunks for a specific topic and query.
        """
        if self.use_chroma and self.collection:
            try:
                res = self.collection.query(
                    query_texts=[query],
                    n_results=top_k,
                    where={"topic_id": topic_id}
                )
                results = []
                documents = res.get("documents", [[]])[0]
                metadatas = res.get("metadatas", [[]])[0]
                distances = res.get("distances", [[]])[0] if "distances" in res else [0] * len(documents)

                for doc, meta, dist in zip(documents, metadatas, distances):
                    results.append({
                        "section_title": meta.get("section_title", "Concept"),
                        "text": doc,
                        "distance": dist,
                    })
                return results
            except Exception as e:
                logger.warning(f"Error querying ChromaDB: {e}")

        # Fallback keyword match
        overview = self.get_topic_overview(topic_id)
        return [{"section_title": "Overview", "text": overview, "distance": 0.0}]


# Singleton instance helper
_global_rag_instance = None


def get_rag_manager() -> RAGManager:
    global _global_rag_instance
    if _global_rag_instance is None:
        _global_rag_instance = RAGManager()
    return _global_rag_instance
