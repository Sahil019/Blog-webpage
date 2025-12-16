import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PostPreview.css";

export default function PostPreview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= COMMENTS ================= */
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const token = localStorage.getItem("token");

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ================= FETCH POST ================= */
  useEffect(() => {
    if (!slug || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPost = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/public/posts/${slug}`
        );

        if (!res.ok) throw new Error("Post not found");

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    if (!post) return;

    const fetchComments = async () => {
      const res = await fetch(
        `http://localhost:5000/api/posts/${post.id}/comments`
      );
      const data = await res.json();
      setComments(data);
    };

    fetchComments();
  }, [post]);

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const res = await fetch(
      `http://localhost:5000/api/posts/${post.id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      }
    );

    const data = await res.json();
    setComments([data, ...comments]);
    setCommentText("");
  };

  /* ================= EDIT COMMENT ================= */
  const editComment = (id, content) => {
    setEditingId(id);
    setEditingText(content);
  };

  const saveEdit = async (id) => {
    const res = await fetch(`http://localhost:5000/api/comments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editingText }),
    });

    const updated = await res.json();
    setComments(comments.map((c) => (c.id === id ? updated : c)));
    setEditingId(null);
    setEditingText("");
  };

  /* ================= DELETE COMMENT ================= */
  const deleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;

    await fetch(`http://localhost:5000/api/comments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setComments(comments.filter((c) => c.id !== id));
  };

  /* ================= STATES ================= */
  if (loading) {
    return <div className="post-preview loading">Loading…</div>;
  }

  if (error) {
    return (
      <div className="post-preview error">
        <h2>{error}</h2>
        <button onClick={() => navigate("/dashboard")}>← Back</button>
      </div>
    );
  }

  if (!post) return null;

  /* ================= RENDER ================= */
  return (
    <>
      {/* LOGOUT */}
      <div className="log-btn">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <article className="post-preview">
        {/* TITLE */}
        <h1 className="post-title">{post.title}</h1>

        {/* TAGS ✅ RESTORED */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, i) => (
              <span key={i} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* IMAGE */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="preview-image"
          />
        )}

        {/* CONTENT */}
        <div className="post-content">
          {post.content.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* COMMENTS */}
        <section className="comments-section">
          <h2 className="comments-title">Comments</h2>

          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Post</button>
          </form>

          <div className="comment-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <strong>{comment.name}</strong>
                    <span>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                      />
                      <div className="comment-actions">
                        <button onClick={() => saveEdit(comment.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{comment.content}</p>
                      <div className="comment-actions">
                        <button
                          onClick={() =>
                            editComment(comment.id, comment.content)
                          }
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteComment(comment.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </>
  );
}
