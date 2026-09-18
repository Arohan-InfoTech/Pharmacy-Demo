// Simple localStorage-backed "database" so this frontend runs fully
// standalone, with no backend/API required. Swap this file out for real
// fetch() calls later if you add a backend — every other file only talks
// to the functions exported here, not to localStorage directly.

const DB_KEY = "medtrack_db";
const SESSION_KEY = "medtrack_session";

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function seedDB() {
  const ownerId = uid("u");
  const storeId = uid("st");
  return {
    users: [
      {
        id: ownerId,
        name: "Store Admin",
        email: "admin@medtrack.com",
        password: "admin123", // demo only — plain text, never do this in production
        role: "admin",
        storeId,
      },
    ],
    stores: [{ id: storeId, name: "My Pharmacy", address: "", ownerId }],
    medicines: [
      { id: uid("m"), storeId, name: "Paracetamol 500mg", manufacturer: "Cipla", batch: "PB2201", expiry: "2027-03-01", stock: 320, lowStockAt: 50, price: 2.5, gst: 12 },
      { id: uid("m"), storeId, name: "Amoxicillin 250mg", manufacturer: "Sun Pharma", batch: "AX1187", expiry: "2026-11-15", stock: 18, lowStockAt: 30, price: 8.0, gst: 12 },
      { id: uid("m"), storeId, name: "Cetirizine 10mg", manufacturer: "Mankind", batch: "CT0932", expiry: "2026-10-05", stock: 150, lowStockAt: 40, price: 1.8, gst: 5 },
      { id: uid("m"), storeId, name: "Vitamin C Tablets", manufacturer: "Himalaya", batch: "VC7761", expiry: "2027-06-20", stock: 8, lowStockAt: 20, price: 4.0, gst: 5 },
      { id: uid("m"), storeId, name: "ORS Sachets", manufacturer: "FDC", batch: "OR4450", expiry: "2026-10-01", stock: 60, lowStockAt: 25, price: 12.0, gst: 5 },
    ],
    sales: [],
    billCounter: 1,
  };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const fresh = seedDB();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function sanitizeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

export const db = {
  // ---------- Auth ----------
  // First-time registration creates a brand new store + its admin account
  // (matches the "subscription business, one store per signup" model).
  registerStoreOwner({ name, email, password, storeName }) {
    const data = loadDB();
    if (data.users.find((u) => u.email === email)) {
      throw new Error("Email already registered");
    }
    const storeId = uid("st");
    const userId = uid("u");
    data.stores.push({ id: storeId, name: storeName || `${name}'s Pharmacy`, address: "", ownerId: userId });
    data.users.push({ id: userId, name, email, password, role: "admin", storeId });
    saveDB(data);
    const session = { userId, storeId, role: "admin", name, email };
    setSession(session);
    return session;
  },

  login(email, password) {
    const data = loadDB();
    const user = data.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    const session = { userId: user.id, storeId: user.storeId, role: user.role, name: user.name, email: user.email };
    setSession(session);
    return session;
  },

  logout() {
    setSession(null);
  },

  getSession,

  createStaff({ name, email, password }, session) {
    const data = loadDB();
    if (data.users.find((u) => u.email === email)) {
      throw new Error("Email already registered");
    }
    const user = { id: uid("u"), name, email, password, role: "staff", storeId: session.storeId };
    data.users.push(user);
    saveDB(data);
    return sanitizeUser(user);
  },

  listStaff(session) {
    const data = loadDB();
    return data.users.filter((u) => u.storeId === session.storeId).map(sanitizeUser);
  },

  // ---------- Store ----------
  getStore(session) {
    const data = loadDB();
    return data.stores.find((s) => s.id === session.storeId);
  },

  updateStore(updates, session) {
    const data = loadDB();
    const store = data.stores.find((s) => s.id === session.storeId);
    Object.assign(store, updates);
    saveDB(data);
    return store;
  },

  // ---------- Medicines / Inventory ----------
  listMedicines(session) {
    const data = loadDB();
    return data.medicines.filter((m) => m.storeId === session.storeId);
  },

  addMedicine(payload, session) {
    const data = loadDB();
    const med = { id: uid("m"), storeId: session.storeId, lowStockAt: 20, gst: 12, ...payload };
    data.medicines.push(med);
    saveDB(data);
    return med;
  },

  updateMedicine(id, updates, session) {
    const data = loadDB();
    const med = data.medicines.find((m) => m.id === id && m.storeId === session.storeId);
    if (!med) throw new Error("Medicine not found");
    Object.assign(med, updates);
    saveDB(data);
    return med;
  },

  deleteMedicine(id, session) {
    const data = loadDB();
    data.medicines = data.medicines.filter((m) => !(m.id === id && m.storeId === session.storeId));
    saveDB(data);
  },

  // ---------- Billing / Sales ----------
  createSale({ items, customerName, paymentMode }, session) {
    const data = loadDB();
    const saleItems = items.map(({ medicineId, quantity }) => {
      const med = data.medicines.find((m) => m.id === medicineId && m.storeId === session.storeId);
      if (!med) throw new Error("Medicine not found");
      if (med.stock < quantity) throw new Error(`Not enough stock for ${med.name}`);
      med.stock -= quantity;
      return { name: med.name, price: med.price, quantity, gst: med.gst };
    });
    const subtotal = saleItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = saleItems.reduce((s, i) => s + i.price * i.quantity * (i.gst / 100), 0);
    const total = subtotal + tax;
    const billNumber = "BILL-" + String(data.billCounter++).padStart(5, "0");
    const sale = {
      id: uid("b"),
      storeId: session.storeId,
      billNumber,
      customerName: customerName || "Walk-in",
      paymentMode: paymentMode || "Cash",
      items: saleItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      createdBy: session.userId,
      createdAt: new Date().toISOString(),
    };
    data.sales.unshift(sale);
    saveDB(data);
    return sale;
  },

  listSales(session) {
    const data = loadDB();
    return data.sales.filter((s) => s.storeId === session.storeId);
  },

  // ---------- Dashboard ----------
  getDashboard(session) {
    const meds = db.listMedicines(session);
    const sales = db.listSales(session);

    const totalRevenue = sales.reduce((s, b) => s + b.total, 0);
    const totalBills = sales.length;
    const lowStock = meds.filter((m) => m.stock <= m.lowStockAt);
    const expiringSoon = meds.filter((m) => daysUntil(m.expiry) <= 60);

    const itemMap = {};
    sales.forEach((s) => s.items.forEach((i) => { itemMap[i.name] = (itemMap[i.name] || 0) + i.quantity; }));
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalRevenue, totalBills, lowStock, expiringSoon, topItems };
  },
};

export { daysUntil };
