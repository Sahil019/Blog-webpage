import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API_URL from "../config/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* 🔐 AUTO REDIRECT IF LOGGED IN */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  /* INPUT HANDLER */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* SUBMIT */

  const handleSubmit = async (e) => {
    e.preventDefault();

const url = isSignUp
  ? `${API_URL}/api/auth/register`
  : `${API_URL}/api/auth/login`;


    const payload = isSignUp
      ? formData
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      if (isSignUp) {
        alert("Signup successful! Please login.");
        setIsSignUp(false);
        setFormData({ name: "", email: "", password: "" });
      } else {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="left-panel">
          <h2>Welcome Back!</h2>
          <p>To keep connected with us please login with your personal info</p>
          <button className="outline-btn" onClick={() => setIsSignUp(false)}>
            Sign In
          </button>
        </div>

        <div className="right-panel">
          <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
          <p className="small-text">or use your email</p>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {!isSignUp && (
            <p className="switch-text" onClick={() => setIsSignUp(true)}>
              Don’t have an account? Sign Up
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
