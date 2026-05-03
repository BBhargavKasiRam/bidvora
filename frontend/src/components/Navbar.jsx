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
        {!user || user.role !== 'mediator' ? (
          <Link to="/browse" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Gallery</Link>
        ) : null}
        
        {user ? (
          <>
            {user.role === 'buyer' && (
              <Link to="/orders" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Orders</Link>
            )}
            {user.role === 'seller' && (
              <>
                <Link to="/orders" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Orders</Link>
                <Link to="/my-auctions" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">My Auctions</Link>
                <Link to="/create" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
                  <PlusCircle className="w-4 h-4" />
                  List Item
                </Link>
              </>
            )}
            {user.role === 'mediator' && (

              <Link to="/mediator" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">Mediator Dashboard</Link>

            )}
            <div className="flex items-center gap-4 pl-8 border-l border-ink/10">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 group-hover:text-gold transition-colors">

                    {user.role === 'seller' ? 'Seller' : user.role === 'mediator' ? 'Mediator' : 'Buyer'}

                  </p>
                  <p className="text-xs font-bold group-hover:text-gold transition-colors">{user.name}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-serif text-lg overflow-hidden border-2 border-transparent group-hover:border-gold transition-colors shadow-sm">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0)
                  )}
                </div>
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
