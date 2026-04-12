import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateAuctionPage } from "./pages/CreateAuctionPage";
import { AuctionDetailPage } from "./pages/AuctionDetailPage";
import { Gavel } from "lucide-react";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-paper">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={isAuthenticated ? <DashboardPage /> : <LandingPage />} />
                <Route path="/browse" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/create" element={<CreateAuctionPage />} />
                <Route path="/auction/:id" element={<AuctionDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </AnimatePresence>
          </main>
          <footer className="border-t border-ink/10 py-20 px-8 mt-32 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Gavel className="w-8 h-8 text-gold" />
                    <span className="text-2xl font-serif font-bold tracking-tight">BIDVORA</span>
                  </div>
                  <p className="text-sm text-ink/50 font-light leading-relaxed max-w-xs">
                    The world's most exclusive marketplace for rare acquisitions and timeless treasures. Curated for the discerning collector.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-ink/40">Marketplace</h4>
                    <ul className="space-y-4 text-xs uppercase tracking-widest font-medium text-ink/60">
                      <li><a href="#" className="hover:text-gold transition-colors">Browse All</a></li>
                      <li><a href="#" className="hover:text-gold transition-colors">Recent Sales</a></li>
                      <li><a href="#" className="hover:text-gold transition-colors">Upcoming</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-ink/40">Company</h4>
                    <ul className="space-y-4 text-xs uppercase tracking-widest font-medium text-ink/60">
                      <li><a href="#" className="hover:text-gold transition-colors">About</a></li>
                      <li><a href="#" className="hover:text-gold transition-colors">Privacy</a></li>
                      <li><a href="#" className="hover:text-gold transition-colors">Terms</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="pt-12 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[9px] uppercase tracking-[0.4em] text-ink/30">© 2026 Bidvora International. All Rights Reserved.</p>
                <div className="flex gap-10">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">London</span>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">New York</span>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">Hong Kong</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
  );
}
