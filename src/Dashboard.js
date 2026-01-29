import React, { useState, useEffect } from "react";
import StatementDownloader from "./StatementDownloader";


export default function Dashboard({ api, token, user }) {
  const [balance, setBalance] = useState(null);
  const [txs, setTxs] = useState([]);
  const [amount, setAmount] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [account, setAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Generic fetch helper
  const fetchJson = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch error:", res.status, text);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error("Fetch exception:", err);
      return null;
    }
  };

  // Load balance and transactions
  const loadData = async () => {
    if (!token) return;
    setLoading(true);

    const [balanceData, txsData] = await Promise.all([
      fetchJson(`${api}/balance`, { headers: { Authorization: `Bearer ${token}` } }),
      fetchJson(`${api}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (balanceData) setBalance(balanceData);
    if (txsData) setTxs(txsData);

    // Only fetch admin data if user is admin
    if (user?.role === "admin") {
      const adminData = await fetchJson(`${api}/admin/pending`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Admin pending:", adminData);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token, user]);

  // Withdraw funds
  const withdraw = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!amount || !sortCode || !account || !accountHolder) {
      setMsg("Amount, Sort Code, Account #, and Account Holder Name are required.");
      return;
    }

    const body = {
      amount: parseFloat(amount),
      sort_code: sortCode,
      account_number: account,
      account_holder_name: accountHolder,
      description: description || "Withdrawal",
    };

    const data = await fetchJson(`${api}/withdraw`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (data) {
      setMsg(data.detail || "Withdrawal submitted");
      setAmount(""); setSortCode(""); setAccount(""); setAccountHolder(""); setDescription("");
      loadData();
    } else {
      setMsg("Error submitting withdrawal");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10 font-sans">
      {/* BANK INFO */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-2xl rounded-3xl p-8 mb-10 text-center w-full max-w-xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Manchester Credit Union</h1>
        <p className="text-lg md:text-xl font-medium mb-1">Miss Lena Willems</p>
        <p className="text-sm md:text-lg opacity-90">2 Maybury Street, Gorton M18 8GP, United Kingdom</p>
      </div>

      {/* BALANCE CARDS */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto">
          {[
            { title: "Current Balance", value: balance.balance, color: "text-blue-700" },
            { title: "Total Credits", value: balance.total_credits, color: "text-green-600" },
            { title: "Total Debits", value: balance.total_debits, color: "text-red-600" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center hover:scale-105 transform transition"
            >
              <h3 className="text-gray-500 font-medium">{card.title}</h3>
              <p className={`text-3xl md:text-2xl font-bold mt-3 ${card.color}`}>£{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* WITHDRAW FORM */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-10 max-w-xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Withdraw Funds</h3>
        <form onSubmit={withdraw} className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount"
            />
            <input
              className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={sortCode} onChange={e => setSortCode(e.target.value)} placeholder="Sort Code"
            />
            <input
              className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={account} onChange={e => setAccount(e.target.value)} placeholder="Account Number"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Account Holder Name"
            />
            <input
              className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Reference / Description"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold shadow-md">
              Withdraw
            </button>
          </div>
        </form>
        {msg && <p className="text-green-600 font-medium mt-4 text-center">{msg}</p>}
      </div>
    
{/* {user && <StatementDownloader user={user} api="http://localhost:5000" />} */}


{user && <StatementDownloader user={user} api="https://back-b38k.onrender.com" />}



      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 max-w-5xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Transactions</h3>
        {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 rounded-t-xl">
              <tr>
                {["Date", "Status", "Amount", "Description"].map((th, i) => (
                  <th key={i} className="px-6 py-3 text-left text-gray-600 font-medium">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txs.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {t.status === "pending" && (
                      <span className="inline-block w-5 h-5 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></span>
                    )}
                    <span className="capitalize">{t.status}</span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    £{t.amount}
                  </td>
                  <td className="px-6 py-4">{t.description}</td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
