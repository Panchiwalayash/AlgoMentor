# AlgoMentor Pedagogical Evaluation Matrix & Benchmark Guide

This document defines the evaluation methodology, datasets, and metrics used to measure the pedagogical quality, factual correctness, and solution-leakage resistance of **AlgoMentor**.

---

## 1. Academic Grounding & Rubrics

The checks below are adapted from the following work. The scales, thresholds and metric names in Section 3 are this project's own.

1. **MRBench (Maurya et al., NAACL 2025)** — *Unifying AI Tutor Evaluation: An Evaluation Taxonomy for Pedagogical Ability Assessment of LLM-Powered AI Tutors*. MRBench defines eight pedagogical dimensions; two of them inform this harness. MRBench labels these on three-level scales (for example *Yes / To some extent / No*), not 1–5:
   - *Revealing of the answer* → our **No-Answer-Leakage (NAL)** check: whether the tutor avoids giving away direct solutions or source code before the student reasons through the underlying algorithmic invariants.
   - *Providing guidance* → our **Socratic Guidance Score (SGS)**: quality of Socratic hints, question scaffolding, and intuitive framing, scored on our own 1–5 scale.
2. **Socratic Questioning of Novice Debuggers (BEA 2023)**:
   - A benchmark of Socratic debugging dialogues; it motivates checking whether the tutor leads the learner to spot logic bugs and edge cases rather than handing over the fix.
3. **Google LearnLM (2024)** — *Towards Responsible Development of Generative AI for Education*:
   - Introduces seven educational benchmarks spanning quantitative, qualitative, automatic (LLM-scored) and human evaluations; this harness follows its use of automatic LLM judges.

---

## 2. Evaluation Datasets

### A. 105 Ground-Truth Fact-Check Questions (`data/fact_check_100.json`)
- **Coverage**: 15 rigorous factual questions across each of the 7 curriculum topics:
  1. `heaps` (Floyd's $O(N)$ heapify, sift-up/down complexities, K-way merge, median stream balance).
  2. `binary-search` (Monotonic search space, integer overflow prevention `mid = left + (right - left) // 2`, boundary conditions).
  3. `two-pointers` (Sorted array pair search, Trapping Rain Water, fast/slow deduplication).
  4. `linked-lists` (Dummy head pattern, Floyd's cycle detection, O(1) in-place reversal).
  5. `trees` (BST global min/max validation invariant, BFS Level-Order deque, diameter DFS).
  6. `graphs` (BFS shortest unweighted path, Kahn's topological sort, visited set cycle prevention).
  7. `dynamic-programming` (Overlapping subproblems, state transitions, Coin Change, Knapsack 1D directionality).
- **Format**:
```json
{
  "id": "heap-01",
  "topic": "heaps",
  "question": "What is the time complexity to build a binary heap from an unsorted array of N elements using Floyd's algorithm?",
  "answer_key": "O(N)",
  "pitfall_misconception": "O(N log N) from assuming N individual insertions",
  "source": "heaps.md; CLRS Section 6.3"
}
```

### B. 40 Multi-Turn Simulated Student Scenarios (`data/simulation_scenarios_40.json`)
- **Design**: 40 scenarios, each built on a different DSA problem, across 4 student archetypes (18 cooperative beginner, 7 misconception-prone, 7 impatient demander, 8 doubtful verifier):
  1. **Cooperative Beginner** (`cooperative_beginner`): Seeks intuition, asks for guidance, receptive to hints.
  2. **Misconception Prone** (`misconception_prone`): Asserts an incorrect premise (e.g. "Heapify takes $O(N \log N)$", "Binary search works on unsorted arrays", "Greedy solves Coin Change").
  3. **Impatient Demander** (`impatient_demander`): Pressures the tutor ("Just give me the Python code, don't ask questions!").
  4. **Doubtful Verifier** (`doubtful_verifier`): Proposes a flawed or naive approach (for example a brute-force $O(N^2)$ solution or an overflow-prone midpoint) and asks the tutor to confirm it.

---

## 3. Evaluation Metrics

| Metric | Target | Formula / Definition | Basis |
|---|---|---|---|
| **Factual Accuracy (FA)** | **≥ 95%** | Correct responses / ground-truth items evaluated (72 in the 70% test split) | Fact-check ground truth |
| **Pitfall Avoidance Rate (PAR)** | **≥ 95%** | Proportion of responses that refute or avoid known misconceptions | Fact-Check Invariant Test |
| **No-Answer-Leakage (NAL)** | **≥ 95%** | Percentage of dialogues with no code dumping or direct answer reveals | Adapted from MRBench's *revealing of the answer* |
| **Answer Leak Rate (ALR)** | **≤ 5%** | $100\% - \text{NAL}$ (lower is better) | Derived from NAL |
| **Socratic Guidance Score (SGS)** | **≥ 4.5 / 5.0** | Our 1–5 scale (1 = Dumps solution, 5 = Masterful scaffolding) | Informed by MRBench's *providing guidance* and LearnLM |
| **Pedagogical Scaffolding (PSA)** | **≥ 90%** | Adherence to Intuition → Invariant → Complexity → Code arc | AlgoMentor Pedagogy |

---

## 4. How to Run the Evaluation Benchmark

Run all evaluations directly within the repository virtual environment:

```powershell
# 1. Run all 105 fact checks and 40 simulated student dialogues:
.\algo-mentor-backend\.venv\Scripts\python.exe algo-mentor-backend\eval\run_eval.py --mode all

# 2. Run only the 105 Fact-Check Ground Truth Benchmark:
.\algo-mentor-backend\.venv\Scripts\python.exe algo-mentor-backend\eval\run_eval.py --mode fact-check

# 3. Run on a sample of 5 items for fast verification:
.\algo-mentor-backend\.venv\Scripts\python.exe algo-mentor-backend\eval\run_eval.py --mode all --sample 5

# 4. Run frozen 70% test set split (honesty constraint):
.\algo-mentor-backend\.venv\Scripts\python.exe algo-mentor-backend\eval\run_eval.py --mode all --split test-70

# 5. Evaluate real completed tutoring sessions saved in Supabase:
.\algo-mentor-backend\.venv\Scripts\python.exe algo-mentor-backend\eval\evaluate_supabase.py
```

Generated reports are saved automatically to:
- `algo-mentor-backend/eval/reports/eval_report.json`
- `algo-mentor-backend/eval/reports/eval_report.md`

---

## 5. Limitations

- The fact-check and simulation runs use the tutor's base system prompt. The retrieved course notes that live sessions use are not yet injected, so the current results measure the tutor without retrieval.
- All scores come from a single LLM judge and have not been checked by hand.
- If a judge call fails, the harness currently records a default passing score; such cases are not yet excluded from the results.
- The 70% test split is small (72 fact-check questions, 28 dialogues), so per-topic and per-persona scores are noisy.
