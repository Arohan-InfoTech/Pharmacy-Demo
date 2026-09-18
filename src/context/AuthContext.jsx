import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../data/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionState(db.getSession());
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const s = db.login(email, password);
    setSessionState(s);
    return s;
  };

  const registerStoreOwner = (payload) => {
    const s = db.registerStoreOwner(payload);
    setSessionState(s);
    return s;
  };

  const logout = () => {
    db.logout();
    setSessionState(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, registerStoreOwner, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
