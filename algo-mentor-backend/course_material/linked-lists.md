---
id: linked-lists
title: Linked Lists
difficulty: beginner
category: Linear Data Structures
---

# Linked Lists Overview

A Linked List is a linear data structure where elements (nodes) are stored sequentially via explicit memory pointers, rather than contiguous memory blocks like arrays. Each node contains a `val` and a `next` pointer pointing to the memory address of the subsequent node.

---

## Key Intuition & Concept

- **Dummy Head Technique**: Initialize a `dummy = ListNode(0)` that points to your actual list head. This eliminates the need to write complex edge-case logic for empty lists or operations that modify the head node.
- **Two Pointers (Fast & Slow)**: Also known as the Tortoise & Hare. 
  - *Finding the middle*: `slow` moves 1 step, `fast` moves 2 steps. When `fast` reaches the end, `slow` is exactly in the middle.
  - *Cycle detection*: If the list has a loop, the `fast` pointer will eventually lap and equal the `slow` pointer.
- **In-Place Pointer Reversal**: You can reverse a list strictly in $O(1)$ memory by meticulously shifting `prev`, `curr`, and `nxt` variables node by node.

---

## Code Template (Python)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_linked_list(head: ListNode) -> ListNode:
    prev = None
    curr = head
    
    while curr:
        nxt = curr.next     # Save the rest of the list
        curr.next = prev    # Reverse the current node's pointer
        prev = curr         # Move the prev pointer forward
        curr = nxt          # Move the curr pointer forward
        
    return prev  # Prev ends up as the new head
```

---

## Edge Cases & Common Pitfalls

1. **Null Pointer Exception**: Dereferencing `curr.next.next` without first validating that both `curr` and `curr.next` actually exist.
2. **Losing the Next Pointer**: Reassigning `curr.next = prev` before safely saving `nxt = curr.next` permanently severs the rest of the list.
3. **Cycle Memory Leaks**: When reversing sub-lists or deleting nodes, make sure your head and tail pointers are reconnected cleanly to avoid stranding memory.

---

## Complexity Analysis

- **Time Complexity**: $O(N)$ access and search time. $O(1)$ insertion and deletion time if you are already at the target node.
- **Space Complexity**: $O(1)$ auxiliary space for iterative operations.

---

## Top Interview Problems

1. **Reverse Linked List / Reverse Sub-list**: Reorient pointers carefully in $O(1)$ space.
2. **Merge Two Sorted Lists**: Use a dummy head and two pointers to weave nodes together iteratively.
3. **Remove Nth Node From End of List**: Give a fast pointer an $N$-step head start, then advance both pointers simultaneously.
4. **Linked List Cycle II**: Find the exact entry node of the cycle using Floyd's algorithm.