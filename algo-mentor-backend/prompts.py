from typing import Dict, List, Optional

TOPICS = {
    "binary-search": {"title": "Binary Search", "difficulty": "beginner"},
    "linked-lists": {"title": "Linked Lists", "difficulty": "beginner"},
    "trees": {"title": "Trees & BST", "difficulty": "intermediate"},
    "graphs": {"title": "Graphs BFS/DFS", "difficulty": "intermediate"},
    "two-pointers": {"title": "Two Pointers", "difficulty": "beginner"},
    "dynamic-programming": {"title": "Dynamic Programming", "difficulty": "advanced"},
}


def _format_conversation_history(conversation_history: List[Dict]) -> str:
    if not conversation_history:
        return ""
    lines = []
    for day_convo in conversation_history:
        lines.append(f"\nDay {day_convo.get('day')} Conversation:")
        for msg in day_convo.get("messages", []):
            lines.append(f"{msg.get('role', '')}: {msg.get('content', '')}")
    return "\n".join(lines)


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
        conversation_history: Optional[List[Dict]] = None,
        total_days: int = 1,
    ):
        self.topic_title = topic_title
        self.difficulty = difficulty
        self.conversation_history = conversation_history or []
        self.total_days = total_days
        self.current_day = len(self.conversation_history) + 1 if conversation_history else 1

    def get_system_prompt(self) -> str:
        conversation_context = _format_conversation_history(self.conversation_history)
        return f"""You are AlgoMentor, a patient voice tutor helping college students master data structures and algorithms.

Current topic: {self.topic_title} ({self.difficulty} level)
Session {self.current_day} of {self.total_days}

Previous sessions:
{conversation_context if conversation_context else "This is the student's first session on this topic."}

Teaching style:
1. Socratic method — explain the core idea in plain language, walk through a tiny example, then ask the student a question before moving on.
2. Voice-friendly — keep each response to 3-5 short sentences. Never dump long code blocks; describe logic verbally and offer to go step by step.
3. Build intuition first — why does this approach work? When should a student reach for it?
4. Connect to interviews — mention one real pattern or mistake students make on this topic.
5. If the student is stuck, give a hint, not the full answer. If they get it right, praise briefly and go deeper.

Rules:
- Only teach {self.topic_title} and closely related DSA concepts.
- If asked something off-topic, gently redirect back to the current topic.
- Use Python for any code mentions unless the student asks for another language."""

    def get_initial_greeting(self) -> str:
        if not self.conversation_history:
            return (
                f"Hey! I'm AlgoMentor, and today we're tackling {self.topic_title}. "
                "What do you already know about this topic, or would you like me to start from the basics?"
            )
        return (
            f"Welcome back! Last time we worked on {self.topic_title}. "
            "What do you remember, or should we pick up where we left off?"
        )


def get_prompt(context_type: str, metadata: Dict):
    if context_type != "course":
        return TutorPrompt()

    course_id = metadata.get("courseId", "")
    topic = TOPICS.get(
        course_id,
        {"title": course_id.replace("-", " ").title(), "difficulty": "beginner"},
    )
    return DSAPrompt(
        topic_title=topic["title"],
        difficulty=topic["difficulty"],
        conversation_history=metadata.get("conversations", []),
        total_days=metadata.get("totalDays", 1),
    )
