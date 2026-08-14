---
id: binary-search
title: Binary Search
difficulty: beginner
category: Searching & Sorting
---

# Binary Search Overview

Binary Search is a highly efficient "divide and conquer" algorithm for finding an element in a **sorted array or search space**. Instead of scanning every item one by one (Linear Search), it repeatedly divides the search interval in half. For real-world intuition, imagine searching for the word "Zebra" in a dictionary: you do not read from page one; you open near the end and immediately discard the entire first half of the book.

---

## Key Intuition & Concept

- **Precondition (The Monotonic Rule)**: The input range or array must be ordered/sorted, or exhibit a monotonic search property (where a predicate function evaluates to `False, False, ..., True, True`).
- **Mechanism**: Compare the target value with the middle element of the array's current boundaries (`left` and `right`).
  - If the middle element matches the target, return its index.
  - If the target is less than the middle element, the target must be in the left half. Narrow the search space by moving the `right` boundary to `mid - 1`.
  - If the target is greater, the target must be in the right half. Narrow the search space by moving the `left` boundary to `mid + 1`.

---

## Code Template (Python)

```python
def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1  # Target not found
```

---

## Edge Cases & Common Pitfalls

1. **Integer Overflow**: Calculating `mid = (left + right) // 2` can overflow in fixed-width integer languages like Java or C++. Always prefer the memory-safe `left + (right - left) // 2`.
2. **Infinite Loops**: Mismanaging pointers (e.g., setting `left = mid` instead of `left = mid + 1`) will cause infinite loops when `left` and `right` are adjacent.
3. **Off-by-One Errors**: Ensure your loop condition matches your boundary setup. If you use `right = len(nums) - 1`, the loop condition must be `while left <= right`.

---

## Complexity Analysis

- **Time Complexity**: $O(\log N)$ — The search space is halved at each step. Searching an array of 1 billion items takes at most ~30 checks.
- **Space Complexity**: $O(1)$ iterative, or $O(\log N)$ recursive auxiliary stack space.

---

## Top Interview Problems

1. **Search in Rotated Sorted Array**: Identify which half of the array is strictly sorted before adjusting pointers.
2. **First and Last Position of Element**: Run binary search twice, adjusting boundary conditions to find the leftmost and rightmost insertion points of a duplicate target.
3. **Capacity To Ship Packages Within D Days**: Binary search on the answer space itself (min to max feasible weight capacity).