import React, { useState } from "react";

export default function StatementDownloader({ txs, user }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState([]);

  const filterTxs = () => {
    if (!from || !to) return;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const result = txs.filter(t => {
      const d = new Date(t.created_at);
      return d >= fromDate && d <= toDate;
    });

    setFiltered(result);
  };

  const downloadStatement = () => {
    let csv = "";
    csv += `Manchester Credit Union\n`;
    csv += `Name: ${user.username}\n`;
    csv += `Address: 2 Maybury Street, Gorton M18 8GP, United Kingdom\n`;
    csv += `Statement Period: ${from} to ${to}\n\n`;
    csv += `Date,Status,Type,Amount,Description\n`;

    filtered.forEach(t => {
      csv += `${new Date(t.created_at).toLocaleString()},${t.status},${t.type},${t.amount},${t.description}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${from}_to_${to}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 max-w-5xl mx-auto mb-10">
      <h3 className="text-xl font-semibold text-center mb-4">
        Download Bank Statement
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={filterTxs}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {filtered.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Found {filtered.length} transactions
          </p>

          <button
            onClick={downloadStatement}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Download Statement
          </button>
        </>
      )}

      {filtered.length === 0 && from && to && (
        <p className="text-gray-500 mt-2">
          No transactions in selected range.
        </p>
      )}
    </div>
  );
}
