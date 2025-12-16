import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPosts, updatePost, uploadImage } from "../service/posts";
import { generateAIContent } from "../service/ai";
import "./CreatePost.css";

export default function EditPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  /* ================= LOAD POST ================= */
  useEffect(() => {
    const loadPost = async () => {
      try {
        const posts = await getPosts();
        const post = posts.find((p) => p.id === Number(id));

        if (!post) {
          alert("Post not found");
          navigate("/dashboard");
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags?.join(", ") || "");
        setPublished(post.published);
        setImageUrl(post.image_url || "");
      } catch {
        alert("Failed to load post");
        navigate("/dashboard");
      }
    };

    loadPost();
  }, [id, navigate]);

  /* ================= AI GENERATE ================= */

  const handleAIGenerate = async () => {
    if (!content.trim()) {
      alert("Write some content first for AI");
      return;
    }

    setAiLoading(true);

    try {
      const data = await generateAIContent(content);

      if (data.title) setTitle(data.title);
      if (Array.isArray(data.tags)) setTags(data.tags.join(", "));
      if (data.content) setContent(data.content);

      alert("✨ AI updated your post");
    } catch {
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
      let finalImageUrl = imageUrl;

      if (newImage) {
        finalImageUrl = await uploadImage(newImage);
      }

      await updatePost(id, {
        title,
        content,
        published,
        tags: tags.split(",").map((t) => t.trim()),
        image_url: finalImageUrl,
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      <h1>Edit Post</h1>

      {/* 🔥 AI BUTTON */}

      <button
        type="button"
        className="secondary-btn ai-btn"
        onClick={handleAIGenerate}
        disabled={aiLoading}
      >
        {aiLoading ? "✨ Generating..." : "✨ Improve with AI"}
      </button>

      <form onSubmit={handleSubmit} className="editor-form">
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="tags-input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* IMAGE PREVIEW */}

        {imageUrl && (
          <img src={imageUrl} alt="Current" className="image-preview" />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files[0])}
        />

        <textarea
          className="markdown-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <label className="publish-toggle">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish immediately
        </label>

        <button className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : "Update Post"}
        </button>
      </form>
    </div>
  );
}
