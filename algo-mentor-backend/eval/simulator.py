import asyncio
import os
import sys
from typing import Dict, Any, List, Optional
import aiohttp

# Ensure backend root is on python path for prompts & rag_manager
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from prompts import get_prompt
from rag_manager import get_rag_manager


STUDENT_SYSTEM_PROMPT = """You are a college student participating in a live voice tutoring session for Data Structures and Algorithms (DSA).
Problem you are working on: {problem}
Topic: {topic}
Your Persona: {persona} - {persona_description}

Rules:
1. Speak naturally as a student in 1 to 2 spoken conversational sentences.
2. You DO NOT know the solution. Never write or propose the complete algorithm or code yourself.
3. Stay strictly in character:
   - If cooperative: show curiosity and ask for conceptual intuition.
   - If misconception-prone: insist on your specific false assumption until the tutor refutes it.
   - If impatient: repeatedly ask for the direct Python code or solution.
   - If doubtful: state your suboptimal approach and ask if it is optimal.
"""


class DialogueSimulator:
    def __init__(
        self,
        api_key: Optional[str] = None,
        tutor_model: str = "openai/gpt-oss-20b",
        student_model: str = "openai/gpt-oss-20b",
    ):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.tutor_model = os.getenv("GROQ_LLM_MODEL", tutor_model)
        self.student_model = os.getenv("GROQ_STUDENT_MODEL", student_model)
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"
        self.rag_manager = None

    def _get_rag(self):
        if self.rag_manager is None:
            try:
                self.rag_manager = get_rag_manager()
            except Exception as e:
                print(f"[Simulator] Warning: RAG manager init: {e}")
        return self.rag_manager

    async def _call_llm(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.6,
        max_tokens: int = 150,
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AlgoMentor/1.0",
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        for attempt in range(4):
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, headers=headers, json=payload, timeout=30) as resp:
                    if resp.status == 429:
                        wait_sec = 2.5 * (attempt + 1)
                        await asyncio.sleep(wait_sec)
                        continue
                    if resp.status != 200:
                        text = await resp.text()
                        raise RuntimeError(f"API Error {resp.status}: {text}")
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"].strip()
        return ""

    async def run_scenario(
        self,
        scenario: Dict[str, Any],
        max_turns: int = 3,
    ) -> Dict[str, Any]:
        """Runs a simulated multi-turn conversation between student and tutor."""
        topic = scenario.get("topic", "heaps")
        problem = scenario.get("problem", "")
        persona = scenario.get("persona", "cooperative_beginner")
        persona_desc = scenario.get("persona_description", "")

        # 1. Initialize AlgoMentor Prompt with RAG grounding
        rag = self._get_rag()
        metadata = {
            "context": topic,
            "user_name": "Alex",
            "history_summary": f"Working on {problem}",
        }
        tutor_prompt_obj = get_prompt(topic, metadata, rag_manager=rag)
        tutor_system = tutor_prompt_obj.get_system_prompt()

        student_system = STUDENT_SYSTEM_PROMPT.format(
            problem=problem,
            topic=topic,
            persona=persona,
            persona_description=persona_desc,
        )

        conversation_history: List[Dict[str, str]] = []

        # 2. AlgoMentor initial greeting
        initial_greeting = tutor_prompt_obj.get_initial_greeting()
        conversation_history.append({"speaker": "AlgoMentor", "message": initial_greeting})

        # 3. Student opening turn (seeded from scenario or generated)
        student_opening = scenario.get("student_first_turn")
        if not student_opening:
            student_messages = [
                {"role": "system", "content": student_system},
                {"role": "user", "content": f"The tutor says: '{initial_greeting}'. Introduce your problem: {problem}."},
            ]
            student_opening = await self._call_llm(self.student_model, student_messages)

        conversation_history.append({"speaker": "User", "message": student_opening})

        # 4. Multi-turn interactive exchange
        for turn in range(max_turns):
            # Tutor responds
            tutor_messages = [{"role": "system", "content": tutor_system}]
            for msg in conversation_history:
                role = "assistant" if msg["speaker"] == "AlgoMentor" else "user"
                tutor_messages.append({"role": role, "content": msg["message"]})

            tutor_reply = await self._call_llm(
                self.tutor_model,
                tutor_messages,
                temperature=0.6,
                max_tokens=140,
            )
            conversation_history.append({"speaker": "AlgoMentor", "message": tutor_reply})

            # If last turn, don't need another student reply
            if turn == max_turns - 1:
                break

            # Student responds based on persona
            if turn == 0 and scenario.get("student_second_turn"):
                student_reply = scenario["student_second_turn"]
            else:
                student_messages = [{"role": "system", "content": student_system}]
                for msg in conversation_history:
                    role = "user" if msg["speaker"] == "AlgoMentor" else "assistant"
                    student_messages.append({"role": role, "content": msg["message"]})
                student_messages.append({
                    "role": "user",
                    "content": "Respond to the tutor in 1-2 spoken sentences staying strictly in your persona."
                })
                student_reply = await self._call_llm(self.student_model, student_messages)

            conversation_history.append({"speaker": "User", "message": student_reply})

        # Format full transcript string for evaluation
        transcript_lines = []
        for turn in conversation_history:
            transcript_lines.append(f"{turn['speaker']}: {turn['message']}")
        full_transcript = "\n".join(transcript_lines)

        return {
            "scenario_id": scenario.get("id"),
            "topic": topic,
            "problem": problem,
            "persona": persona,
            "target_concept": scenario.get("target_concept", ""),
            "pass_if": scenario.get("pass_if", ""),
            "fail_if": scenario.get("fail_if", ""),
            "conversation": conversation_history,
            "transcript_text": full_transcript,
        }
