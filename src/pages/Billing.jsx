import { useEffect, useState } from "react";
import { db } from "../data/db";
import { useAuth } from "../context/AuthContext";

export default function Billing() {
  const { session } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => setMedicines(db.listMedicines(session));
  useEffect(load, [session]);

  const changeQty = (id, delta, max) => {
    setCart((c) => {
      const next = { ...c };
      const val = (next[id] || 0) + delta;
      if (val <= 0) delete next[id];
      else if (max !== undefined && val > max) return c;
      else next[id] = val;
      return next;
    });
  };

  const filtered = medicines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const cartEntries = Object.entries(cart);
  const subtotal = cartEntries.reduce((s, [id, qty]) => {
    const m = medicines.find((x) => x.id === id);
    return s + (m ? m.price * qty : 0);
  }, 0);
  const tax = cartEntries.reduce((s, [id, qty]) => {
    const m = medicines.find((x) => x.id === id);
    return s + (m ? m.price * qty * (m.gst / 100) : 0);
  }, 0);
  const total = subtotal + tax;

  const generateBill = () => {
    setError("");
    setMessage("");
    try {
      const items = cartEntries.map(([medicineId, quantity]) => ({ medicineId, quantity }));
      if (items.length === 0) return setError("Add at least one medicine");
      const sale = db.createSale({ items, customerName, paymentMode }, session);
      setMessage(`Bill generated: ${sale.billNumber} — total Rs. ${sale.total.toFixed(2)}`);
      setCart({});
      setCustomerName("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2>Billing (POS)</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <input
        placeholder="Search medicine by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid">
        {filtered.map((m) => {
          const low = m.stock <= m.lowStockAt;
          return (
            <div className="card" key={m.id}>
              <strong>{m.name}</strong>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{m.manufacturer} · Batch {m.batch}</p>
              <p>Rs. {m.price.toFixed(2)} <span className="badge">Stock: {m.stock}</span></p>
              {low && <span className="badge low">Low stock</span>}
              <div className="qty-control" style={{ marginTop: 8 }}>
                <button onClick={() => changeQty(m.id, -1)}>-</button>
                <span>{cart[m.id] || 0}</span>
                <button onClick={() => changeQty(m.id, 1, m.stock)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {cartEntries.length > 0 && (
        <div className="card" style={{ position: "sticky", bottom: 16 }}>
          <label>Customer Name (optional)</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
          <label>Payment Mode</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
          <p>
            Subtotal: Rs. {subtotal.toFixed(2)} + Tax: Rs. {tax.toFixed(2)} ={" "}
            <strong>Total: Rs. {total.toFixed(2)}</strong>
          </p>
          <button className="btn" onClick={generateBill}>Generate Bill</button>
        </div>
      )}
    </div>
  );
}
