import React, { useState, useEffect } from "react";

export default function AdminPage({ api, token }) {
  const [username, setUser] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [pendingTxs, setPendingTxs] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetchPending();
  }, [token]);

  function fetchPending() {
    fetch(`${api}/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Forbidden or fetch error");
        return res.json();
      })
      .then(setPendingTxs)
      .catch(err => {
        console.error(err);
        setPendingTxs([]); // safe fallback
      });
  }

  function submit(e) {
    e.preventDefault();
    setMsg("");

    fetch(`${api}/admin/credit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ username, amount: parseFloat(amount) })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(data => setMsg(data.detail))
      .catch(() => setMsg("Error"));
  }

  function approve(txId) {
    fetch(`${api}/admin/approve/${txId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(() => fetchPending())
      .catch(() => setMsg("Error approving transaction"));
  }

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Admin — Add Credit</h3>
      <form onSubmit={submit}>
        <input placeholder="Username" value={username} onChange={e => setUser(e.target.value)} />
        <br /><br />
        <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <br /><br />
        <button>Add Credit</button>
      </form>
      {msg && <p>{msg}</p>}

      <h3 style={{ marginTop: 40 }}>Pending Transactions</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th><th>User ID</th><th>Amount</th><th>Description</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(pendingTxs) ? pendingTxs : []).map(tx => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.user_id}</td>
              <td>{tx.amount}</td>
              <td>{tx.description}</td>
              <td>
                <button onClick={() => approve(tx.id)}>Approve</button>
              </td>
            </tr>
          ))}
          {pendingTxs.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No pending transactions</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
