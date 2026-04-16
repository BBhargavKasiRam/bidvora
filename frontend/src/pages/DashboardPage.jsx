import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Package, 
  User, 
  Clock, 
  Plus, 
  ChevronRight,
  Gavel
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { AuctionCard } from "../components/AuctionCard";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active: 0, won: 0, listed: 0 });
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auctions = await api.get("/auctions");
        setRecentAuctions(auctions.slice(0, 3));
        setStats({
          active: auctions.length,
          won: 2,
          listed: 1
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-4 block">Member Dashboard</span>
          <h1 className="text-6xl font-serif tracking-tight">Welcome, <span className="italic">{user?.name}</span></h1>
        </div>
        <Link 
          to="/create" 
          className="px-8 py-4 bg-ink text-paper text-[10px] uppercase tracking-widest font-bold hover:bg-gold transition-all rounded-full flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          List New Item
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white p-10 border border-ink/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-gold/10 group-hover:text-gold/20 transition-colors">
            <Gavel className="w-20 h-20" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-4">Active Auctions</p>
          <p className="text-5xl font-serif font-bold">{stats.active}</p>
        </div>
        <div className="bg-white p-10 border border-ink/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-gold/10 group-hover:text-gold/20 transition-colors">
            <Package className="w-20 h-20" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-4">Items Won</p>
          <p className="text-5xl font-serif font-bold">{stats.won}</p>
        </div>
        <div className="bg-white p-10 border border-ink/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-gold/10 group-hover:text-gold/20 transition-colors">
            <TrendingUp className="w-20 h-20" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-4">My Listings</p>
          <p className="text-5xl font-serif font-bold">{stats.listed}</p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
        
        {/* ✅ CHANGED HERE */}
        <Link to="/gallery" className="lg:col-span-2 bg-ink p-10 text-paper flex flex-col justify-between group hover:bg-gold transition-colors">
          <h3 className="text-3xl font-serif mb-8">Explore the Gallery</h3>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">View All Auctions</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        <Link to="/orders" className="bg-white p-10 border border-ink/5 flex flex-col justify-between group hover:border-gold transition-colors">
          <h3 className="text-2xl font-serif mb-8">My Orders</h3>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">Track Purchases</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        <Link to="/profile" className="bg-white p-10 border border-ink/5 flex flex-col justify-between group hover:border-gold transition-colors">
          <h3 className="text-2xl font-serif mb-8">Account</h3>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40">Manage Profile</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Auctions */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-serif">Featured Acquisitions</h2>

          {/* ✅ CHANGED HERE */}
          <Link to="/gallery" className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-ink transition-colors">
            View All Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {recentAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>
    </div>
  );
};
