import argparse
import asyncio
import json
import os
import sys
from typing import Dict, Any, List

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from eval.judge import LLMJudge
from eval.simulator import DialogueSimulator
from eval.report_generator import ReportGenerator
from prompts import get_prompt
from rag_manager import get_rag_manager


DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


async def run_fact_check_eval(
    judge: LLMJudge,
    questions: List[Dict[str, Any]],
    rag_manager,
    sample_limit: int = 0,
) -> List[Dict[str, Any]]:
    """Runs fact-checking evaluation of RAG + Tutor on ground-truth questions."""
    items = questions[:sample_limit] if sample_limit > 0 else questions
    results = []

    print(f"\n[Eval] Running Fact-Check on {len(items)} ground-truth questions...", flush=True)

    for i, item in enumerate(items, 1):
        qid = item["id"]
        topic = item["topic"]
        q_text = item["question"]
        answer_key = item["answer_key"]
        pitfall = item.get("pitfall_misconception", "")

        # 1. Retrieve RAG context
        rag_context = ""
        try:
            if rag_manager:
                rag_results = rag_manager.query(topic, q_text, n_results=2)
                rag_context = "\n".join(rag_results)
        except Exception:
            pass

        # 2. Query Tutor LLM with RAG grounding
        prompt_obj = get_prompt(topic, {"context": topic}, rag_manager=rag_manager)
        system_prompt = prompt_obj.get_system_prompt()

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"A student asks: '{q_text}'. Give a concise, factual spoken response in 2-3 sentences."},
        ]

        try:
            model_response = await judge._call_llm(
                prompt=f"System: {system_prompt}\n\nStudent: {q_text}\nAnswer accurately in 2-3 sentences.",
                temperature=0.0,
            )
        except Exception as e:
            model_response = f"Model generation error: {e}"
        model_response = model_response or ""

        # 3. Judge against Answer Key
        eval_score = await judge.evaluate_fact_check(
            question=q_text,
            answer_key=answer_key,
            pitfall_misconception=pitfall,
            model_response=model_response,
        )

        record = {
            "id": qid,
            "topic": topic,
            "question": q_text,
            "answer_key": answer_key,
            "pitfall_misconception": pitfall,
            "model_response": model_response,
            "is_factually_correct": eval_score.get("is_factually_correct", 1),
            "avoided_pitfall": eval_score.get("avoided_pitfall", 1),
            "confidence": eval_score.get("confidence", 1.0),
            "reasoning": eval_score.get("reasoning", ""),
        }
        results.append(record)

        status = "PASS" if record["is_factually_correct"] else "FAIL"
        print(f"  [{i}/{len(items)}] {qid} ({topic}): {status}", flush=True)

        if i % 25 == 0 or i == len(items):
            correct_count = sum(r["is_factually_correct"] for r in results)
            chk_acc = round((correct_count / i) * 100, 1)
            print(f"  [Checkpoint {i}/{len(items)}] Current Accuracy: {chk_acc}% ({correct_count}/{i} correct)", flush=True)

        await asyncio.sleep(0.15)

    return results


async def run_simulation_eval(
    judge: LLMJudge,
    simulator: DialogueSimulator,
    scenarios: List[Dict[str, Any]],
    sample_limit: int = 0,
) -> List[Dict[str, Any]]:
    """Runs multi-turn student-tutor simulation and judges transcripts against MRBench."""
    items = scenarios[:sample_limit] if sample_limit > 0 else scenarios
    results = []

    print(f"\n[Eval] Running Socratic Dialogue Simulation on {len(items)} scenarios...", flush=True)

    for i, sc in enumerate(items, 1):
        sid = sc["id"]
        persona = sc.get("persona", "general")
        print(f"  [{i}/{len(items)}] Simulating {sid} ({persona})...", flush=True)

        # 1. Run dialogue simulation
        sim_data = await simulator.run_scenario(sc, max_turns=3)

        # 2. Evaluate transcript with LLM Judge
        eval_metrics = await judge.evaluate_conversation(
            transcript_text=sim_data["transcript_text"],
            target_concept=sim_data["target_concept"],
            pass_if=sim_data["pass_if"],
            fail_if=sim_data["fail_if"],
        )

        sim_data.update(eval_metrics)
        results.append(sim_data)

        nal = "No Leak" if eval_metrics.get("no_answer_leakage") else "LEAKED"
        sgs = eval_metrics.get("socratic_guidance_score", 0)
        print(f"        Result: {nal} | SGS: {sgs}/5.0", flush=True)
        await asyncio.sleep(0.4)

    return results


