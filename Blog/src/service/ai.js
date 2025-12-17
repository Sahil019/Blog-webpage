import API_URL from "../config/api";

export async function generateAIContent(content) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return res.json();
}
