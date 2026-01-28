import React, { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AdminPage from "./AdminPage";

const API = "https://back-b38k.onrender.com"; // <-- keep consistent

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user info whenever token changes
  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    setLoading(true);
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      })
      .then(user => {
        setMe(user);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem("token");
        setMe(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setMe(null); // fully clear user state
  };

  if (!token) return <Login api={API} onLogin={t => {
    setToken(t);
    localStorage.setItem("token", t);
  }} />;

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {me && (
        <>
          <header className="text-center mt-12 text-sm text-gray-500 mb-8">
            &copy; Credit Union Member Online Account
            <p>
              Logged in as <b>{me.username}</b> ({me.is_admin ? "Admin" : "User"})
              <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
            </p>
          </header>

          <Dashboard api={API} token={token} user={me} />

          {me.is_admin && <AdminPage api={API} token={token} />}
        </>
      )}
    </div>
  );
}

export default App;
