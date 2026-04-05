"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="font-bold text-xl">Bidvora</h1>

      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/login">Login</Link>
      </div>
    </div>
  );
}