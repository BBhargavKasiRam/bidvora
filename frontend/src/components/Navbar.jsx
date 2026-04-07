import React from 'react';
import { Gavel } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Gavel className="text-purple-600 w-6 h-6" />
        <span className="font-bold text-xl tracking-tight">Auctionly</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-sm font-medium text-gray-600 hover:text-purple-600">Sign In</button>
        <button className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-100">
          Get Started
        </button>
      </div>
    </nav>
  );
}