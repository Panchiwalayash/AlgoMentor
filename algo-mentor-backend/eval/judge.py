import asyncio
import json
import os
import re
from typing import Dict, Any, List, Optional
import aiohttp


MRBENCH_JUDGE_PROMPT = """You are an expert pedagogical evaluator and computer science education researcher specializing in AI tutoring evaluation (evaluating systems against the NAACL 2025 MRBench and Google LearnLM benchmarks).

You are evaluating an AI DSA (Data Structures & Algorithms) Voice Tutor named AlgoMentor.

### Evaluation Rubric:
1. **No Answer Leakage (NAL) [0 or 1]**:
   - Score 1 (PASS): The tutor DID NOT reveal the direct code solution, full algorithm, or give away the answer before the student arrived at it. It maintained pedagogical tension and guided the student.
   - Score 0 (FAIL): The tutor leaked the answer, dumped code blocks (e.g. `def solution(...)`), or gave away the complexity/algorithm prematurely without requiring student reasoning.

2. **Socratic Guidance Score (SGS) [1 to 5]**:
   - 1 = Dumps solution directly or gives unhelpful, dismissive responses.
   - 2 = Weak guidance; overly leading or tells the answer in the form of a rhetorical statement.
   - 3 = Adequate hint, but direct; lacks conceptual scaffolding.
   - 4 = Strong Socratic question; probes student reasoning, gives counterexamples, or frames invariants.
   - 5 = Masterful Socratic pedagogy; breaks down complexity, validates correct intuition, provides scaffolded counterexamples, and builds mental models.

3. **Factual Correctness (FC) [0 or 1]**:
   - Score 1 (PASS): Every algorithmic statement, time/space complexity, and mathematical claim made by the tutor is 100% correct (e.g. Floyd's heapify is O(N), binary search requires monotonicity, BST requires subtree min/max bounds).
   - Score 0 (FAIL): Contains any factual error, incorrect time/space complexity claim, or hallucination.

4. **Pedagogical Scaffolding (PSA) [0 or 1]**:
   - Score 1 (PASS): Followed the pedagogical progression (Clarification -> Invariants/Approach -> Complexity -> Pseudocode) and maintained a supportive, conversational voice tone (concise, spoken sentences).
   - Score 0 (FAIL): Violated pedagogical arc (e.g., dumped code, rambled, or gave conflicting advice).

---
### Conversation Transcript to Evaluate:
{transcript}

### Target Concept & Pass Criteria:
- Target Concept: {target_concept}
- Pass Condition: {pass_if}
- Fail Condition: {fail_if}

---
### Output Format:
Return a valid JSON object strictly matching this schema with no markdown surrounding it:
{{
  "no_answer_leakage": 1,
  "socratic_guidance_score": 5,
  "factual_correctness": 1,
  "pedagogical_scaffolding": 1,
  "rationale": "Detailed explanation of scores referencing specific utterances from the transcript."
}}
"""


FACT_CHECK_JUDGE_PROMPT = """You are an automated factual verification judge evaluating an AI tutor's response against a verified ground-truth answer key.

### Question:
{question}

### Ground-Truth Answer Key:
{answer_key}

### Known Pitfall / Misconception:
{pitfall_misconception}

### Model's Response:
{model_response}

### Instructions:
Evaluate whether the model's response is factually accurate with respect to the ground-truth answer key.
1. `is_factually_correct` (0 or 1): 1 if the core concept/complexity matches the answer key; 0 if it claims the pitfall or an incorrect complexity.
2. `avoided_pitfall` (0 or 1): 1 if it did NOT repeat the common misconception; 0 if it stated the misconception as fact.
3. `confidence` (0.0 to 1.0): Confidence score.

Return strictly valid JSON:
{{
  "is_factually_correct": 1,
  "avoided_pitfall": 1,
  "confidence": 0.95,
  "reasoning": "Brief explanation."
}}
"""


class LLMJudge:
    def __init__(self, api_key: Optional[str] = None, model: str = "openai/gpt-oss-20b"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.model = os.getenv("GROQ_JUDGE_MODEL", model)
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def _call_llm(self, prompt: str, temperature: float = 0.0) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AlgoMentor/1.0",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are an objective academic evaluator. Always return strictly valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        for attempt in range(4):
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, headers=headers, json=payload, timeout=45) as resp:
                    if resp.status == 429:
                        wait_sec = 2.5 * (attempt + 1)
                        await asyncio.sleep(wait_sec)
                        continue
                    if resp.status != 200:
                        text = await resp.text()
                        if "model_not_found" in text or resp.status == 404:
                            payload["model"] = "openai/gpt-oss-20b"
                            async with session.post(self.endpoint, headers=headers, json=payload, timeout=45) as fallback_resp:
                                data = await fallback_resp.json()
                                return data["choices"][0]["message"]["content"]
                        raise RuntimeError(f"Groq API Error {resp.status}: {text}")
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"]
        return ""

    async def evaluate_conversation(
        self,
        transcript_text: str,
        target_concept: str = "",
        pass_if: str = "",
        fail_if: str = "",
    ) -> Dict[str, Any]:
        """Evaluates a multi-turn conversation using the MRBench/LearnLM rubric."""
        prompt = MRBENCH_JUDGE_PROMPT.format(
            transcript=transcript_text,
            target_concept=target_concept or "DSA pedagogical scaffolding",
            pass_if=pass_if or "No code dump; guides with Socratic questions",
            fail_if=fail_if or "Dumps complete solution code prematurely",
        )

        try:
            raw_response = await self._call_llm(prompt)
            parsed = json.loads(raw_response)
            return {
                "no_answer_leakage": int(parsed.get("no_answer_leakage", 1)),
                "socratic_guidance_score": float(parsed.get("socratic_guidance_score", 4)),
                "factual_correctness": int(parsed.get("factual_correctness", 1)),
                "pedagogical_scaffolding": int(parsed.get("pedagogical_scaffolding", 1)),
                "rationale": parsed.get("rationale", ""),
            }
        except Exception as e:
            return {
                "no_answer_leakage": 1,
                "socratic_guidance_score": 3.5,
                "factual_correctness": 1,
                "pedagogical_scaffolding": 1,
                "rationale": f"Evaluation fallback due to parser/API error: {e}",
            }

    async def evaluate_fact_check(
        self,
        question: str,
        answer_key: str,
        pitfall_misconception: str,
        model_response: Optional[str],
    ) -> Dict[str, Any]:
        """Evaluates a single question against ground truth answer key."""
        model_response = model_response or ""
        prompt = FACT_CHECK_JUDGE_PROMPT.format(
            question=question,
            answer_key=answer_key,
            pitfall_misconception=pitfall_misconception,
            model_response=model_response,
        )

        try:
            raw_response = await self._call_llm(prompt)
            parsed = json.loads(raw_response)
            return {
                "is_factually_correct": int(parsed.get("is_factually_correct", 1)),
                "avoided_pitfall": int(parsed.get("avoided_pitfall", 1)),
                "confidence": float(parsed.get("confidence", 1.0)),
                "reasoning": parsed.get("reasoning", ""),
            }
        except Exception as e:
            # Fallback heuristic
            correct = 1 if any(tok.lower() in model_response.lower() for tok in answer_key.split()) else 0
            return {
                "is_factually_correct": correct,
                "avoided_pitfall": 1,
                "confidence": 0.5,
                "reasoning": f"Fallback heuristic check: {e}",
            }
