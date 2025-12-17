/* ======================= IMPORTS ======================= */
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

/* ======================= APP SETUP ======================= */
const app = express();
app.use(cors());
app.use(express.json());

/* ======================= DATABASE ======================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


/* ======================= JWT MIDDLEWARE ======================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded; // { id }
    next();
  });
};

/* ======================= UPLOAD SETUP ======================= */
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

/* ======================= UPLOAD ======================= */
app.post("/api/upload", verifyToken, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

/* ======================= AUTH ======================= */

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3)",
      [name, email, hashed]
    );
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

/* ======================= POSTS ======================= */

// CREATE POST
app.post("/api/posts", verifyToken, async (req, res) => {
  const { title, outline, content, tags, image_url, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const result = await pool.query(
      `
      INSERT INTO posts
      (user_id, title, slug, outline, content, tags, image_url, published)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        req.user.id,
        title,
        slug,
        outline || null,
        content,
        tags || [],
        image_url || null,
        published || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// USER POSTS (DEBUG SAFE)
app.get("/api/posts", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE user_id=$1 ORDER BY updated_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ USER POSTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


// UPDATE POST
// UPDATE POST (FIXED)
app.put("/api/posts/:id", verifyToken, async (req, res) => {
  const { title, outline, content, tags, image_url, published } = req.body;

  const result = await pool.query(
    `
    UPDATE posts
    SET title=$1,
        outline=$2,
        content=$3,
        tags=$4,
        image_url=$5,
        published=$6,
        updated_at=NOW()
    WHERE id=$7 AND user_id=$8
    RETURNING *
    `,
    [
      title,
      outline || null,
      content,
      tags || [],
      image_url || null,
      published,
      req.params.id,
      req.user.id,
    ]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(result.rows[0]);
});


// DELETE POST
app.delete("/api/posts/:id", verifyToken, async (req, res) => {
  await pool.query(
    "DELETE FROM posts WHERE id=$1 AND user_id=$2",
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

/* ======================= PUBLIC POSTS (FIXED) ======================= */

// LIST — ONLY PUBLISHED POSTS (FIXES .slice ERROR)
app.get("/api/public/posts", async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        slug,
        content,
        tags,
        image_url,
        created_at
      FROM posts
      WHERE published = true
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
     console.error("PUBLIC POSTS ERROR:", err); 
    res.status(500).json({ error: "Failed to fetch public posts" });
  }
});

// DETAIL
app.get("/api/public/posts/:slug", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM posts WHERE slug=$1 AND published=true",
    [req.params.slug]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(result.rows[0]);
});


/* ======================= AI ======================= */
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/ai/generate", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    // ✅ WORKING MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a professional blog editor.

From the content below:
1. Generate a catchy blog title
2. Generate exactly 5 SEO tags
3. Generate a short blog outline

Content:
${content}

Respond ONLY in valid JSON:
{
  "title": "",
  "intro": "",
  "tags": [],
  "outline": ""

}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    res.json(data);
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});


/* ======================= COMMENTS ======================= */

// GET COMMENTS
app.get("/api/posts/:postId/comments", async (req, res) => {
  const result = await pool.query(
    `
    SELECT c.id, c.content, c.created_at, c.user_id, u.name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    `,
    [req.params.postId]
  );

  res.json(result.rows);
});

// ADD COMMENT
app.post("/api/posts/:postId/comments", verifyToken, async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

  const insert = await pool.query(
    `
    INSERT INTO comments (post_id, user_id, content)
    VALUES ($1,$2,$3)
    RETURNING id
    `,
    [req.params.postId, req.user.id, content]
  );

  const comment = await pool.query(
    `
    SELECT c.id, c.content, c.created_at, c.user_id, u.name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
    `,
    [insert.rows[0].id]
  );

  res.status(201).json(comment.rows[0]);
});

// UPDATE COMMENT
app.put("/api/comments/:id", verifyToken, async (req, res) => {
  const { content } = req.body;

  const result = await pool.query(
    `
    UPDATE comments
    SET content=$1
    WHERE id=$2 AND user_id=$3
    RETURNING *
    `,
    [content, req.params.id, req.user.id]
  );

  if (!result.rows.length) {
    return res.status(403).json({ error: "Not allowed" });
  }

  res.json(result.rows[0]);
});

// DELETE COMMENT
app.delete("/api/comments/:id", verifyToken, async (req, res) => {
  const result = await pool.query(
    "DELETE FROM comments WHERE id=$1 AND user_id=$2",
    [req.params.id, req.user.id]
  );

  if (!result.rowCount) {
    return res.status(403).json({ error: "Not allowed" });
  }

  res.json({ success: true });
});

/* ======================= STATIC ======================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================= SERVER ======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
