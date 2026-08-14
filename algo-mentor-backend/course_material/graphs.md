---
id: graphs
title: Graphs BFS/DFS
difficulty: intermediate
category: Non-Linear Structures & Networks
---

# Graphs BFS/DFS Overview

A Graph is a network structure consisting of vertices (nodes) and edges (connections). Graphs can represent social networks, maps, or dependency trees. They can be directed/undirected, weighted/unweighted, and cyclic/acyclic (DAG).

---

## Key Intuition & Concept

- **Breadth-First Search (BFS)**: Uses a `Queue` (FIFO). It explores the graph in "concentric circles"—visiting all immediate neighbors at distance $k$ before moving to distance $k+1$. It is ideal for finding the **shortest path in unweighted graphs**.
- **Depth-First Search (DFS)**: Uses recursion or an explicit `Stack` (LIFO). It explores as deep as possible along each branch before hitting a dead end and backtracking. Great for path detection, cycle detection, and solving mazes.
- **The Visited Set**: Unlike trees, graphs can have cycles (loops). You MUST mark nodes as visited immediately upon adding them to the queue or visiting them to prevent infinite recursion.

---

## Code Template (Python)

```python
from collections import deque

# BFS: Shortest Path in Unweighted Graph
def bfs_shortest_path(graph: dict, start, target) -> int:
    queue = deque([(start, 0)])
    visited = {start}
    
    while queue:
        node, dist = queue.popleft()
        if node == target:
            return dist
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
                
    return -1

# Topological Sort (Kahn's Algorithm - Indegree BFS)
def topological_sort(num_nodes: int, edges: list[list[int]]) -> list[int]:
    adj = {i: [] for i in range(num_nodes)}
    indegree = [0] * num_nodes
    
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
        
    queue = deque([i for i in range(num_nodes) if indegree[i] == 0])
    topo_order = []
    
    while queue:
        node = queue.popleft()
        topo_order.append(node)
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
                
    return topo_order if len(topo_order) == num_nodes else []  # Cycle check
```

---

## Edge Cases & Common Pitfalls

1. **Disconnected Components**: A graph might have multiple independent, unconnected pieces. You must loop over all nodes in the given range to launch BFS/DFS if they are currently unvisited.
2. **Cycle in Dependency Graph**: A Topological Sort will fail (resulting list length < num_nodes) if the graph contains cycles.
3. **Graph Representation**: Most problems provide an edge list (`[[u, v]]`). You must convert this into an adjacency list (`adj[u].append(v)`) before you can efficiently traverse it.

---

## Complexity Analysis

- **Time Complexity**: $O(V + E)$ — where $V$ is the number of vertices and $E$ is the number of edges. Every node and edge is processed exactly once.
- **Space Complexity**: $O(V)$ — required for the visited set and the BFS queue or DFS call stack.

---

## Top Interview Problems

1. **Number of Islands**: 2D grid DFS/BFS to count connected components.
2. **Course Schedule I & II**: Detect a cycle or find a valid topological ordering of course prerequisites.
3. **Clone Graph**: Run BFS/DFS while maintaining a hash map that maps the original old node to the newly instantiated node copy.
