// src/user/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, Mail, Calendar, Shield } from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";

const UserProfile = () => {
  const { getProfile, updateProfile, loading } = useUserApi();
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ name: "" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        const u = res?.data || res;
        setProfile(u);
        setForm({ name: u?.name || "" });
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("error", "Name required."); return; }
    setSaving(true);
    try {
      await updateProfile({ name: form.name });
      setProfile(p => ({ ...p, name: form.name }));
      showToast("success", "Profile updated!");
    } catch (e) {
      showToast("error", e.message || "Update failed.");
    } finally { setSaving(false); }
  };

  const STATUS_COLORS = { ACTIVE: "#10d990", SUSPENDED: "#f59e0b", BANNED: "#f43f8e" };
  const sc = STATUS_COLORS[profile?.status] || "#10d990";

  return (
    <UserLayout>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: "var(--font-mono)",
              background: toast.type === "success" ? "#10d99015" : "#f43f8e15",
              borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30",
              color: toast.type === "success" ? "#10d990" : "#f43f8e",
            }}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>User / Profile</p>
          <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
            style={{ fontFamily: "var(--font-display)" }}>My Profile</h1>
        </motion.div>

        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-6 mb-4 relative overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-[#00e5ff] via-[#10d990] to-transparent opacity-60" />
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-[#020408] flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#00e5ff,#10d990)", fontFamily: "var(--font-display)", boxShadow: "0 0 24px #00e5ff44" }}>
              {profile?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-[#e8f4ff] mb-0.5">{profile?.name}</p>
              <p className="text-[11px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{profile?.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold"
                  style={{ color: sc, fontFamily: "var(--font-mono)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc }} />
                  {profile?.status || "Active"}
                </span>
                <span className="text-[10px] text-[#00e5ff] uppercase tracking-wider font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}>USER</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a4a]">
            <div className="w-8 h-8 rounded-xl bg-[#00e5ff15] border border-[#00e5ff30] flex items-center justify-center">
              <User className="w-4 h-4 text-[#00e5ff]" />
            </div>
            <p className="text-xs font-black text-[#e8f4ff] uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}>Edit Profile</p>
          </div>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-mono)" }}>Full Name</label>
              <input
                className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#00e5ff44] text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Email — readonly */}
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-mono)" }}>Email</label>
              <div className="flex items-center gap-3 bg-[#04080f] border border-[#1a2a4a]/50 rounded-xl px-4 py-3">
                <Mail className="w-3.5 h-3.5 text-[#3d6080] flex-shrink-0" />
                <span className="text-sm text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  {profile?.email}
                </span>
              </div>
            </div>

            {/* Joined */}
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-mono)" }}>Member Since</label>
              <div className="flex items-center gap-3 bg-[#04080f] border border-[#1a2a4a]/50 rounded-xl px-4 py-3">
                <Calendar className="w-3.5 h-3.5 text-[#3d6080] flex-shrink-0" />
                <span className="text-sm text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </span>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave} disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
              <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;