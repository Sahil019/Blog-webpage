const API_URL = "http://localhost:5000";

/* ================= AUTH HEADER ================= */
const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= GET USER POSTS ================= */
export const getPosts = async () => {
  const res = await fetch(`${API_URL}/api/posts`, {
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
};

/* ================= CREATE POST ================= */
export const createPost = async (post) => {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    throw new Error("Failed to create post");
  }

  return res.json();
};

/* ================= UPDATE POST ================= */
export const updatePost = async (id, post) => {
  const res = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    throw new Error("Failed to update post");
  }

  return res.json();
};

/* ================= DELETE POST ================= */
export const deletePost = async (id) => {
  const res = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete post");
  }

  return res.json();
};

/* ================= IMAGE UPLOAD ================= */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...authHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return data.imageUrl; // ✅ VERY IMPORTANT
};

/* ================= PUBLIC POSTS ================= */
export const getPublicPosts = async () => {
  const res = await fetch(`${API_URL}/api/public/posts`);

  if (!res.ok) {
    throw new Error("Failed to fetch public posts");
  }

  return res.json();
};

export const getPublicPostBySlug = async (slug) => {
  const res = await fetch(`${API_URL}/api/public/posts/${slug}`);

  if (!res.ok) {
    throw new Error("Post not found");
  }

  return res.json();
};
