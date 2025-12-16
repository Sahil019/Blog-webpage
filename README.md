# 🚀 Full-Stack Blog Platform (React + Express + PostgreSQL)

A modern full-stack blog application with authentication, dashboard, image uploads, public blog previews, and AI-assisted content generation.

---

## 📌 Features

- 🔐 JWT Authentication (Login / Register)
- 📝 Create, Edit, Delete blog posts
- 🖼 Image upload with Multer
- 🌍 Public blog listing & detail pages
- 🤖 AI-powered Title, Tags & Outline generation (FREE API)
- 📊 Dashboard with search & stats
- 🧠 Clean architecture (service-based frontend)

---

## 🏗 Architecture

### Frontend (React)
```
src/
 ├── pages/
 │   ├── Login.jsx
 │   ├── Dashboard.jsx
 │   ├── CreatePost.jsx
 │   ├── EditPost.jsx
 │   └── PostPreview.jsx
 ├── service/
 │   ├── posts.js
 │   └── ai.js
 ├── App.jsx
 └── main.jsx
```

### Backend (Node + Express)
```
backend/
 ├── uploads/
 ├── index.js
 ├── .env
```

---

## 🛠 Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT
- **Uploads:** Multer
- **AI:** FREE HuggingFace / Ollama-compatible API

---

## 🗄 Database Schema

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  tags TEXT[],
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Posts (Protected)
- GET `/api/posts`
- POST `/api/posts`
- PUT `/api/posts/:id`
- DELETE `/api/posts/:id`

### Upload
- POST `/api/upload`

### Public
- GET `/api/public/posts`
- GET `/api/public/posts/:slug`

### AI
- POST `/api/ai/generate`

---

## 🖼 Image Upload Flow

1. Frontend uploads image → `/api/upload`
2. Backend stores file in `/uploads`
3. Backend returns full URL
4. URL saved in `posts.image_url`
5. Used directly in `<img src={image_url} />`

---

## 🤖 AI Integration (FREE)

Uses a free text-generation API to generate:
- Title
- Tags
- Outline

Triggered via **✨ Generate with AI** button in Create/Edit pages.

---

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
npm install
node index.js
```

Create `.env`:
```
JWT_SECRET=your_secret
DB_PASSWORD=your_pg_password
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Recruiter Highlights

- Clean REST API
- Secure auth flow
- Real-world image handling
- AI-enhanced UX
- Production-ready structure

---

## 📌 Future Enhancements

- Comments system
- Likes & bookmarks
- Markdown rendering
- Role-based access


---

👨‍💻 Built with passion & production mindset.
