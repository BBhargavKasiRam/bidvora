import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, AlertTriangle, Eye, Clock } from "lucide-react";
import { api } from "../lib/api";

export const MediatorDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mediator') {
      navigate("/");
      return;
    }

    const fetchAuctions = async () => {
      try {
        const response = await api.get('/mediator/auctions');
        setAuctions(response);
      } catch (error) {
        console.error("Failed to fetch mediator auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [isAuthenticated, user, navigate]);

  if (loading) return <div className="p-8 text-center text-ink/60 font-serif">Loading assignments...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex items-center gap-4 mb-8 border-b border-ink/10 pb-6">
        <Shield className="w-10 h-10 text-gold" />
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink">Mediator Control Center</h1>
          <p className="text-sm text-ink/60 mt-1 uppercase tracking-widest font-medium">Global Auction Monitoring</p>
        </div>
      </div>

      <div className="bg-white border border-ink/10 shadow-sm p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-ink mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Active Rooms
        </h2>
        
        {auctions.length === 0 ? (
          <p className="text-ink/60 font-serif italic text-sm">No active auctions at this time.</p>
        ) : (
          <div className="grid gap-4">
            {auctions.map(auction => (
              <div key={auction.id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-ink/10 hover:border-gold/50 bg-paper/50 transition-colors">
                <div className="mb-4 md:mb-0 w-full md:w-1/3">
                  <h3 className="font-serif font-bold text-lg text-ink truncate">{auction.title}</h3>
                  <p className="text-xs text-ink/60 uppercase tracking-widest mt-1">Seller: {auction.seller_name}</p>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Current Bid</p>
                    <p className="font-serif text-lg text-gold font-bold">${Number(auction.current_price || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Flags</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-bold ${auction.flag_count > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {auction.flag_count}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Time Left</p>
                    <p className="text-xs text-ink/80 font-medium flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(auction.end_time) > new Date() ? 'Active' : 'Ending'}
                    </p>
                  </div>
                </div>
                
                <Link 
                  to={`/auction/${auction.id}`}
                  className="mt-4 md:mt-0 px-6 py-2 bg-ink text-paper text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Monitor Room
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
