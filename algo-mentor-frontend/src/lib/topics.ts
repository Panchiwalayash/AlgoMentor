export const TOPIC_TITLES: Record<string, string> = {
  "binary-search": "Binary Search",
  "linked-lists": "Linked Lists",
  trees: "Trees & BST",
  graphs: "Graphs BFS/DFS",
  "two-pointers": "Two Pointers",
  "dynamic-programming": "Dynamic Programming",
};

export function topicTitle(courseId?: string) {
  if (!courseId) return "Voice Tutor";
  return TOPIC_TITLES[courseId] ?? courseId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
