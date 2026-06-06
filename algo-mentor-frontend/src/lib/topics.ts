import { Course } from "@/lib/types";

export const TOPICS: Course[] = [
  {
    id: "binary-search",
    title: "Binary Search",
    description: "Master the O(log n) search pattern on sorted data",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    description: "Pointer manipulation, reversal, and cycle detection",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "trees",
    title: "Trees & BST",
    description: "Traversals, recursion, and binary search trees",
    difficulty: "Intermediate",
    totalDays: 5,
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    description: "Sliding window and pair-sum techniques on arrays",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "graphs",
    title: "Graphs BFS/DFS",
    description: "Explore graphs with breadth-first and depth-first search",
    difficulty: "Intermediate",
    totalDays: 5,
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Break problems into overlapping subproblems",
    difficulty: "Advanced",
    totalDays: 5,
  },
];

export function topicTitle(courseId?: string) {
  if (!courseId) return "Free Practice";
  const topic = TOPICS.find((item) => item.id === courseId);
  if (topic) return topic.title;
  return courseId.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
