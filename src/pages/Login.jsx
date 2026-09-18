import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@medtrack.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    try {
      login(email, password);
      navigate("/billing");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <div className="card">
        <h2>Login</h2>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Demo account is pre-filled: admin@medtrack.com / admin123
        </p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit">Login</button>
        </form>
        <p style={{ marginTop: 12 }}>
          Setting up a new pharmacy? <Link to="/register">Register your store</Link>
        </p>
      </div>
    </div>
  );
}
