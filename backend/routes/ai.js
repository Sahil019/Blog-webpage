const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.post("/generate", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Generate:
1. SEO friendly title
2. 5 relevant tags
3. Short outline

Topic:
${content}

Respond ONLY in JSON:
{
  "title": "",
  "tags": [],
  "outline": ""
}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    const parsed = JSON.parse(text);

    res.json(parsed);
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;
