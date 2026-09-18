import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div>
        <Link to="/" className="brand">💊 MedTrack</Link>
      </div>
      <div>
        {session && <Link to="/billing">Billing</Link>}
        {session && <Link to="/sales">Sales History</Link>}
        {session && <Link to="/inventory">Inventory</Link>}
        {session && <Link to="/dashboard">Dashboard</Link>}
        {session?.role === "admin" && <Link to="/staff">Staff</Link>}
        {!session && <Link to="/login">Login</Link>}
        {!session && <Link to="/register">Register Store</Link>}
        {session && (
          <button className="btn secondary" onClick={handleLogout}>
            Logout ({session.name})
          </button>
        )}
      </div>
    </div>
  );
}
