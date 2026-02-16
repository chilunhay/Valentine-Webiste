export interface QuizItem {
  _id?: string;
  id?: string;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  correctResponse: string;
  incorrectResponse: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string) || "";

export async function fetchQuizzes(): Promise<QuizItem[]> {
  const res = await fetch(`${API_URL}/api/quiz`);
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
}

export async function bulkReplaceQuizzes(
  items: QuizItem[],
): Promise<QuizItem[]> {
  const res = await fetch(`${API_URL}/api/quiz/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to bulk update quizzes");
  return res.json();
}
