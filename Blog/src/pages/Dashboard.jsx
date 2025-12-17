import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "Dashboard.css";
import { Search } from "lucide-react";
import { getPosts, deletePost } from "../service/posts";

/* ================= IMAGE URL HELPER ================= */
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:5000${url}`;
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [featuredGlobal, setFeaturedGlobal] = useState(null);
  const [globalPosts, setGlobalPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [globalPublishedCount, setGlobalPublishedCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadAll();
  }, [navigate]);

  /* ================= LOAD ALL DATA ================= */
  const loadAll = async () => {
    try {
      setLoading(true);

      // USER POSTS
      const myPosts = await getPosts();
      const safePosts = Array.isArray(myPosts) ? myPosts : [];
      setPosts(safePosts);
      setDrafts(safePosts.filter((p) => !p.published));
      setPublishedCount(safePosts.filter((p) => p.published).length);

      // GLOBAL POSTS
      const res = await fetch("http://localhost:5000/api/public/posts");
      const global = await res.json();
      const safeGlobal = Array.isArray(global) ? global : [];

      setFeaturedGlobal(safeGlobal[0] || null);
      setGlobalPosts(safeGlobal.slice(1));
      setGlobalPublishedCount(safeGlobal.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    await deletePost(id);
    loadAll();
  };

  /* ================= SEARCH ================= */
  const isSearching = searchQuery.trim().length > 0;

  const searchResults = posts.filter((post) => {
    if (!isSearching) return false;

    const q = searchQuery.toLowerCase();

    const titleMatch = post.title?.toLowerCase().includes(q);
    const contentMatch = post.content?.toLowerCase().includes(q);
    const tagsMatch =
      Array.isArray(post.tags) &&
      post.tags.some((tag) =>
        typeof tag === "string" && tag.toLowerCase().includes(q)
      );

    return titleMatch || contentMatch || tagsMatch;
  });

  return (
    <div className="dashboard">
      {/* LOGOUT */}
      <div className="logout-section">
        <button
          className="secondary-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Your Writing <br />
            <span>Your Impact</span>
          </h1>
          <p>Create, refine and publish meaningful content.</p>

          {/* ACTION BAR */}
          <div style={{ display: "flex", gap: "16px", marginTop: "28px" }}>
            <button
              className="primary-btn"
              onClick={() => navigate("/dashboard/new")}
            >
              + Create Post
            </button>

<div className="search-wrapper">
  <input
    type="text"
    placeholder="Search by title or tag…"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"
  />

  <Search className="search-icon" size={18} />
</div>
          </div>
        </div>

        <div className="hero-box">✍️</div>
      </section>

      {/* 🔍 SEARCH RESULTS AS CARDS */}
      {isSearching && (
        <section className="posts-section">
          <h2>Search Results</h2>

          <div className="posts-grid">
            {searchResults.length > 0 ? (
              searchResults.map((post) => (
                <div
                  key={post.id}
                  className="post-card-home"
                  onClick={() =>
                    post.published
                      ? navigate(`/post/${post.slug}`)
                      : navigate(`/dashboard/edit/${post.id}`)
                  }
                >
                  {post.image_url && (
                    <div className="post-image">
                      <img
                        src={resolveImageUrl(post.image_url)}
                        alt={post.title}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}

                  <h3>{post.title}</h3>
                  <p>{post.content?.slice(0, 100)}…</p>

                  <div className="card-meta">
                    <span>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span>•</span>
                    <span>
                      {post.updated_at
                        ? new Date(post.updated_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty">No matching posts found</p>
            )}
          </div>
        </section>
      )}

      {/* FEATURED GLOBAL (ONLY WHEN NOT SEARCHING) */}

      {!isSearching && featuredGlobal && (
        <section
          className="editorial-hero"
          style={{
            backgroundImage: featuredGlobal.image_url
              ? `url(${resolveImageUrl(featuredGlobal.image_url)})`
              : "none",
          }}
        >
          <div className="editorial-overlay">
            <span className="editorial-badge">FEATURED · GLOBAL</span>
            <h1 className="editorial-title">{featuredGlobal.title}</h1>
            <p className="editorial-excerpt">
              {featuredGlobal.content?.slice(0, 160)}…
            </p>

            <button
              className="editorial-cta"
              onClick={() => navigate(`/post/${featuredGlobal.slug}`)}
            >
              Read article →
            </button>
          </div>
        </section>
      )}

      {/* GLOBAL POSTS GRID */}
      {!isSearching && (
        <section className="posts-section">
          <h2>🌍 Global Published Posts</h2>

          <div className="posts-grid">
            {globalPosts.length > 0 ? (
              globalPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-card-home"
                  onClick={() => navigate(`/post/${post.slug}`)}
                >
                  {post.image_url && (
                    <div className="post-image">
                      <img
                        src={resolveImageUrl(post.image_url)}
                        alt={post.title}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}

                  <h3>{post.title}</h3>
                  <p>{post.content?.slice(0, 90)}…</p>

                  <div className="card-meta">
                    <span>Global</span>
                    <span>•</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty">No global posts yet</p>
            )}
          </div>
        </section>
      )}

      {/* STATS */}
      <section className="stats">
        <StatCard label="Your Posts" value={posts.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={drafts.length} />
        <StatCard
          label="Published Globally"
          value={globalPublishedCount}
        />
      </section>

      {/* DRAFTS (ONLY WHEN NOT SEARCHING) */}
      
      {!isSearching && (
        <section className="drafts-section">
          <h2>✒️ Your Drafts</h2>

          <div className="posts-grid">
            {loading ? (
              <p className="empty">Loading drafts...</p>
            ) : drafts.length > 0 ? (
              drafts.map((post) => (
                <div
                  key={post.id}
                  className="post-card-home"
                  onClick={() =>
                    navigate(`/dashboard/edit/${post.id}`)
                  }
                >
                  {post.image_url && (
                    <div className="post-image">
                      <img
                        src={resolveImageUrl(post.image_url)}
                        alt={post.title}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}

                  <h3>{post.title}</h3>
                  <p>Draft</p>

                  <div className="card-meta">
                    <span>
                      {post.updated_at
                        ? new Date(post.updated_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/edit/${post.id}`);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty">No drafts yet</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}
