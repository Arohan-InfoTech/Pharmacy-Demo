import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", storeName: "" });
  const [error, setError] = useState("");
  const { registerStoreOwner } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    try {
      registerStoreOwner(form);
      navigate("/billing");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Register Your Pharmacy</h2>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          This creates a new store and makes you its admin. Add staff accounts afterwards from the Staff page.
        </p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Your Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label>Store Name</label>
          <input name="storeName" value={form.storeName} onChange={handleChange} placeholder="e.g. Sharma Medical Store" />
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button className="btn" type="submit">Create Store</button>
        </form>
        <p style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
