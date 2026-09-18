import { useEffect, useState } from "react";
import { db } from "../data/db";
import { downloadBillPdf } from "../data/pdf";
import { useAuth } from "../context/AuthContext";

export default function Sales() {
  const { session } = useAuth();
  const [sales, setSales] = useState([]);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    setSales(db.listSales(session));
    setStoreName(db.getStore(session)?.name || "");
  }, [session]);

  return (
    <div className="container">
      <h2>Sales History</h2>
      {sales.length === 0 && <p>No bills generated yet — create one from Billing.</p>}
      {sales.map((s) => (
        <div className="card" key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{s.billNumber}</strong>
            <span className="badge">{s.paymentMode}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            {new Date(s.createdAt).toLocaleString()} — {s.customerName}
          </p>
          <ul>
            {s.items.map((i, idx) => (
              <li key={idx}>
                {i.name} x{i.quantity} — Rs. {(i.price * i.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p>Total: Rs. {s.total.toFixed(2)}</p>
          <button className="btn secondary" onClick={() => downloadBillPdf(s, storeName)}>
            Download Bill (PDF)
          </button>
        </div>
      ))}
    </div>
  );
}
