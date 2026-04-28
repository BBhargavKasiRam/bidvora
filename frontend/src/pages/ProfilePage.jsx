import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Shield, Settings, Edit3, Save, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Sync formData with user when user changes or entering edit mode
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, isEditing]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
    publicProfile: true,
  });

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUpdatePreferences = () => {
    setSuccess("Preferences updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return setError("Name and email are required");
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await api.put("/auth/profile", formData);
      
      // Update local auth context
      updateUser(response.user);
      
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <header className="mb-20 text-center relative">
        <div className="w-32 h-32 bg-ink text-paper rounded-full flex items-center justify-center text-5xl font-serif mx-auto mb-8 shadow-2xl border-4 border-gold/20 relative group">
          {user?.name?.charAt(0)}
          {!isEditing && (
             <button 
               onClick={() => setIsEditing(true)}
               className="absolute -right-2 -bottom-2 w-10 h-10 bg-gold text-ink rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
             >
               <Edit3 size={18} />
             </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="max-w-xs mx-auto">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-4xl font-serif mb-2 tracking-tight text-center w-full border-b border-gold bg-transparent outline-none pb-2"
              autoFocus
            />
          </div>
        ) : (
          <h1 className="text-5xl font-serif mb-4 tracking-tight">{user?.name}</h1>
        )}
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Elite Member since 2026</p>
      </header>

      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-12 p-5 text-[10px] flex items-start gap-3 uppercase font-bold border-l-2 shadow-sm ${
              error ? "bg-red-50 text-red-600 border-red-600" : "bg-gold/10 text-gold border-gold"
            }`}
          >
            {error ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            <span>{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section className="bg-white border border-ink/5 p-10 shadow-xl relative">
            <div className="flex justify-between items-center mb-10 border-b border-ink/5 pb-4">
               <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-ink/40">Personal Information</h3>
               {isEditing && (
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-ink/40 hover:text-ink transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="text-gold hover:text-gold/80 transition-colors"
                      title="Save Changes"
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                    </button>
                 </div>
               )}
            </div>
            
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-ink/5 flex items-center justify-center text-ink/30 rounded-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="grow">
                  <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-1">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg font-serif w-full border-b border-gold/30 bg-transparent outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-lg font-serif">{user?.name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-ink/5 flex items-center justify-center text-ink/30 rounded-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="grow">
                  <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold mb-1">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-lg font-serif w-full border-b border-gold/30 bg-transparent outline-none focus:border-gold"
                    />
                  ) : (
                    <p className="text-lg font-serif">{user?.email}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-ink/5 p-10 shadow-xl">
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-ink/40 mb-10 border-b border-ink/5 pb-4">Security</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-ink/5 flex items-center justify-center text-ink/30 rounded-sm">
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

        <div className="bg-ink border border-ink/5 p-12 shadow-2xl relative overflow-hidden text-paper">
          <div className="absolute top-0 right-0 p-8 text-white/5">
            <Settings className="w-32 h-32 rotate-12" />
          </div>
          <h3 className="text-2xl font-serif mb-12 text-gold">Preferences</h3>
          <div className="space-y-10 relative z-10">
            <div className="flex justify-between items-center group">
              <span className="text-sm uppercase tracking-widest group-hover:text-gold transition-colors">Email Notifications</span>
              <div
                onClick={() => togglePreference("emailNotifications")}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  preferences.emailNotifications ? "bg-gold" : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: preferences.emailNotifications ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </div>
            </div>

            <div className="flex justify-between items-center group">
              <span className="text-sm uppercase tracking-widest group-hover:text-gold transition-colors">Two-Factor Auth</span>
              <div
                onClick={() => togglePreference("twoFactorAuth")}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  preferences.twoFactorAuth ? "bg-gold" : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: preferences.twoFactorAuth ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </div>
            </div>

            <div className="flex justify-between items-center group">
              <span className="text-sm uppercase tracking-widest group-hover:text-gold transition-colors">Public Profile</span>
              <div
                onClick={() => togglePreference("publicProfile")}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  preferences.publicProfile ? "bg-gold" : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: preferences.publicProfile ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </div>
            </div>

            <button
              onClick={handleUpdatePreferences}
              className="w-full py-5 border border-white/10 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold hover:text-ink transition-all mt-10 hover:border-gold"
            >
              Update Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};