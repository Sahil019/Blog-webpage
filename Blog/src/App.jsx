import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CreatePostPage from "./pages/CreatePost";
import EditPostPage from "./pages/EditPost";
import PostPreview from "./pages/PostPreview";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* HOME-PAGE */}
      <Route path="/" element={<Home />} />

      {/* LOGIN */}
      <Route path="/login" element={<LoginPage />} />

      {/* PUBLIC POST PREVIEW */}
      <Route path="/post/:slug" element={<PostPreview />} />

      {/* DASHBOARD (PROTECTED PAGES) */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/new" element={<CreatePostPage />} />
      <Route path="/dashboard/edit/:id" element={<EditPostPage />} />

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
