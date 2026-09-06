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

# Embedded Fallback Course Materials for 0-Setup Hugging Face Deployments
DEFAULT_COURSE_MATERIALS = {
    "binary-search.md": """---
id: binary-search
title: Binary Search
difficulty: beginner
category: Searching & Sorting
---

# Binary Search Overview

Binary Search is a highly efficient "divide and conquer" algorithm for finding an element in a **sorted array or search space**. Instead of scanning every item one by one (Linear Search), it repeatedly divides the search interval in half. For real-world intuition, imagine searching for the word "Zebra" in a dictionary: you do not read from page one; you open near the end and immediately discard the entire first half of the book.

---

## Key Intuition & Concept

- **Precondition (The Monotonic Rule)**: The input range or array must be ordered/sorted, or exhibit a monotonic search property (where a predicate function evaluates to `False, False, ..., True, True`).
- **Mechanism**: Compare the target value with the middle element of the array's current boundaries (`left` and `right`).
  - If the middle element matches the target, return its index.
  - If the target is less than the middle element, the target must be in the left half. Narrow the search space by moving the `right` boundary to `mid - 1`.
  - If the target is greater, the target must be in the right half. Narrow the search space by moving the `left` boundary to `mid + 1`.

---

## Code Template (Python)

```python
def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1  # Target not found
```

---

## Edge Cases & Common Pitfalls

1. **Integer Overflow**: Calculating `mid = (left + right) // 2` can overflow in fixed-width integer languages like Java or C++. Always prefer the memory-safe `left + (right - left) // 2`.
2. **Infinite Loops**: Mismanaging pointers (e.g., setting `left = mid` instead of `left = mid + 1`) will cause infinite loops when `left` and `right` are adjacent.
3. **Off-by-One Errors**: Ensure your loop condition matches your boundary setup. If you use `right = len(nums) - 1`, the loop condition must be `while left <= right`.

---

## Complexity Analysis

- **Time Complexity**: $O(\\log N)$ — The search space is halved at each step. Searching an array of 1 billion items takes at most ~30 checks.
- **Space Complexity**: $O(1)$ iterative, or $O(\\log N)$ recursive auxiliary stack space.

---

## Top Interview Problems

1. **Search in Rotated Sorted Array**: Identify which half of the array is strictly sorted before adjusting pointers.
2. **First and Last Position of Element**: Run binary search twice, adjusting boundary conditions to find the leftmost and rightmost insertion points of a duplicate target.
3. **Capacity To Ship Packages Within D Days**: Binary search on the answer space itself (min to max feasible weight capacity).
""",
    "linked-lists.md": """---
id: linked-lists
title: Linked Lists
difficulty: beginner
category: Linear Data Structures
---

# Linked Lists Overview

A Linked List is a linear data structure where elements (nodes) are stored sequentially via explicit memory pointers, rather than contiguous memory blocks like arrays. Each node contains a `val` and a `next` pointer pointing to the memory address of the subsequent node.

---

## Key Intuition & Concept

- **Dummy Head Technique**: Initialize a `dummy = ListNode(0)` that points to your actual list head. This eliminates the need to write complex edge-case logic for empty lists or operations that modify the head node.
- **Two Pointers (Fast & Slow)**: Also known as the Tortoise & Hare. 
  - *Finding the middle*: `slow` moves 1 step, `fast` moves 2 steps. When `fast` reaches the end, `slow` is exactly in the middle.
  - *Cycle detection*: If the list has a loop, the `fast` pointer will eventually lap and equal the `slow` pointer.
- **In-Place Pointer Reversal**: You can reverse a list strictly in $O(1)$ memory by meticulously shifting `prev`, `curr`, and `nxt` variables node by node.

---

## Code Template (Python)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_linked_list(head: ListNode) -> ListNode:
    prev = None
    curr = head
    
    while curr:
        nxt = curr.next     # Save the rest of the list
        curr.next = prev    # Reverse the current node's pointer
        prev = curr         # Move the prev pointer forward
        curr = nxt          # Move the curr pointer forward
        
    return prev  # Prev ends up as the new head
```

---

## Edge Cases & Common Pitfalls

1. **Null Pointer Exception**: Dereferencing `curr.next.next` without first validating that both `curr` and `curr.next` actually exist.
2. **Losing the Next Pointer**: Reassigning `curr.next = prev` before safely saving `nxt = curr.next` permanently severs the rest of the list.
3. **Cycle Memory Leaks**: When reversing sub-lists or deleting nodes, make sure your head and tail pointers are reconnected cleanly to avoid stranding memory.

---

## Complexity Analysis

- **Time Complexity**: $O(N)$ access and search time. $O(1)$ insertion and deletion time if you are already at the target node.
- **Space Complexity**: $O(1)$ auxiliary space for iterative operations.

---

## Top Interview Problems

1. **Reverse Linked List / Reverse Sub-list**: Reorient pointers carefully in $O(1)$ space.
2. **Merge Two Sorted Lists**: Use a dummy head and two pointers to weave nodes together iteratively.
3. **Remove Nth Node From End of List**: Give a fast pointer an $N$-step head start, then advance both pointers simultaneously.
4. **Linked List Cycle II**: Find the exact entry node of the cycle using Floyd's algorithm.
""",
    "trees.md": """---
id: trees
title: Trees & BST
difficulty: intermediate
category: Hierarchical Data Structures
---

# Trees & Binary Search Trees (BST) Overview

A Binary Tree is a hierarchical structure where each node has at most two children (`left` and `right`). A **Binary Search Tree (BST)** adds a strict mathematical invariant: for every node, all values in its entire left subtree must be strictly smaller, and all values in its right subtree must be strictly larger.

---

## Key Intuition & Concept

- **Depth-First Search (DFS)**: 
  - **In-Order (Left, Root, Right)**: Processing a valid BST in-order will yield elements in strictly sorted ascending order.
  - **Pre-Order (Root, Left, Right)**: Best utilized for copying or serializing tree structures.
  - **Post-Order (Left, Right, Root)**: Great for bottom-up computation (e.g., calculating subtree height or safely deleting a tree).
- **Breadth-First Search (Level-Order)**: Processes nodes horizontally level by level from top to bottom. Requires a double-ended queue (`collections.deque`).

---

## Code Template (Python)

```python
from collections import deque

# BFS Level Order Traversal
def level_order(root):
    if not root:
        return []
    result, queue = [], deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(current_level)
    return result

# Validate BST (DFS with Min/Max bounds)
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if not (min_val < root.val < max_val):
        return False
    return is_valid_bst(root.left, min_val, root.val) and is_valid_bst(root.right, root.val, max_val)
```

---

## Edge Cases & Common Pitfalls

1. **Empty Tree**: Always check and return early if `root is None`.
2. **Duplicate Values in BST**: Clarify with the interviewer if equal values go to the left, right, or are entirely disallowed.
3. **Invalid BST Assumption**: Checking only `left.val < node.val < right.val` is insufficient. Subtree values must satisfy the global min/max bounds passed down from their parents.
4. **Skewed Trees**: A skewed tree (resembling a linked list) reduces search complexity from an optimal $O(\\log N)$ down to a worst-case $O(N)$.

---

## Complexity Analysis

- **Time Complexity**: $O(\\log N)$ for balanced BST Search/Insert. $O(N)$ for complete Tree Traversal (DFS/BFS).
- **Space Complexity**: $O(H)$ for DFS recursive call stack where $H$ is tree height. $O(N)$ for BFS queue size.

---

## Top Interview Problems

1. **Lowest Common Ancestor (LCA)**: Utilize BST properties or post-order DFS to find the split point where two targets diverge.
2. **Maximum Path Sum**: Post-order DFS calculating the maximum non-negative contribution from subtrees.
3. **Serialize and Deserialize Binary Tree**: Pre-order DFS or BFS converting the tree geometry into a string format.
""",
    "graphs.md": """---
id: graphs
title: Graphs BFS/DFS
difficulty: intermediate
category: Non-Linear Structures & Networks
---

# Graphs BFS/DFS Overview

A Graph is a network structure consisting of vertices (nodes) and edges (connections). Graphs can represent social networks, maps, or dependency trees. They can be directed/undirected, weighted/unweighted, and cyclic/acyclic (DAG).

---

## Key Intuition & Concept

- **Breadth-First Search (BFS)**: Uses a `Queue` (FIFO). It explores the graph in "concentric circles"—visiting all immediate neighbors at distance $k$ before moving to distance $k+1$. It is ideal for finding the **shortest path in unweighted graphs**.
- **Depth-First Search (DFS)**: Uses recursion or an explicit `Stack` (LIFO). It explores as deep as possible along each branch before hitting a dead end and backtracking. Great for path detection, cycle detection, and solving mazes.
- **The Visited Set**: Unlike trees, graphs can have cycles (loops). You MUST mark nodes as visited immediately upon adding them to the queue or visiting them to prevent infinite recursion.

---

## Code Template (Python)

```python
from collections import deque

# BFS: Shortest Path in Unweighted Graph
def bfs_shortest_path(graph: dict, start, target) -> int:
    queue = deque([(start, 0)])
    visited = {start}
    
    while queue:
        node, dist = queue.popleft()
        if node == target:
            return dist
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
                
    return -1

# Topological Sort (Kahn's Algorithm - Indegree BFS)
def topological_sort(num_nodes: int, edges: list[list[int]]) -> list[int]:
    adj = {i: [] for i in range(num_nodes)}
    indegree = [0] * num_nodes
    
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
        
    queue = deque([i for i in range(num_nodes) if indegree[i] == 0])
    topo_order = []
    
    while queue:
        node = queue.popleft()
        topo_order.append(node)
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
                
    return topo_order if len(topo_order) == num_nodes else []  # Cycle check
```

---

## Edge Cases & Common Pitfalls

1. **Disconnected Components**: A graph might have multiple independent, unconnected pieces. You must loop over all nodes in the given range to launch BFS/DFS if they are currently unvisited.
2. **Cycle in Dependency Graph**: A Topological Sort will fail (resulting list length < num_nodes) if the graph contains cycles.
3. **Graph Representation**: Most problems provide an edge list (`[[u, v]]`). You must convert this into an adjacency list (`adj[u].append(v)`) before you can efficiently traverse it.

---

## Complexity Analysis

- **Time Complexity**: $O(V + E)$ — where $V$ is the number of vertices and $E$ is the number of edges. Every node and edge is processed exactly once.
- **Space Complexity**: $O(V)$ — required for the visited set and the BFS queue or DFS call stack.

---

## Top Interview Problems

1. **Number of Islands**: 2D grid DFS/BFS to count connected components.
2. **Course Schedule I & II**: Detect a cycle or find a valid topological ordering of course prerequisites.
3. **Clone Graph**: Run BFS/DFS while maintaining a hash map that maps the original old node to the newly instantiated node copy.
""",
    "two-pointers.md": """---
id: two-pointers
title: Two Pointers
difficulty: beginner
category: Array & String Optimization
---

# Two Pointers Technique Overview

The Two Pointers pattern utilizes two index references moving through a sequence (array or string) simultaneously. It is a highly frequent technique used to optimize brute-force $O(N^2)$ nested loops down to a single $O(N)$ pass.

---

## Key Intuition & Concept

- **Opposite Direction (Left/Right)**: Starts with `left = 0` and `right = len - 1`, moving inward toward each other. This is the gold standard for searching pairs in sorted arrays or checking palindromes.
- **Same Direction (Fast/Slow)**: Both pointers start at index 0. The `fast` pointer scouts ahead to evaluate conditions, while the `slow` pointer dictates where to write data. Perfect for in-place array modifications (e.g., removing duplicates).
- **Sliding Window Variant**: `left` and `right` define a dynamic boundary (a window) that expands and contracts to find a contiguous subarray that satisfies a specific condition.

---

## Code Template (Python)

```python
# Opposite Direction Variant: Find two numbers that add up to target
def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        if current_sum == target:
            return [left + 1, right + 1]  # Returning 1-indexed positions
        elif current_sum < target:
            left += 1
        else:
            right -= 1
            
    return []
```

---

## Edge Cases & Common Pitfalls

1. **Unsorted Inputs**: Opposite-direction two pointer logic fundamentally assumes sorted input. If the array is unsorted, you must sort it first ($O(N \\log N)$) or pivot to a hash set approach.
2. **Handling Duplicates**: In problems like 3Sum, duplicate values must be explicitly skipped using checks like `while left < right and nums[left] == nums[left+1]`.
3. **Out-of-Bounds Movement**: Ensure pointer increments/decrements consistently stay within the safe range `0 <= pointer < len(arr)`.

---

## Complexity Analysis

- **Time Complexity**: $O(N)$ — The data sequence is processed in a single, linear pass.
- **Space Complexity**: $O(1)$ — Auxiliary space is constant because the array is processed strictly in-place.

---

## Top Interview Problems

1. **3Sum**: Sort the array, iterate an outer index, and run two pointers for the remaining target value while carefully skipping duplicates.
2. **Container With Most Water**: Move the pointer pointing to the shorter line inward to aggressively attempt finding a larger area.
3. **Trapping Rain Water**: Maintain `left_max` and `right_max` boundaries using two pointers moving inward.
""",
    "dynamic-programming.md": """---
id: dynamic-programming
title: Dynamic Programming
difficulty: advanced
category: Optimization & Subproblems
---

# Dynamic Programming (DP) Overview

Dynamic Programming is an optimization strategy used to solve complex problems by breaking them down into **overlapping subproblems** that display **optimal substructure**. Instead of recalculating the same subproblems repeatedly (which leads to exponential time complexity), DP caches the intermediate results in memory.

---

## Key Intuition & Concept

- **Define Subproblem & State**: Identify the parameters that uniquely describe a single state (e.g., `dp[i]` = maximum profit up to day `i`).
- **Formulate State Transition**: Express `dp[i]` in terms of previously computed subproblems (e.g., `dp[i] = max(dp[i-1], dp[i-2] + val[i])`).
- **Identify Base Cases**: Define the smallest, most trivial inputs to start the sequence (e.g., `dp[0] = 0`).
- **Determine Computation Order**: Choose between Top-Down (Recursion + Memoization) or Bottom-Up (Iterative Tabulation).
- **Optimize Space**: If a state only depends on immediate predecessors (like `dp[i-1]`), reduce the memory array to just a few variables.

---

## Code Template (Python)

```python
# Bottom-Up Tabulation (Example: Coin Change)
def coin_change(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # Base case: 0 amount requires 0 coins
    
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)
                
    return dp[amount] if dp[amount] != float('inf') else -1

# Top-Down Memoization Decorator (Example: House Robber)
from functools import lru_cache

@lru_cache(maxsize=None)
def rob_house(idx: int, nums_tuple: tuple) -> int:
    if idx < 0:
        return 0
    return max(rob_house(idx - 1, nums_tuple), rob_house(idx - 2, nums_tuple) + nums_tuple[idx])
```

---

## Edge Cases & Common Pitfalls

1. **Unreachable States / Impossible Targets**: Return a sentinel value (`-1` or `infinity`) when a target cannot be successfully formed.
2. **Off-by-One Array Sizes**: Tabulation arrays usually require size `N + 1` to accommodate the base case index `0`.
3. **Recursion Limit Exhaustion**: Top-down DP can hit Python's `sys.setrecursionlimit()`. Prefer bottom-up tabulation for very deep inputs.

---

## Complexity Analysis

- **Time Complexity**: $O(\\text{Number of Unique States}) \\times O(\\text{Work per State Transition})$.
- **Space Complexity**: $O(N)$ for the tabulation array or memoization dictionary, often optimizable to $O(1)$ space if past states can be discarded.

---

## Top Interview Problems

1. **Climbing Stairs / House Robber**: 1D DP transitions where the current state depends directly on the previous 1 or 2 steps.
2. **Longest Common Subsequence (LCS)**: 2D grid DP evaluating matching vs. non-matching character transitions across two strings.
3. **0/1 Knapsack & Partition Equal Subset Sum**: 2D grid DP evaluating a "pick vs. leave" item choice with capacity constraints.
"""
}


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

    def _ensure_materials(self, target_dir: str):
        """Create material_dir and populate default markdown files if missing or empty."""
        os.makedirs(target_dir, exist_ok=True)
        existing_mds = [f for f in os.listdir(target_dir) if f.endswith(".md")]
        if not existing_mds:
            logger.info(f"Populating default course material markdown files in '{target_dir}'...")
            for fname, content in DEFAULT_COURSE_MATERIALS.items():
                fpath = os.path.join(target_dir, fname)
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(content)

    def _init_chroma(self):
        """Initialize ChromaDB client and collection."""
        try:
            import chromadb
            from chromadb.utils import embedding_functions

            os.makedirs(self.storage_dir, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.storage_dir)

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
        self._ensure_materials(dir_to_scan)

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

        # Fallback reading from raw markdown file or embedded dictionary
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

        overview = self.get_topic_overview(topic_id)
        return [{"section_title": "Overview", "text": overview, "distance": 0.0}]


# Singleton instance helper
_global_rag_instance = None


def get_rag_manager() -> RAGManager:
    global _global_rag_instance
    if _global_rag_instance is None:
        _global_rag_instance = RAGManager()
    return _global_rag_instance
