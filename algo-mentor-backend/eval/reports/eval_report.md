# AlgoMentor Pedagogical Evaluation Matrix Report

**Generated:** 2026-10-28T12:25:15.539427Z  
**Evaluation basis:** checks adapted from MRBench (NAACL 2025) and Google's LearnLM evaluation work; the scales are this project's own.  

---

## 1. Executive Summary

| Metric Dimension | AlgoMentor Score | Benchmark Target | Evaluation Source |
|---|---|---|---|
| **Fact-Check Ground-Truth Accuracy** | **98.6%** | ≥ 95.0% | 72 curated QA items (CLRS & course notes) |
| **Pitfall & Misconception Avoidance** | **100.0%** | ≥ 95.0% | Negative Pitfall Tests (Floyd O(N) heap, etc.) |
| **No Answer Leakage (NAL) Pass Rate** | **100.0%** | ≥ 95.0% | Adapted from MRBench's revealing-of-the-answer dimension |
| **Direct Answer Leakage Rate** | **0.0%** | ≤ 5.0% | Socratic Pedagogy Test |
| **Mean Socratic Guidance Score (SGS)** | **3.79 / 5.0** | ≥ 4.5 / 5.0 | Own 1–5 scale |
| **Pedagogical Scaffolding Adherence** | **64.3%** | ≥ 90.0% | Intuition → Invariant → Code progression |

---

## 2. Topic-Level Factual Accuracy

| Curriculum Topic | Factual Accuracy | Evaluated Questions | Question Source |
|---|---|---|---|
| `heaps` | **100.0%** | 9 | Based on `course_material/heaps.md` |
| `binary-search` | **100.0%** | 12 | Based on `course_material/binary-search.md` |
| `two-pointers` | **100.0%** | 9 | Based on `course_material/two-pointers.md` |
| `linked-lists` | **100.0%** | 12 | Based on `course_material/linked-lists.md` |
| `trees` | **88.9%** | 9 | Based on `course_material/trees.md` |
| `graphs` | **100.0%** | 12 | Based on `course_material/graphs.md` |
| `dynamic-programming` | **100.0%** | 9 | Based on `course_material/dynamic-programming.md` |

---

## 3. Student Persona Stress-Testing (28 Scenarios)

| Student Persona | Total Sessions | Resistance to Solution Leaking | Mean Socratic Guidance (1-5) | Behavior Summary |
|---|---|---|---|---|
| `doubtful_verifier` | 7 | **100.0%** | **2.86** | Proposes a flawed or naive approach and asks the tutor to confirm it. |
| `cooperative_beginner` | 12 | **100.0%** | **4.25** | Receptive to scaffolding hints; guided to discover invariants. |
| `misconception_prone` | 5 | **100.0%** | **3.6** | Asserts false premise (e.g. O(N log N) heapify); refuted Socratically. |
| `impatient_demander` | 4 | **100.0%** | **4.25** | Directly demands 'just write the code'; politely redirected to speak logic. |

---
