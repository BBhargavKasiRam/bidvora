"use client";

import { useState } from "react";
import API from "../../services/api";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });

  const login = () => {
    API.post("/auth/login", data)
      .then(res => {
        localStorage.setItem("token", res.data.token);
        alert("Login success");
      });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={e => setData({ ...data, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-2"
          onChange={e => setData({ ...data, password: e.target.value })}
        />

        <button onClick={login} className="bg-blue-500 text-white w-full py-2">
          Login
        </button>
      </div>
    </div>
  );
}