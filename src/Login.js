import React, { useState } from "react";

export default function Login({ api, onLogin }) {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [error, setErr] = useState("");

  function submit(e) {
    e.preventDefault();

    fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(r => r.json())
      .then(data => {
        if (!data.access_token) throw new Error("Invalid login");

        onLogin(data.access_token);
        localStorage.setItem("token", data.access_token);
      })
      .catch(() => setErr("Invalid username or password"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md border border-gray-200">

        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
           Online Banking 
        </h1>

        <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
          Secure Login
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-3">{error}</p>
        )}

        <form onSubmit={submit} className="space-y-4">
          
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Username</label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter username"
              value={username}
              onChange={e => setUser(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPass(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">Test Accounts:</p>
          {/* <p>femi / femipass</p>
          <p>admin / adminpass</p> */}
        </div>
      </div>
    </div>
  );
}