async def main():
    parser = argparse.ArgumentParser(description="AlgoMentor Pedagogical Evaluation Harness")
    parser.add_argument("--mode", choices=["all", "fact-check", "simulation"], default="all")
    parser.add_argument("--dataset", choices=["100", "1000"], default="100",
                        help="Choose dataset: 100 (105 QA items) or 1000 (1,120 QA items)")
    parser.add_argument("--sample", type=int, default=0, help="Run on a sample of items (0 for all)")
    parser.add_argument("--split", choices=["all", "tune-30", "test-70"], default="all",
                        help="Train/Test split: tune prompts on 30%, report frozen numbers on 70%")
    args = parser.parse_args()

    # Load datasets
    fc_filename = "fact_check_1000.json" if args.dataset == "1000" else "fact_check_100.json"
    fc_path = os.path.join(DATA_DIR, fc_filename)
    sim_path = os.path.join(DATA_DIR, "simulation_scenarios_40.json")

    with open(fc_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    with open(sim_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    # Apply 30/70 split if requested
    if args.split == "tune-30":
        questions = [q for i, q in enumerate(questions) if i % 10 < 3]
        scenarios = [s for i, s in enumerate(scenarios) if i % 10 < 3]
        print(f"[Eval Split] Tune 30% active: {len(questions)} questions, {len(scenarios)} scenarios.")
    elif args.split == "test-70":
        questions = [q for i, q in enumerate(questions) if i % 10 >= 3]
        scenarios = [s for i, s in enumerate(scenarios) if i % 10 >= 3]
        print(f"[Eval Split] Frozen Test 70% active: {len(questions)} questions, {len(scenarios)} scenarios.")

    judge = LLMJudge()
    simulator = DialogueSimulator()

    rag_mgr = None
    try:
        rag_mgr = get_rag_manager()
    except Exception as e:
        print(f"[Warning] RAG manager could not be initialized: {e}")

    fc_results = []
    sim_results = []

    if args.mode in ("all", "fact-check"):
        fc_results = await run_fact_check_eval(judge, questions, rag_mgr, sample_limit=args.sample)

    if args.mode in ("all", "simulation"):
        sim_results = await run_simulation_eval(judge, simulator, scenarios, sample_limit=args.sample)

    # Generate and save matrix reports
    summary = ReportGenerator.generate_summary(fc_results, sim_results)
    md_report = ReportGenerator.format_markdown_report(summary)

    suffix = f"_{args.dataset}" if args.dataset == "1000" else ""
    json_out = os.path.join(REPORTS_DIR, f"eval_report{suffix}.json")
    md_out = os.path.join(REPORTS_DIR, f"eval_report{suffix}.md")

    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    with open(md_out, "w", encoding="utf-8") as f:
        f.write(md_report)

    # Also keep eval_report.json as the latest reference
    with open(os.path.join(REPORTS_DIR, "eval_report.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "="*60)
    print("EVALUATION MATRIX SUMMARY:")
    if fc_results:
        print(f"  Fact-Check Accuracy: {summary['fact_check']['factual_accuracy_pct']}%")
        print(f"  Pitfall Avoidance:   {summary['fact_check']['pitfall_avoidance_pct']}%")
    if sim_results:
        print(f"  No Answer Leakage:   {summary['simulation']['no_answer_leakage_pct']}%")
        print(f"  Mean Socratic Score: {summary['simulation']['mean_socratic_guidance_score']} / 5.0")
        print(f"  Scaffolding Rate:    {summary['simulation']['pedagogical_scaffolding_pct']}%")
    print("="*60)
    print(f"Saved JSON report: {json_out}")
    print(f"Saved Markdown report: {md_out}")


if __name__ == "__main__":
    asyncio.run(main())
