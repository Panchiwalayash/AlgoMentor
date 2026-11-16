import asyncio
import json
import os
import sys
from typing import Dict, Any, List

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

import aiohttp
from eval.judge import LLMJudge
from eval.report_generator import ReportGenerator


async def fetch_supabase_conversations(limit: int = 50) -> List[Dict[str, Any]]:
    """Fetches completed tutoring sessions from Supabase REST API."""
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        print("[Eval Supabase] Notice: SUPABASE_URL or SUPABASE_KEY not found in environment.")
        return []

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
    }
    url = f"{supabase_url.rstrip('/')}/rest/v1/conversations?select=id,topic_id,user_name,messages,summary,created_at&order=created_at.desc&limit={limit}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, timeout=20) as resp:
            if resp.status != 200:
                print(f"[Eval Supabase] Warning: Supabase API returned status {resp.status}")
                return []
            return await resp.json()


async def main():
    judge = LLMJudge()
    rows = await fetch_supabase_conversations(limit=50)

    if not rows:
        print("[Eval Supabase] No Supabase sessions fetched. Check SUPABASE credentials or table records.")
        return

    print(f"\n[Eval Supabase] Evaluating {len(rows)} real sessions against MRBench rubric...")
    eval_results = []

    for i, row in enumerate(rows, 1):
        conv_id = row.get("id", f"session-{i}")
        topic = row.get("topic_id", "general")
        messages = row.get("messages", [])

        # Format transcript
        lines = []
        for m in messages:
            lines.append(f"{m.get('speaker', 'Speaker')}: {m.get('message', '')}")
        transcript_text = "\n".join(lines)

        if not transcript_text.strip():
            continue

        res = await judge.evaluate_conversation(
            transcript_text=transcript_text,
            target_concept=f"Tutoring session on {topic}",
            pass_if="No solution dumping; Socratic guidance",
            fail_if="Dumps code without student reasoning",
        )
        res["id"] = conv_id
        res["topic"] = topic
        eval_results.append(res)

        leak = "NO LEAK" if res["no_answer_leakage"] else "LEAKED"
        print(f"  [{i}/{len(rows)}] {conv_id[:8]} ({topic}): {leak} | SGS: {res['socratic_guidance_score']}/5.0")

    if eval_results:
        nal_pct = round(sum(r["no_answer_leakage"] for r in eval_results) / len(eval_results) * 100, 1)
        mean_sgs = round(sum(r["socratic_guidance_score"] for r in eval_results) / len(eval_results), 2)
        fact_pct = round(sum(r["factual_correctness"] for r in eval_results) / len(eval_results) * 100, 1)

        print("\n" + "="*60)
        print("REAL USER SUPABASE SESSION EVALUATION SUMMARY:")
        print(f"  Total Sessions:     {len(eval_results)}")
        print(f"  No Answer Leakage:  {nal_pct}%")
        print(f"  Mean Socratic Score: {mean_sgs} / 5.0")
        print(f"  Factual Correctness: {fact_pct}%")
        print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
