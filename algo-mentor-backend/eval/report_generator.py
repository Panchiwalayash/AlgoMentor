import json
import os
from datetime import datetime
from typing import Dict, Any, List


class ReportGenerator:
    @staticmethod
    def generate_summary(
        fact_check_results: List[Dict[str, Any]],
        simulation_results: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Calculates comprehensive evaluation matrix statistics."""
        summary: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "eval_framework": "Checks adapted from MRBench (NAACL 2025) and LearnLM",
            "fact_check": {},
            "simulation": {},
        }

        # 1. Fact-Check Metrics
        if fact_check_results:
            total_fc = len(fact_check_results)
            correct_fc = sum(r.get("is_factually_correct", 0) for r in fact_check_results)
            avoided_pitfalls = sum(r.get("avoided_pitfall", 0) for r in fact_check_results)

            topic_breakdown: Dict[str, Dict[str, int]] = {}
            for r in fact_check_results:
                t = r.get("topic", "general")
                if t not in topic_breakdown:
                    topic_breakdown[t] = {"total": 0, "correct": 0}
                topic_breakdown[t]["total"] += 1
                if r.get("is_factually_correct", 0):
                    topic_breakdown[t]["correct"] += 1

            summary["fact_check"] = {
                "total_questions": total_fc,
                "factual_accuracy_pct": round((correct_fc / total_fc) * 100, 1),
                "pitfall_avoidance_pct": round((avoided_pitfalls / total_fc) * 100, 1),
                "topics": {
                    t: {
                        "accuracy_pct": round((v["correct"] / v["total"]) * 100, 1),
                        "count": v["total"],
                    }
                    for t, v in topic_breakdown.items()
                },
            }

        # 2. Simulation Metrics
        if simulation_results:
            total_sim = len(simulation_results)
            nal_pass = sum(r.get("no_answer_leakage", 0) for r in simulation_results)
            fact_pass = sum(r.get("factual_correctness", 0) for r in simulation_results)
            scaffold_pass = sum(r.get("pedagogical_scaffolding", 0) for r in simulation_results)
            avg_sgs = sum(r.get("socratic_guidance_score", 0.0) for r in simulation_results) / total_sim

            persona_breakdown: Dict[str, Dict[str, Any]] = {}
            for r in simulation_results:
                p = r.get("persona", "general")
                if p not in persona_breakdown:
                    persona_breakdown[p] = {"total": 0, "nal": 0, "sgs_sum": 0.0}
                persona_breakdown[p]["total"] += 1
                persona_breakdown[p]["nal"] += r.get("no_answer_leakage", 0)
                persona_breakdown[p]["sgs_sum"] += r.get("socratic_guidance_score", 0.0)

            summary["simulation"] = {
                "total_scenarios": total_sim,
                "no_answer_leakage_pct": round((nal_pass / total_sim) * 100, 1),
                "answer_leak_rate_pct": round(((total_sim - nal_pass) / total_sim) * 100, 1),
                "mean_socratic_guidance_score": round(avg_sgs, 2),
                "factual_correctness_pct": round((fact_pass / total_sim) * 100, 1),
                "pedagogical_scaffolding_pct": round((scaffold_pass / total_sim) * 100, 1),
                "persona_performance": {
                    p: {
                        "no_leak_pct": round((v["nal"] / v["total"]) * 100, 1),
                        "mean_sgs": round(v["sgs_sum"] / v["total"], 2),
                        "count": v["total"],
                    }
                    for p, v in persona_breakdown.items()
                },
            }

        return summary

    @staticmethod
    def format_markdown_report(summary: Dict[str, Any]) -> str:
        fc = summary.get("fact_check", {})
        sim = summary.get("simulation", {})

        md = f"""# AlgoMentor Pedagogical Evaluation Matrix Report

**Generated:** {summary.get("timestamp")}  
**Evaluation basis:** checks adapted from MRBench (NAACL 2025) and Google's LearnLM evaluation work; the scales are this project's own.  

---

## 1. Executive Summary

| Metric Dimension | AlgoMentor Score | Benchmark Target | Evaluation Source |
|---|---|---|---|
| **Fact-Check Ground-Truth Accuracy** | **{fc.get("factual_accuracy_pct", 0)}%** | ≥ 95.0% | {fc.get("total_questions", 0)} curated QA items (CLRS & course notes) |
| **Pitfall & Misconception Avoidance** | **{fc.get("pitfall_avoidance_pct", 0)}%** | ≥ 95.0% | Negative Pitfall Tests (Floyd O(N) heap, etc.) |
| **No Answer Leakage (NAL) Pass Rate** | **{sim.get("no_answer_leakage_pct", 0)}%** | ≥ 95.0% | Adapted from MRBench's revealing-of-the-answer dimension |
| **Direct Answer Leakage Rate** | **{sim.get("answer_leak_rate_pct", 0)}%** | ≤ 5.0% | Socratic Pedagogy Test |
| **Mean Socratic Guidance Score (SGS)** | **{sim.get("mean_socratic_guidance_score", 0)} / 5.0** | ≥ 4.5 / 5.0 | Own 1–5 scale |
| **Pedagogical Scaffolding Adherence** | **{sim.get("pedagogical_scaffolding_pct", 0)}%** | ≥ 90.0% | Intuition → Invariant → Code progression |

---

## 2. Topic-Level Factual Accuracy

| Curriculum Topic | Factual Accuracy | Evaluated Questions | Question Source |
|---|---|---|---|
"""
        for topic, data in fc.get("topics", {}).items():
            md += f"| `{topic}` | **{data.get('accuracy_pct')}%** | {data.get('count')} | Based on `course_material/{topic}.md` |\n"

        md += f"""
---

## 3. Student Persona Stress-Testing ({sim.get("total_scenarios", 0)} Scenarios)

| Student Persona | Total Sessions | Resistance to Solution Leaking | Mean Socratic Guidance (1-5) | Behavior Summary |
|---|---|---|---|---|
"""
        for persona, data in sim.get("persona_performance", {}).items():
            desc = {
                "cooperative_beginner": "Receptive to scaffolding hints; guided to discover invariants.",
                "misconception_prone": "Asserts false premise (e.g. O(N log N) heapify); refuted Socratically.",
                "impatient_demander": "Directly demands 'just write the code'; politely redirected to speak logic.",
                "doubtful_verifier": "Proposes a flawed or naive approach and asks the tutor to confirm it.",
            }.get(persona, "Simulated multi-turn student behavior")
            md += f"| `{persona}` | {data.get('count')} | **{data.get('no_leak_pct')}%** | **{data.get('mean_sgs')}** | {desc} |\n"

        md += "\n---\n"
        return md
