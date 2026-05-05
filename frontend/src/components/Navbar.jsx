import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, LogIn, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-ink/10 py-4 px-6 md:px-12 flex justify-between items-center shadow-[0_4px_20px_rgba(42,35,24,0.08)]">
      <Link to="/" className="flex items-center gap-3 group relative">
        <Gavel className="w-8 h-8 text-gold group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-2xl font-serif font-bold tracking-tight text-ink letterpress">BIDVORA</span>
      </Link>
      
      <div className="flex items-center gap-8">
        {!user ? (
          <Link to="/gallery" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium">Gallery</Link>
        ) : user.role === 'auctioneer' ? (
          <Link to="/auctioneer-dashboard" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium">Auctioneer Dashboard</Link>
        ) : (
          <>
            <Link to="/" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium hidden md:block">Dashboard</Link>
            <Link to="/gallery" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium hidden md:block">Gallery</Link>
            <Link to="/orders" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium hidden md:block">Orders</Link>
            {(user.role === 'consignor' || user.role === 'seller') && (
              <>
                <Link to="/seller-analytics" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium hidden lg:block">Analytics</Link>
                <Link to="/my-consignments" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium hidden lg:block">My Consignments</Link>
                <Link to="/create" className="flex items-center gap-2 text-sm uppercase tracking-widest text-ink font-bold transition-all hover-lift bg-gold text-white px-4 py-2 rounded shadow-[0_4px_12px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.5)]">
                  <PlusCircle className="w-4 h-4" />
                  Consign Item
                </Link>
              </>
            )}
            {user.role === 'mediator' && (
              <Link to="/mediator-dashboard" className="text-sm uppercase tracking-widest text-ink/60 hover:text-gold transition-all font-medium">Mediator HQ</Link>
            )}
          </>
        )}

        {user ? (
          <div className="flex items-center gap-5 pl-8 border-l border-ink/10">
            <div className="flex items-center gap-3 group cursor-pointer hover-lift" onClick={() => navigate("/profile")}>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-gold/80 group-hover:text-gold transition-colors font-bold">
                  {user.role === 'consignor' ? 'Consignor' : user.role === 'auctioneer' ? 'Auctioneer' : 'Buyer'}
                </p>
                <p className="text-xs font-bold text-ink">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-paper text-gold flex items-center justify-center font-serif text-lg overflow-hidden border-2 border-gold/30 group-hover:border-gold group-hover:shadow-[0_0_12px_rgba(197,160,89,0.3)] transition-all shadow-md">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0)
                )}
              </div>
            </div>
            <button 
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-ink/50 hover:text-red-600 border border-ink/10 hover:border-red-400/50 hover:bg-red-50 rounded transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 text-sm uppercase tracking-widest text-ink/70 hover:text-gold transition-all font-medium">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-ink text-paper text-xs uppercase tracking-widest hover:bg-gold transition-all font-bold hover-lift rounded shadow-[0_4px_12px_rgba(42,35,24,0.2)]">
              Join Bidvora
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
