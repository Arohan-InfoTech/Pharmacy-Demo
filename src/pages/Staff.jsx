import { useEffect, useState } from "react";
import { db } from "../data/db";
import { useAuth } from "../context/AuthContext";

export default function Staff() {
  const { session } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => setStaffList(db.listStaff(session));
  useEffect(load, [session]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      db.createStaff(form, session);
      setMessage(`Staff account created for ${form.email}`);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <h2>Staff Accounts</h2>
      <div className="card">
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <form onSubmit={submit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button className="btn" type="submit">Create Staff Account</button>
        </form>
      </div>

      <h3>Current Staff</h3>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {staffList.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
