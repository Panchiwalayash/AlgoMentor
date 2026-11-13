---
id: heaps
title: Heaps & Priority Queues
difficulty: intermediate
category: Tree-Based Data Structures
---

# Heaps & Priority Queues Overview

A Heap is a specialized complete binary tree that satisfies the **Heap Property**. In a **Min-Heap**, for any given node $C$, if $P$ is a parent node of $C$, then the key of $P$ is less than or equal to the key of $C$ (the root element is always the minimum). In a **Max-Heap**, the parent key is greater than or equal to the child key (the root element is always the maximum).

A **Priority Queue** is an abstract data type where elements have priorities, and the element with the highest priority is served first. Heaps provide the standard, optimal backing data structure for priority queues.

---

## Key Intuition & Concept

### 1. Array-Based Complete Binary Tree Representation
Because a heap is always a complete binary tree (filled on all levels except possibly the lowest, which is filled from left to right), it requires zero pointers. It can be stored compactly in a contiguous array:
- For a node at 0-based index `i`:
  - **Left Child**: `2 * i + 1`
  - **Right Child**: `2 * i + 2`
  - **Parent**: `(i - 1) // 2`

### 2. Core Heap Operations
- **Peek (`min` or `max`)**: $O(1)$ time by reading index `0`.
- **Insert / Push**: $O(\log N)$ time. Append element at the end of the array (maintains completeness) and bubble it up (`sift_up` / heapify-up) until the heap invariant is restored.
- **Extract Min/Max / Pop**: $O(\log N)$ time. Swap root with the last element, remove the last element, and bubble the new root down (`sift_down` / heapify-down) until the invariant is restored.

### 3. CRITICAL: Building a Heap in $O(N)$ Time (Floyd's Algorithm)
> [!IMPORTANT]
> **Building a heap from an unsorted array takes $O(N)$ time, NOT $O(N \log N)$!**
> Many students mistakenly think building a heap requires $O(N \log N)$ by assuming $N$ insertions of $O(\log N)$ each. However, the optimal bottom-up construction (**Floyd's Heapify Algorithm**) runs in strictly linear $O(N)$ time.

**Why is Floyd's `heapify` $O(N)$ instead of $O(N \log N)$?**
- In bottom-up heapify, we start at the deepest internal nodes `(N // 2 - 1)` down to the root `0`, calling `sift_down` on each node.
- In a binary tree of $N$ nodes:
  - Half of the nodes ($\approx N / 2$) are leaves at height 0; they require **0 swaps**.
  - A quarter of the nodes ($\approx N / 4$) are at height 1; they require at most **1 swap**.
  - An eighth of the nodes ($\approx N / 8$) are at height 2; they require at most **2 swaps**.
  - Only **1 node** (the root) is at maximum height $\log N$; it requires at most **$\log N$ swaps**.
- The total number of swaps is bounded by:
  $$\sum_{h=0}^{\log N} \frac{N}{2^{h+1}} \cdot h = \frac{N}{2} \sum_{h=0}^{\log N} \frac{h}{2^h}$$
  The infinite series $\sum_{h=0}^{\infty} \frac{h}{2^h}$ converges exactly to $2$.
  Therefore, the total operations are $N \cdot 1 = O(N)$.
- **Key Takeaway**: Most nodes in a heap are near the bottom and do very little work; only few nodes near the top can travel the full tree height.

---

## Code Template (Python)

### 1. Using Python's Built-in `heapq` Module (Min-Heap)
```python
import heapq

# In-place Floyd's Heapify: O(N) time!
nums = [9, 4, 7, 1, 3, 2, 8]
heapq.heapify(nums)  # nums is now a valid min-heap in O(N)

# Push: O(log N)
heapq.heappush(nums, 5)

# Pop smallest element: O(log N)
smallest = heapq.heappop(nums)

# Peek smallest: O(1)
min_val = nums[0]

# For a Max-Heap in Python, invert the numbers (multiply by -1):
max_heap = [-x for x in nums]
heapq.heapify(max_heap)
largest = -heapq.heappop(max_heap)
```

### 2. Manual `sift_down` Implementation (Under the Hood)
```python
def sift_down(heap: list[int], n: int, i: int) -> None:
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and heap[left] < heap[smallest]:
        smallest = left
    if right < n and heap[right] < heap[smallest]:
        smallest = right

    if smallest != i:
        heap[i], heap[smallest] = heap[smallest], heap[i]
        sift_down(heap, n, smallest)

def build_min_heap(arr: list[int]) -> list[int]:
    n = len(arr)
    # Start at the last non-leaf node and sift down to root: O(N) total
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, n, i)
    return arr
```

---

## Edge Cases & Common Pitfalls

1. **Mistaking In-Place Build-Heap for $O(N \log N)$**: Repeatedly calling `heappush` on an empty heap takes $O(N \log N)$ time. Calling `heapq.heapify(arr)` directly on the array takes $O(N)$ time. Always use `heapify`.
2. **Assuming Heaps are Sorted**: A heap is NOT fully sorted. Only the root has a guaranteed relationship with all other nodes. You cannot binary search a heap, nor is in-order traversal sorted.
3. **Python `heapq` Default Orientation**: Python `heapq` implements a **Min-Heap**. For Max-Heap, you must negate the values `(-val, val)` or use custom comparator wrappers.
4. **Tuple Comparison Collisions**: When storing `(priority, item)` tuples where items do not support direct comparison (like custom objects), Python will raise a `TypeError` if priorities tie. Use `(priority, index, item)` or a tiebreaker key.
5. **0-based vs. 1-based indexing**: In 0-based arrays, children are `2*i + 1` and `2*i + 2`, parent is `(i - 1) // 2`. In 1-based arrays, children are `2*i` and `2*i + 1`, parent is `i // 2`.

---

## Complexity Analysis

| Operation | Time Complexity | Auxiliary Space |
|---|---|---|
| **Build Heap (`heapify`)** | **$O(N)$** | $O(1)$ in-place |
| **Peek Min / Max** | $O(1)$ | $O(1)$ |
| **Insert / `heappush`** | $O(\log N)$ | $O(1)$ |
| **Extract Min/Max / `heappop`** | $O(\log N)$ | $O(1)$ |
| **Heap Sort** | $O(N \log N)$ | $O(1)$ in-place |

---

## Top Interview Problems

1. **Top K Frequent Elements / Kth Largest Element in an Array**:
   - Maintain a min-heap of size $K$. When the heap exceeds size $K$, pop the smallest element. Final root is the $K$-th largest in $O(N \log K)$ time.
2. **Find Median from Data Stream (The Two-Heaps Pattern)**:
   - Balance a max-heap (storing the lower half of numbers) with a min-heap (storing the upper half). Find median in $O(1)$ time, add number in $O(\log N)$ time.
3. **Merge K Sorted Lists**:
   - Push the head node of each of the $K$ lists into a min-heap of size $K$. Pop the minimum, connect it, and push its next node in $O(N \log K)$ total time.
4. **Task Scheduler / Reorganize String**:
   - Use a max-heap to greedily pick the task with the highest remaining frequency, paired with a cooldown queue.
