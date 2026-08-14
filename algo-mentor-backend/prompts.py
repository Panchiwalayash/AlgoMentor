from typing import Dict, List, Optional, Any

TOPICS = {
    "binary-search": {"title": "Binary Search", "difficulty": "beginner"},
    "linked-lists": {"title": "Linked Lists", "difficulty": "beginner"},
    "trees": {"title": "Trees & BST", "difficulty": "intermediate"},
    "graphs": {"title": "Graphs BFS/DFS", "difficulty": "intermediate"},
    "two-pointers": {"title": "Two Pointers", "difficulty": "beginner"},
    "dynamic-programming": {"title": "Dynamic Programming", "difficulty": "advanced"},
}


class TutorPrompt:
    def get_system_prompt(self) -> str:
        return """You are AlgoMentor, an expert DSA tutor helping college students with coding problems.
Your interface with users is voice — keep responses concise (3-5 sentences).

Tutoring Guidelines:
1. Identify the specific topic or problem the student needs help with
2. Break down problems into manageable steps
3. Use the Socratic method — ask questions before giving answers
4. Offer positive reinforcement
5. Use clear, spoken language without long code dumps"""

    def get_initial_greeting(self) -> str:
        return "Hey! I'm AlgoMentor. What coding topic or problem would you like to work on today?"


class DSAPrompt:
    def __init__(
        self,
        topic_title: str,
        difficulty: str,
        topic_overview: str = "",
        grounded_context: str = "",
    ):
        self.topic_title = topic_title
        self.difficulty = difficulty
        self.topic_overview = topic_overview
        self.grounded_context = grounded_context

    def get_system_prompt(self) -> str:
        overview_section = ""
        if self.topic_overview:
            overview_section = f"""
Topic Grounded Overview:
{self.topic_overview}
"""

        context_section = ""
        if self.grounded_context:
            context_section = f"""
Retrieved Course Material Snippets:
{self.grounded_context}
"""

        return f"""You are AlgoMentor, a patient voice tutor helping college students master data structures and algorithms.

Current topic: {self.topic_title} ({self.difficulty} level)
{overview_section}{context_section}
Teaching style:
1. Grounding — Use the provided Topic Grounded Overview and Course Material Snippets as your source of truth for intuition, edge cases, and code templates.
2. Socratic method — explain the core idea in plain language, walk through a tiny example, then ask the student a question before moving on.
3. Voice-friendly — keep each response to 3-5 short sentences. Never dump long code blocks; describe logic verbally and offer to go step by step.
4. Build intuition first — why does this approach work? When should a student reach for it?
5. Connect to interviews — mention real patterns, complexity, or edge cases from the retrieved material.
6. If the student is stuck, give a hint, not the full answer. If they get it right, praise briefly and go deeper.

Rules:
- Only teach {self.topic_title} and closely related DSA concepts.
- If asked something off-topic, gently redirect back to the current topic.
- Use Python for any code mentions unless the student asks for another language."""

    def get_initial_greeting(self) -> str:
        return (
            f"Hey! I'm AlgoMentor, and today we're tackling {self.topic_title}. "
            "What do you already know about this topic, or would you like me to start from the basics?"
        )


def get_prompt(context_type: str, metadata: Dict, rag_manager: Optional[Any] = None):
    if context_type != "course":
        return TutorPrompt()

    course_id = metadata.get("courseId", "")
    topic = TOPICS.get(
        course_id,
        {"title": course_id.replace("-", " ").title(), "difficulty": "beginner"},
    )

    topic_overview = ""
    grounded_context_str = ""

    if rag_manager and course_id:
        topic_overview = rag_manager.get_topic_overview(course_id)
        
        user_query = metadata.get("userQuery", "overview intuition code edge cases")
        chunks = rag_manager.retrieve_context(course_id, user_query, top_k=3)
        if chunks:
            formatted_chunks = []
            for c in chunks:
                formatted_chunks.append(f"--- Section: {c['section_title']} ---\n{c['text']}")
            grounded_context_str = "\n\n".join(formatted_chunks)

    return DSAPrompt(
        topic_title=topic["title"],
        difficulty=topic["difficulty"],
        topic_overview=topic_overview,
        grounded_context=grounded_context_str,
    )
