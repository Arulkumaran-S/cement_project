// frontend/src/login/LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import './LoginPage.css';
import backgroundImage from '../../assets/background.png';
import ramcoLogo from '../../assets/ramco logo.png';
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
            const res = await axios.post("/api/auth/login", {
                email,
                password,
            });

            console.log("✅ Login successful! Data received from backend:", res.data);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Update the App's state after successful login
            setRole(res.data.user.role); 

            const userRole = res.data.user.role.trim().toLowerCase();

            if (userRole === "admin") {
                navigate("/admin");
            } else if (userRole === "manager") {
                navigate("/manager");
            } else if (userRole === "stack") {
                navigate("/stack");
            } else {
                navigate("/"); // fallback
            }
        } catch (err) {
            console.error("❌ Login failed! Error:", err);
            setError("Invalid Username or Password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="login-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="login-form-container">
                <div className="text-center">
                    <img src={ramcoLogo} alt="Ramco Cements Logo" className="login-logo d-block mx-auto" />
                </div>
                <form>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-4">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="USERNAME"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary w-100 btn-submit"
                        disabled={isLoading}
                        onClick={handleLogin}
                    >
                        {isLoading ? "Submitting..." : "SUBMIT"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
