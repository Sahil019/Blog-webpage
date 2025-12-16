import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, uploadImage } from "../service/posts";
import { generateAIContent } from "../service/ai";
import "./CreatePost.css";

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [outline, setOutline] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  /* ================= AI GENERATE ================= */
  const handleAIGenerate = async () => {
    if (!content.trim()) {
      alert("Write some content or idea first");
      return;
    }

    try {
      setAiLoading(true);

      const data = await generateAIContent(content);

      setTitle(data.title || "");
      setIntro(data.intro || "");
      setOutline(data.outline || "");
      setTags((data.tags || []).join(", "));
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (file) {
        imageUrl = await uploadImage(file);
      }

      const finalContent = `
${intro ? intro + "\n\n" : ""}
${outline ? outline + "\n\n" : ""}
${content}
      `.trim();

      await createPost({
        title,
        outline,
        content,
        tags: tags.split(",").map((t) => t.trim()),
        published,
        image_url: imageUrl,
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      <h1>Create New Post</h1>

      <form onSubmit={handleSubmit} className="editor-form">
        <button
          type="button"
          className="ai-btn"
          onClick={handleAIGenerate}
          disabled={aiLoading}
        >
          {aiLoading ? "✨ Thinking..." : "✨ AI Generate"}
        </button>
        {/* TITLE + AI */}
        <div className="title-ai-row">
          <input
            className="title-input"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* TAGS */}
        <input
          className="tags-input"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* AI INTRO PREVIEW */}
        {intro && (
          <textarea
            className="outline-preview"
            value={`INTRO:\n${intro}`}
            readOnly
          />
        )}

        {/* AI OUTLINE PREVIEW */}
        {outline && (
          <textarea
            className="outline-preview"
            value={`OUTLINE:\n${outline}`}
            readOnly
          />
        )}

        {/* IMAGE */}
        <input
          type="file"
          accept="image/*"
          className="file-input"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* CONTENT */}
        <textarea
          className="markdown-input"
          placeholder="Write your full blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* PUBLISH */}
        <label className="publish-toggle">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish immediately
        </label>

        {/* SAVE */}
        <button className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Post"}
        </button>
      </form>
    </div>
  );
}
