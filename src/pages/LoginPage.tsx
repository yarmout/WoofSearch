import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/LoginPage.css";

function LoginPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            // Use /api route for proxied requests
            await axios.post(
                "/api/auth/login", // Proxy will forward this correctly
                { name, email },
                { withCredentials: true }
            );
            navigate("/search");
        } catch {
            alert("Something went wrong. Unable to login. Please try again later.");
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-page">
                <h1 className="site-name">🐾 WoofSearch</h1>
                <div className="login-form-container">
                    <h1 className="login-title">Welcome back!</h1>
                    <p className="login-subtitle">Log in to find your perfect canine companion!</p>
                    <div className="login-form">
                        <input
                            className="login-input"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="login-input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="login-button" onClick={handleLogin}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>


    );
}

export default LoginPage;