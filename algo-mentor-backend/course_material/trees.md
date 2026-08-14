---
id: trees
title: Trees & BST
difficulty: intermediate
category: Hierarchical Data Structures
---

# Trees & Binary Search Trees (BST) Overview

A Binary Tree is a hierarchical structure where each node has at most two children (`left` and `right`). A **Binary Search Tree (BST)** adds a strict mathematical invariant: for every node, all values in its entire left subtree must be strictly smaller, and all values in its right subtree must be strictly larger.

---

## Key Intuition & Concept

- **Depth-First Search (DFS)**: 
  - **In-Order (Left, Root, Right)**: Processing a valid BST in-order will yield elements in strictly sorted ascending order.
  - **Pre-Order (Root, Left, Right)**: Best utilized for copying or serializing tree structures.
  - **Post-Order (Left, Right, Root)**: Great for bottom-up computation (e.g., calculating subtree height or safely deleting a tree).
- **Breadth-First Search (Level-Order)**: Processes nodes horizontally level by level from top to bottom. Requires a double-ended queue (`collections.deque`).

---

## Code Template (Python)

```python
from collections import deque

# BFS Level Order Traversal
def level_order(root):
    if not root:
        return []
    result, queue = [], deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(current_level)
    return result

# Validate BST (DFS with Min/Max bounds)
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if not (min_val < root.val < max_val):
        return False
    return is_valid_bst(root.left, min_val, root.val) and is_valid_bst(root.right, root.val, max_val)
```

---

## Edge Cases & Common Pitfalls

1. **Empty Tree**: Always check and return early if `root is None`.
2. **Duplicate Values in BST**: Clarify with the interviewer if equal values go to the left, right, or are entirely disallowed.
3. **Invalid BST Assumption**: Checking only `left.val < node.val < right.val` is insufficient. Subtree values must satisfy the global min/max bounds passed down from their parents.
4. **Skewed Trees**: A skewed tree (resembling a linked list) reduces search complexity from an optimal $O(\log N)$ down to a worst-case $O(N)$.

---

## Complexity Analysis

- **Time Complexity**: $O(\log N)$ for balanced BST Search/Insert. $O(N)$ for complete Tree Traversal (DFS/BFS).
- **Space Complexity**: $O(H)$ for DFS recursive call stack where $H$ is tree height. $O(N)$ for BFS queue size.

---

## Top Interview Problems

1. **Lowest Common Ancestor (LCA)**: Utilize BST properties or post-order DFS to find the split point where two targets diverge.
2. **Maximum Path Sum**: Post-order DFS calculating the maximum non-negative contribution from subtrees.
3. **Serialize and Deserialize Binary Tree**: Pre-order DFS or BFS converting the tree geometry into a string format.