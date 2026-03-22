// src/user/pages/UserSettings.jsx
import { motion } from "framer-motion";
import { Settings, Shield, Globe, Info } from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useAuth } from "../../hooks/useAuth";

const UserSettings = () => {
  const { user } = useAuth();

  return (
    <UserLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>User / Settings</p>
          <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
            style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Account info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a4a]">
              <div className="w-8 h-8 rounded-xl bg-[#00e5ff15] border border-[#00e5ff30] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#00e5ff]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#e8f4ff] uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-display)" }}>Account Info</p>
                <p className="text-[10px] text-[#3d6080]"
                  style={{ fontFamily: "var(--font-mono)" }}>Your account details</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Name",   value: user?.name  },
                { label: "Email",  value: user?.email },
                { label: "Role",   value: "USER"      },
                { label: "Status", value: user?.status || "ACTIVE" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1a2a4a] last:border-0">
                  <span className="text-[11px] text-[#3d6080] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
                  <span className="text-[11px] text-[#8ab4d4] font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Platform info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a4a]">
              <div className="w-8 h-8 rounded-xl bg-[#a855f715] border border-[#a855f730] flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#a855f7]" />
              </div>
              <p className="text-xs font-black text-[#e8f4ff] uppercase tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}>Platform</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Version",     value: "v2.0.0" },
                { label: "Environment", value: import.meta.env.MODE || "production" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1a2a4a] last:border-0">
                  <span className="text-[11px] text-[#3d6080] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
                  <span className="text-[11px] text-[#8ab4d4]"
                    style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Note */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-[#1a2a4a] bg-[#060d18]">
            <Info className="w-4 h-4 text-[#3d6080] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#3d6080] leading-relaxed"
              style={{ fontFamily: "var(--font-mono)" }}>
              To change your email or password, please contact support or use the forgot password flow.
            </p>
          </motion.div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserSettings;