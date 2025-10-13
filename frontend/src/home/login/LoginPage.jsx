// frontend/src/login/LoginPage.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 1. IMPORT YOUR NEW CSS FILE AND ASSETS
import './LoginPage.css';
import backgroundImage from '../../assets/background.png';
import ramcoLogo from '../../assets/login logo.jpeg';
const LoginPage = () => {
  // --- ALL YOUR EXISTING LOGIC IS UNTOUCHED ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else if (res.data.user.role === "manager") {
        navigate("/manager");
      } else if (res.data.user.role === "stack") {
        navigate("/stack");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setError("Invalid Username or Password");
    } finally {
      setIsLoading(false);
    }
  };
  // --- END OF YOUR LOGIC ---


  // 2. THIS IS THE ONLY PART THAT HAS BEEN CHANGED (THE STYLING)
  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-form-container">
        <div className="text-center">
          <img src={ramcoLogo} alt="Ramco Cements Logo" className="login-logo d-block mx-auto" />
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-4">
            <input
              type="email" // Kept as email for your logic
              className="form-control"
              placeholder="USERNAME" // Changed placeholder to match image
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="form-control"
              placeholder="PASSWORD" // Changed placeholder to match image
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-submit" // Bootstrap button classes
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;