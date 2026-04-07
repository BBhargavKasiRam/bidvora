import React from 'react';
import Navbar from './components/Navbar';
import { Zap, Shield, LayoutDashboard, Link as LinkIcon, ArrowRight } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-20 text-center px-4 max-w-4xl mx-auto">
        <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Live Auction Platform
        </span>
        <h1 className="text-5xl md:text-6xl font-black mt-6 leading-tight text-gray-900">
          Real-Time Auctions <br />
          <span className="text-purple-600">Built for Winners</span>
        </h1>
        <p className="mt-6 text-gray-500 text-lg leading-relaxed">
          Create exclusive auctions, place real-time bids, and win unique items. 
          A modern auction platform with instant payments and secure transactions.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl flex items-center gap-2">
             <LinkIcon size={16} className="text-purple-600" />
             <span className="text-sm font-medium text-purple-900 italic">Invite-Only Auctions</span>
             <span className="text-xs text-purple-400">Each auction has a unique link.</span>
          </div>

          <div className="flex gap-4">
            <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 shadow-xl shadow-purple-200 transition">
              Start Bidding <ArrowRight size={18}/>
            </button>
            <button className="border border-purple-200 text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition">
              Create Auction
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <FeatureCard icon={<LinkIcon className="text-purple-600"/>} title="Link-Based Access" desc="Share unique auction links with your community." />
        <FeatureCard icon={<Zap className="text-purple-600"/>} title="Real-Time Bidding" desc="Watch bids update instantly as they happen." />
        <FeatureCard icon={<Shield className="text-purple-600"/>} title="Secure Payments" desc="Automatic payment processing with Stripe." />
        <FeatureCard icon={<LayoutDashboard className="text-purple-600"/>} title="Seller Dashboard" desc="Manage your auctions and track earnings." />
      </section>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="border border-gray-100 p-8 rounded-3xl bg-white shadow-sm text-center hover:shadow-md transition">
    <div className="bg-purple-50 w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-4">{icon}</div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;