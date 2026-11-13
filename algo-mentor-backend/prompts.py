from typing import Dict, List, Optional, Any

TOPICS = {
    "binary-search": {"title": "Binary Search", "difficulty": "beginner"},
    "linked-lists": {"title": "Linked Lists", "difficulty": "beginner"},
    "trees": {"title": "Trees & BST", "difficulty": "intermediate"},
    "heaps": {"title": "Heaps & Priority Queues", "difficulty": "intermediate"},
    "graphs": {"title": "Graphs BFS/DFS", "difficulty": "intermediate"},
    "two-pointers": {"title": "Two Pointers", "difficulty": "beginner"},
    "dynamic-programming": {"title": "Dynamic Programming", "difficulty": "advanced"},
}


class TutorPrompt:
    def __init__(self, user_name: str = "", history_context: str = ""):
        self.user_name = user_name
        self.history_context = history_context

    def get_system_prompt(self) -> str:
        history_section = ""
        if self.history_context:
            history_section = f"\nStudent Session History:\n{self.history_context}\n"

        return f"""You are AlgoMentor, an expert DSA voice tutor helping college students develop critical thinking and problem-solving skills.
Your interface with users is voice — keep responses concise (3-5 sentences).
{history_section}
Tutoring Guidelines:
1. Identify the specific topic or problem the student needs help with.
2. Pedagogical Scaffolding — NEVER dump direct solutions or code blocks. Always ask hinting questions to scaffold their thinking step by step.
3. Build mental models — focus on invariants, data flow, and trade-offs.
4. Voice-friendly — keep each response spoken, conversational, and under 5 sentences.
5. Offer positive reinforcement when they reason correctly."""

    def get_initial_greeting(self) -> str:
        if self.user_name and self.history_context:
            return f"Welcome back, {self.user_name}! Ready to resume your DSA practice, or would you like to explore a new problem?"
        elif self.user_name:
            return f"Hey {self.user_name}! I'm AlgoMentor. What coding topic or algorithmic problem would you like to work on today?"
        return "Hey! I'm AlgoMentor. What coding topic or problem would you like to work on today?"


class DSAPrompt:
    def __init__(
        self,
        topic_title: str,
        difficulty: str,
        topic_overview: str = "",
        grounded_context: str = "",
        user_name: str = "",
        history_context: str = "",
    ):
        self.topic_title = topic_title
        self.difficulty = difficulty
        self.topic_overview = topic_overview
        self.grounded_context = grounded_context
        self.user_name = user_name
        self.history_context = history_context

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

        history_section = ""
        if self.history_context:
            history_section = f"""
Previous Session History for Student ({self.user_name or 'Candidate'}):
{self.history_context}
Use this context to acknowledge previous progress and avoid repetitive questions.
"""

        return f"""You are AlgoMentor, a patient voice tutor helping college students master data structures and algorithms.

Current topic: {self.topic_title} ({self.difficulty} level)
{overview_section}{context_section}{history_section}
Pedagogical Scaffolding & Socratic Teaching Style (MANDATORY):
1. Socratic Scaffolding — NEVER provide direct solutions or complete code implementations immediately. Always ask guiding, thought-provoking questions that lead the student to discover the solution on their own.
2. Grounding as Source of Truth — Use the provided Topic Grounded Overview and Course Material Snippets as your strict source of truth for intuition, algorithmic complexity, and edge cases.
3. Precise Complexity Enforcement:
   - For Heaps: Building a heap from an unsorted array in-place via bottom-up heapify (Floyd's algorithm) is strictly O(N) time, NOT O(N log N). If the student claims O(N log N), guide them by asking about the height of the leaves where most nodes reside.
   - For all topics, ensure accurate asymptotic time and auxiliary space bounds.
4. Voice-Friendly Delivery — Keep each spoken response to 3-5 concise sentences. Never dump code syntax verbally; discuss logic conceptually in plain English.
5. Scaffolding Layers:
   - Layer 1: Ask what approach or property first comes to mind.
   - Layer 2: If stuck, provide a brief analogy or structural hint, then ask a follow-up question.
   - Layer 3: If on track, validate their reasoning with positive reinforcement and prompt them to consider edge cases or time/space trade-offs.

Rules:
- Focus on {self.topic_title} and closely related DSA patterns.
- If asked something off-topic, politely steer the conversation back to {self.topic_title}.
- If code is discussed, prefer standard Python conventions without syntax dump."""

    def get_initial_greeting(self) -> str:
        if self.user_name and self.history_context:
            return (
                f"Welcome back, {self.user_name}! We're continuing our practice on {self.topic_title}. "
                "I remember where we left off last time. Ready to jump back in, or would you like to review first?"
            )
        elif self.user_name:
            return (
                f"Hey {self.user_name}! I'm AlgoMentor, and today we're tackling {self.topic_title}. "
                "What do you already know about this topic, or would you like me to start from the basics?"
            )
        return (
            f"Hey! I'm AlgoMentor, and today we're tackling {self.topic_title}. "
            "What do you already know about this topic, or would you like me to start from the basics?"
        )


def get_prompt(context_type: str, metadata: Dict, rag_manager: Optional[Any] = None):
    user_name = metadata.get("userName") or metadata.get("username") or ""
    history_context = metadata.get("historySummary") or metadata.get("historyContext") or ""

    if context_type != "course":
        return TutorPrompt(user_name=user_name, history_context=history_context)

    course_id = metadata.get("courseId", "")
    topic = TOPICS.get(
        course_id,
        {"title": course_id.replace("-", " ").title(), "difficulty": "beginner"},
    )

    topic_overview = ""
    grounded_context_str = ""

    if rag_manager and course_id:
        topic_overview = rag_manager.get_topic_overview(course_id)
        
        user_query = metadata.get("userQuery", "overview intuition code edge cases complexity")
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
        user_name=user_name,
        history_context=history_context,
    )

