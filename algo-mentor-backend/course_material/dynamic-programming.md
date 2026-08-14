---
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

- **Time Complexity**: $O(\text{Number of Unique States}) \times O(\text{Work per State Transition})$.
- **Space Complexity**: $O(N)$ for the tabulation array or memoization dictionary, often optimizable to $O(1)$ space if past states can be discarded.

---

## Top Interview Problems

1. **Climbing Stairs / House Robber**: 1D DP transitions where the current state depends directly on the previous 1 or 2 steps.
2. **Longest Common Subsequence (LCS)**: 2D grid DP evaluating matching vs. non-matching character transitions across two strings.
3. **0/1 Knapsack & Partition Equal Subset Sum**: 2D grid DP evaluating a "pick vs. leave" item choice with capacity constraints.