import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { BarChart3, TrendingUp, Package, Activity, DollarSign } from "lucide-react";
import { api } from "../lib/api";

export const SellerAnalyticsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "consignor") {
      navigate("/");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const data = await api.get("/auctions/seller-analytics");
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 text-ink">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-gold" />
          Analytics Dashboard
        </h1>
        <p className="text-ink/50 uppercase tracking-widest text-xs mt-3 font-bold">
          Performance Overview
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 border border-ink/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-gold/50" />
          </div>
          <p className="text-4xl font-serif">${Number(analytics.total_revenue || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 border border-ink/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-ink" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Total Auctions</h3>
            <Package className="w-5 h-5 text-ink/20" />
          </div>
          <p className="text-4xl font-serif">{analytics.total_auctions || 0}</p>
        </div>

        <div className="bg-white p-6 border border-ink/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Active Listings</h3>
            <Activity className="w-5 h-5 text-green-500/50" />
          </div>
          <p className="text-4xl font-serif">{analytics.active_auctions || 0}</p>
        </div>

        <div className="bg-white p-6 border border-ink/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Avg. Sale Price</h3>
            <TrendingUp className="w-5 h-5 text-amber-500/50" />
          </div>
          <p className="text-4xl font-serif">${Number(analytics.average_sale_price || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-8 border border-ink/10 shadow-sm text-center py-20">
        <BarChart3 className="w-16 h-16 text-ink/10 mx-auto mb-4" />
        <h2 className="text-2xl font-serif mb-2">More insights coming soon</h2>
        <p className="text-ink/40 text-sm">We are actively developing advanced charting capabilities for sellers.</p>
      </div>
    </div>
  );
};
