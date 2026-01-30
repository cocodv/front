import React, { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AdminPage from "./AdminPage";

const API = "https://api.manchestercreditunion.online";

// 

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
  <p className="mt-2 text-xs text-gray-400 max-w-xl mx-auto">
    This bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. 
    Your eligible deposits are protected by the Financial Services Compensation Scheme (FSCS) up to a total of £85,000 per person. 
    This means that if the bank were to fail, the FSCS would compensate you for your eligible deposits up to that limit. 
    Any deposits above £85,000 are unlikely to be covered.
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
