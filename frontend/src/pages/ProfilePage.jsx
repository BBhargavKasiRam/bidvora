import React from "react";
import { motion } from "motion/react";
import { User, Mail, Shield, Calendar, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <header className="mb-20 text-center">
        <div className="w-32 h-32 bg-ink text-paper rounded-full flex items-center justify-center text-5xl font-serif mx-auto mb-8 shadow-2xl border-4 border-gold/20">
          {user?.name?.charAt(0)}
        </div>
        <h1 className="text-5xl font-serif mb-4 tracking-tight">{user?.name}</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Elite Member since 2026</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section>
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-ink/40 mb-8 border-b border-ink/5 pb-4">Personal Information</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white border border-ink/5 flex items-center justify-center text-ink/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-1">Full Name</p>
                  <p className="text-lg font-serif">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white border border-ink/5 flex items-center justify-center text-ink/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-1">Email Address</p>
                  <p className="text-lg font-serif">{user?.email || "member@bidvora.com"}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-ink/40 mb-8 border-b border-ink/5 pb-4">Security</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white border border-ink/5 flex items-center justify-center text-ink/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-1">Account Status</p>
                  <p className="text-lg font-serif text-green-600">Verified & Secured</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-white border border-ink/5 p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-gold/5">
            <Settings className="w-32 h-32 rotate-12" />
          </div>
          <h3 className="text-2xl font-serif mb-10">Preferences</h3>
          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-light">Email Notifications</span>
              <div className="w-12 h-6 bg-gold rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-light">Two-Factor Auth</span>
              <div className="w-12 h-6 bg-ink/10 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-light">Public Profile</span>
              <div className="w-12 h-6 bg-gold rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            
            <button className="w-full py-4 border border-ink/10 text-[10px] uppercase tracking-widest font-bold hover:bg-ink hover:text-paper transition-all mt-8">
              Update Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
