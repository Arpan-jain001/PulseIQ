// src/organizer/pages/OrgSettings.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Save, CheckCircle2, Clock, XCircle } from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import { useAuth } from "../../hooks/useAuth";

const VER_STATUS = {
  VERIFIED: { color: "#10d990", icon: CheckCircle2, label: "Verified Organization" },
  PENDING:  { color: "#f59e0b", icon: Clock,        label: "Verification Pending" },
  REJECTED: { color: "#f43f8e", icon: XCircle,      label: "Verification Rejected" },
};

const OrgSettings = () => {
  const { getProfile, updateProfile, loading } = useOrgApi();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ name: "", companyName: "" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        const u = res?.data || res;
        setProfile(u);
        setForm({ name: u.name || "", companyName: u.companyName || "" });
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("error", "Name required."); return; }
    setSaving(true);
    try {
      await updateProfile(form);
      showToast("success", "Profile updated!");
      setProfile(p => ({ ...p, ...form }));
    } catch (e) { showToast("error", e.message || "Update failed."); }
    finally { setSaving(false); }
  };

  const verCfg = VER_STATUS[profile?.verificationStatus] || VER_STATUS.PENDING;
  const VerIcon = verCfg.icon;

  return (
    <OrgLayout>
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: "var(--font-mono)", background: toast.type === "success" ? "#10d99015" : "#f43f8e15", borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30", color: toast.type === "success" ? "#10d990" : "#f43f8e" }}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Organizer / Settings</p>
          <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Verification Status card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-[#060d18] overflow-hidden"
            style={{ borderColor: `${verCfg.color}22`, boxShadow: "0 4px 24px #00000055" }}>
            <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg,${verCfg.color},transparent)` }} />
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${verCfg.color}15`, border: `1px solid ${verCfg.color}30` }}>
                <VerIcon className="w-6 h-6" style={{ color: verCfg.color }} />
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: verCfg.color }}>{verCfg.label}</p>
                <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  {profile?.verificationStatus === "VERIFIED"
                    ? "Full access to all platform features."
                    : profile?.verificationStatus === "REJECTED"
                    ? "Contact admin to re-apply for verification."
                    : "Admin will review your organization. Full features unlock after verification."
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a4a]">
              <div className="w-8 h-8 rounded-xl bg-[#10d99015] border border-[#10d99030] flex items-center justify-center">
                <User className="w-4 h-4 text-[#10d990]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#e8f4ff] uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>Profile</p>
                <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>Update your organization info</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-[#020408]"
                  style={{ background: "linear-gradient(135deg,#10d990,#00e5ff)", fontFamily: "var(--font-display)", boxShadow: "0 0 20px #10d99044" }}>
                  {profile?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#e8f4ff]">{profile?.name}</p>
                  <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{profile?.email}</p>
                  <p className="text-[10px] text-[#10d990] mt-0.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Organizer</p>
                </div>
              </div>

              {[
                { name: "name",        label: "Full Name",     placeholder: "Your name" },
                { name: "companyName", label: "Company Name",  placeholder: "Organization name" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>{label}</label>
                  <input
                    className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#10d99044] text-sm"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
                </div>
              ))}

              {/* Email (readonly) */}
              <div>
                <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Email</label>
                <input
                  className="w-full bg-[#04080f] border border-[#1a2a4a]/50 rounded-xl px-4 py-3 text-[#3d6080] text-sm cursor-not-allowed"
                  style={{ fontFamily: "var(--font-mono)" }}
                  value={profile?.email || ""}
                  readOnly />
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={saving || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
                style={{ background: "#10d990", fontFamily: "var(--font-mono)" }}>
                <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border border-[#1a2a4a] bg-[#060d18]">
            <p className="text-[11px] text-[#3d6080] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
              Platform version: v2.0.0 · Backend: {import.meta.env.VITE_BACKEND_API_URL || "—"}
            </p>
          </motion.div>
        </div>
      </div>
    </OrgLayout>
  );
};

export default OrgSettings;