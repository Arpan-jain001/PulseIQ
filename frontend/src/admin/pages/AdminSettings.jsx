// src/admin/pages/AdminSettings.jsx
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Database, Globe } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../hooks/useAuth";

const SettingCard = ({ icon: Icon, title, desc, color, children }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a4a]">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-bold text-[#e8f4ff] uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
        <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{desc}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

const AdminSettings = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Settings</p>
          <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Profile */}
          <SettingCard icon={Shield} title="Admin Profile" desc="Your admin account details" color="#f43f8e">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f43f8e] to-[#7c3aed] flex items-center justify-center text-base font-black text-white"
                style={{ fontFamily: "var(--font-display)", boxShadow: "0 0 20px #f43f8e44" }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#e8f4ff]">{user?.name}</p>
                <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{user?.email}</p>
                <p className="text-[10px] text-[#f43f8e] mt-0.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Super Admin</p>
              </div>
            </div>
          </SettingCard>

          {/* Platform */}
          <SettingCard icon={Globe} title="Platform Info" desc="Current deployment details" color="#00e5ff">
            <div className="space-y-3">
              {[
                { label: "Version",       value: "v2.0.0" },
                { label: "Environment",   value: import.meta.env.MODE || "development" },
                { label: "Backend URL",   value: import.meta.env.VITE_BACKEND_API_URL || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1a2a4a] last:border-0">
                  <span className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
                  <span className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>
          </SettingCard>

          {/* Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border border-[#f59e0b30] bg-[#f59e0b08] flex items-start gap-3">
            <Settings className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
              Advanced platform settings like email configuration, rate limits, and API keys
              should be managed through the backend environment variables and server configuration.
            </p>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;