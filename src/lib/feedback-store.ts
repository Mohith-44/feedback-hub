export type Feedback = {
  id: string;
  name: string;
  email: string;
  rating: number;
  category: string;
  comments: string;
  createdAt: string;
};

const KEY = "lion_feedback_v1";

export const CATEGORIES = [
  "General",
  "Bug Report",
  "Feature Request",
  "UI/UX",
  "Performance",
  "Other",
];

export function getFeedback(): Feedback[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveFeedback(f: Omit<Feedback, "id" | "createdAt">): Feedback {
  const item: Feedback = {
    ...f,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = [item, ...getFeedback()];
  localStorage.setItem(KEY, JSON.stringify(all));
  return item;
}

export function deleteFeedback(id: string) {
  const all = getFeedback().filter((f) => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
