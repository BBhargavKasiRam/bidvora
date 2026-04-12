import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, LogIn, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-ink/10 py-6 px-8 flex justify-between items-center bg-paper/80 backdrop-blur-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <Gavel className="w-8 h-8 text-gold group-hover:rotate-12 transition-transform" />
        <span className="text-2xl font-serif font-bold tracking-tight">BIDVORA</span>
      </Link>
      
      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Dashboard</Link>
        <Link to="/browse" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Gallery</Link>
        {user ? (
          <>
            <Link to="/orders" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Orders</Link>
            <Link to="/create" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
              <PlusCircle className="w-4 h-4" />
              List Item
            </Link>
            <div className="flex items-center gap-4 pl-8 border-l border-ink/10">
              <Link to="/profile" className="text-right group">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 group-hover:text-gold transition-colors">Collector</p>
                <p className="text-xs font-bold group-hover:text-gold transition-colors">{user.name}</p>
              </Link>
              <button 
                onClick={() => { logout(); navigate("/login"); }}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-ink text-paper text-xs uppercase tracking-widest hover:bg-gold transition-colors rounded-full font-bold">
              Join Bidvora
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
