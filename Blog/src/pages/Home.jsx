import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

/* ================= IMAGE URL HELPER (SAME AS DASHBOARD) ================= */
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:5000${url}`;
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/public/posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch(console.error);
  }, []);

  if (!posts.length) {
    return <p style={{ textAlign: "center", marginTop: 120 }}>Loading…</p>;
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="logo">
          MyBlog
          <span className="tagline">
            Thoughts on growth, discipline, and modern life.
          </span>
        </div>

        <nav className="nav-actions">
          <button className="nav-btn login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="nav-btn signup"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </nav>
      </header>

      {/* ================= FEATURED ================= */}
      {featured && (
        <section
          className="featured"
          style={{
            backgroundImage: featured.image_url
              ? `url(${resolveImageUrl(featured.image_url)})`
              : "none",
          }}
        >
          <div className="overlay">
            <span className="badge">Featured</span>

            <h1>{featured.title}</h1>

            <p className="featured-excerpt">
              {featured.content
                ? featured.content.slice(0, 140) + "…"
                : "Read this featured article"}
            </p>

            <div className="featured-meta">
              <span>By Sahil</span>
              <span>·</span>
              <span>5 min read</span>
            </div>

            <Link
              to={`/posts/${featured.slug}`}
              className="arrow"
              aria-label="Read featured post"
            >
              →
            </Link>
          </div>
        </section>
      )}

      {/* ================= GRID ================= */}
      <section className="posts-grid">
        {rest.map((post) => (
          <Link to={`/posts/${post.slug}`} key={post.id} className="post-card">
            {post.image_url && (
              <div className="post-image">
                <img
                  src={resolveImageUrl(post.image_url)}
                  alt={post.title}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            <h3>{post.title}</h3>

            <p>
              {post.content
                ? post.content.slice(0, 90) + "…"
                : "Click to read more"}
            </p>

            <div className="card-meta">
              <span>By Sahil</span>
              <span>·</span>
              <span>3 min read</span>
            </div>
          </Link>
        ))}
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>Built with React, Express, and PostgreSQL. Writing since 2025.</p>
      </footer>
    </>
  );
}
