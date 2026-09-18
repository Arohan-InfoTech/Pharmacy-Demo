import { useEffect, useState } from "react";
import { db } from "../data/db";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { session } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(db.getDashboard(session));
  }, [session]);

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="card">
          <div className="stat-value">Rs. {data.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="card">
          <div className="stat-value">{data.totalBills}</div>
          <div className="stat-label">Bills Generated</div>
        </div>
        <div className="card">
          <div className="stat-value">{data.lowStock.length}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="card">
          <div className="stat-value">{data.expiringSoon.length}</div>
          <div className="stat-label">Expiring Soon (60 days)</div>
        </div>
      </div>

      <div className="card">
        <h3>Top Selling Medicines</h3>
        <table>
          <thead><tr><th>Medicine</th><th>Qty Sold</th></tr></thead>
          <tbody>
            {data.topItems.map(([name, qty]) => (
              <tr key={name}><td>{name}</td><td>{qty}</td></tr>
            ))}
            {data.topItems.length === 0 && (
              <tr><td colSpan={2}>No sales yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Alerts</h3>
        {data.lowStock.length === 0 && data.expiringSoon.length === 0 && <p>No alerts right now.</p>}
        <ul>
          {data.lowStock.map((m) => (
            <li key={m.id}><span className="badge low">Low stock</span> {m.name} — only {m.stock} left</li>
          ))}
          {data.expiringSoon.map((m) => (
            <li key={m.id}><span className="badge expiring">Expiring</span> {m.name} — expires {m.expiry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
