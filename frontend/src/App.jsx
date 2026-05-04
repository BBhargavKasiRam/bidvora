import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Gavel, Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";

// Lazy load pages for performance and to isolate side-effects (like Stripe)
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const CreateAuctionPage = lazy(() => import("./pages/CreateAuctionPage").then(m => ({ default: m.CreateAuctionPage })));
const AuctionDetailPage = lazy(() => import("./pages/AuctionDetailPage").then(m => ({ default: m.AuctionDetailPage })));
const MyConsignmentsPage = lazy(() => import("./pages/MyAuctionsPage").then(m => ({ default: m.MyAuctionsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const AuctioneerDashboardPage = lazy(() => import("./pages/AuctioneerDashboardPage").then(m => ({ default: m.AuctioneerDashboardPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const SellerAnalyticsPage = lazy(() => import("./pages/SellerAnalyticsPage").then(m => ({ default: m.SellerAnalyticsPage })));
const MediatorDashboardPage = lazy(() => import("./pages/MediatorDashboardPage").then(m => ({ default: m.MediatorDashboardPage })));

const PageLoader = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-gold" />
    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Loading Command Center</p>
  </div>
);

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-paper">
        <Navbar />

        <main className="grow">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Home Route */}
                <Route
                  path="/"
                  element={
                    !isAuthenticated ? (
                      <LandingPage />
                    ) : user?.role === "auctioneer" ? (
                      <AuctioneerDashboardPage />
                    ) : (
                      <DashboardPage />
                    )
                  }
                />

                <Route
                  path="/auctioneer-dashboard"
                  element={<AuctioneerDashboardPage />}
                />
                <Route
                  path="/auctioneer/dashboard"
                  element={<AuctioneerDashboardPage />}
                />

                <Route
                  path="/auctioneer"
                  element={
                    isAuthenticated && user?.role === "auctioneer" ? (
                      <AuctioneerDashboardPage />
                    ) : (
                      <DashboardPage />
                    )
                  }
                />

                {/* General Routes */}
                <Route path="/gallery" element={<HomePage />} />
                <Route path="/browse" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/create" element={<CreateAuctionPage />} />
                <Route path="/my-consignments" element={<MyConsignmentsPage />} />
                <Route path="/auction/:id" element={<AuctionDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/seller-analytics" element={<SellerAnalyticsPage />} />
                <Route path="/mediator-dashboard" element={<MediatorDashboardPage />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t border-ink/10 py-20 px-8 mt-32 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Gavel className="w-8 h-8 text-gold" />
                  <span className="text-2xl font-serif font-bold tracking-tight">
                    BIDVORA
                  </span>
                </div>
                <p className="text-sm text-ink/50 font-light leading-relaxed max-w-xs">
                  The world's most exclusive marketplace for rare acquisitions
                  and timeless treasures. Curated for the discerning collector.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-ink/40">
                    Marketplace
                  </h4>
                  <ul className="space-y-4 text-xs uppercase tracking-widest font-medium text-ink/60">
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        Browse All
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        Recent Sales
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        Upcoming
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-ink/40">
                    Company
                  </h4>
                  <ul className="space-y-4 text-xs uppercase tracking-widest font-medium text-ink/60">
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gold transition-colors">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[9px] uppercase tracking-[0.4em] text-ink/30">
                © 2026 Bidvora International. All Rights Reserved.
              </p>
              <div className="flex gap-10">
                <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">
                  London
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">
                  New York
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] text-ink/30">
                  Hong Kong
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

