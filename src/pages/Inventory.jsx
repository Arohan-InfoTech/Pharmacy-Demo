import { useEffect, useState } from "react";
import { db, daysUntil } from "../data/db";
import { useAuth } from "../context/AuthContext";

const empty = { name: "", manufacturer: "", batch: "", expiry: "", stock: "", lowStockAt: 20, price: "", gst: 12 };

export default function Inventory() {
  const { session } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => setMedicines(db.listMedicines(session));
  useEffect(load, [session]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        stock: Number(form.stock) || 0,
        lowStockAt: Number(form.lowStockAt) || 0,
        price: Number(form.price) || 0,
        gst: Number(form.gst) || 0,
      };
      if (editingId) db.updateMedicine(editingId, payload, session);
      else db.addMedicine(payload, session);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (m) => {
    setForm({
      name: m.name,
      manufacturer: m.manufacturer,
      batch: m.batch,
      expiry: m.expiry,
      stock: m.stock,
      lowStockAt: m.lowStockAt,
      price: m.price,
      gst: m.gst,
    });
    setEditingId(m.id);
  };

  const remove = (id) => {
    db.deleteMedicine(id, session);
    load();
  };

  return (
    <div className="container">
      <h2>Inventory</h2>
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>{editingId ? "Edit Medicine" : "Add Medicine"}</h3>
        <form onSubmit={submit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label>Manufacturer</label>
          <input name="manufacturer" value={form.manufacturer} onChange={handleChange} />
          <label>Batch Number</label>
          <input name="batch" value={form.batch} onChange={handleChange} />
          <label>Expiry Date</label>
          <input name="expiry" type="date" value={form.expiry} onChange={handleChange} />
          <label>Stock Quantity</label>
          <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
          <label>Low Stock Alert Threshold</label>
          <input name="lowStockAt" type="number" value={form.lowStockAt} onChange={handleChange} />
          <label>Price (per unit)</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
          <label>GST %</label>
          <input name="gst" type="number" value={form.gst} onChange={handleChange} />
          <button className="btn" type="submit">{editingId ? "Update" : "Add"} Medicine</button>
          {editingId && (
            <button
              type="button"
              className="btn secondary"
              style={{ marginLeft: 8 }}
              onClick={() => { setForm(empty); setEditingId(null); }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Batch</th><th>Expiry</th><th>Stock</th><th>Price</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((m) => {
            const daysLeft = m.expiry ? daysUntil(m.expiry) : 999;
            return (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.batch}</td>
                <td>{m.expiry}</td>
                <td>{m.stock}</td>
                <td>Rs. {m.price.toFixed(2)}</td>
                <td>
                  {m.stock <= m.lowStockAt && <span className="badge low">Low stock</span>}{" "}
                  {daysLeft <= 60 && <span className="badge expiring">Expiring soon</span>}
                  {m.stock > m.lowStockAt && daysLeft > 60 && <span className="badge">OK</span>}
                </td>
                <td>
                  <button className="btn secondary" onClick={() => edit(m)}>Edit</button>{" "}
                  <button className="btn secondary" onClick={() => remove(m.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
