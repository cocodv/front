import React, { useState } from "react";

export default function StatementDownloader({ user, api }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setError("");

    // Ensure user is loaded
    const userId = user?._id || user?.id;
    if (!userId) {
      setError("User not loaded");
      return;
    }

    if (!start || !end) {
      setError("Please select a start and end date");
      return;
    }

    setLoading(true);
    try {
      const url = `${api}/statement?user_id=${userId}&start=${start}&end=${end}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch statement");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `statement_${start}_to_${end}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      setError("Error downloading statement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8 max-w-xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Download Statement</h3>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="date"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="date"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      {error && <p className="text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
