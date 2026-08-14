---
id: two-pointers
title: Two Pointers
difficulty: beginner
category: Array & String Optimization
---

# Two Pointers Technique Overview

The Two Pointers pattern utilizes two index references moving through a sequence (array or string) simultaneously. It is a highly frequent technique used to optimize brute-force $O(N^2)$ nested loops down to a single $O(N)$ pass.

---

## Key Intuition & Concept

- **Opposite Direction (Left/Right)**: Starts with `left = 0` and `right = len - 1`, moving inward toward each other. This is the gold standard for searching pairs in sorted arrays or checking palindromes.
- **Same Direction (Fast/Slow)**: Both pointers start at index 0. The `fast` pointer scouts ahead to evaluate conditions, while the `slow` pointer dictates where to write data. Perfect for in-place array modifications (e.g., removing duplicates).
- **Sliding Window Variant**: `left` and `right` define a dynamic boundary (a window) that expands and contracts to find a contiguous subarray that satisfies a specific condition.

---

## Code Template (Python)

```python
# Opposite Direction Variant: Find two numbers that add up to target
def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        if current_sum == target:
            return [left + 1, right + 1]  # Returning 1-indexed positions
        elif current_sum < target:
            left += 1
        else:
            right -= 1
            
    return []
```

---

## Edge Cases & Common Pitfalls

1. **Unsorted Inputs**: Opposite-direction two pointer logic fundamentally assumes sorted input. If the array is unsorted, you must sort it first ($O(N \log N)$) or pivot to a hash set approach.
2. **Handling Duplicates**: In problems like 3Sum, duplicate values must be explicitly skipped using checks like `while left < right and nums[left] == nums[left+1]`.
3. **Out-of-Bounds Movement**: Ensure pointer increments/decrements consistently stay within the safe range `0 <= pointer < len(arr)`.

---

## Complexity Analysis

- **Time Complexity**: $O(N)$ — The data sequence is processed in a single, linear pass.
- **Space Complexity**: $O(1)$ — Auxiliary space is constant because the array is processed strictly in-place.

---

## Top Interview Problems

1. **3Sum**: Sort the array, iterate an outer index, and run two pointers for the remaining target value while carefully skipping duplicates.
2. **Container With Most Water**: Move the pointer pointing to the shorter line inward to aggressively attempt finding a larger area.
3. **Trapping Rain Water**: Maintain `left_max` and `right_max` boundaries using two pointers moving inward.