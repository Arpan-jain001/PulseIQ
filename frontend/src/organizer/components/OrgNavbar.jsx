// src/organizer/components/OrgNavbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Building2, FolderKanban, BarChart3, Users, Bell, Settings, LogOut, Menu, X, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const NAV = [
  { icon: LayoutDashboard, label: "Overview",   path: "/organizer-dashboard" },
  { icon: Building2,       label: "Workspaces", path: "/organizer-dashboard/workspaces" },
  { icon: FolderKanban,    label: "Projects",   path: "/organizer-dashboard/projects" },
  { icon: BarChart3,       label: "Analytics",  path: "/organizer-dashboard/analytics" },
  { icon: Users,           label: "Members",    path: "/organizer-dashboard/members" },
  { icon: Bell,            label: "Inbox",      path: "/organizer-dashboard/notifications" },
  { icon: Settings,        label: "Settings",   path: "/organizer-dashboard/settings" },
];

// Logout Modal
const LogoutModal = ({ onConfirm, onCancel }) => (
  <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
      initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
      style={{ background: "linear-gradient(135deg,#0d1117 0%,#161b22 100%)", border: "1px solid #10d99022", boxShadow: "0 0 60px #10d99008, 0 20px 60px #00000099" }}>
      <div className="h-[2px] w-full bg-gradient-to-r from-[#10d990] via-[#00e5ff] to-transparent" />
      <div className="p-7 text-center">
        <motion.div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-[#10d99030] bg-[#10d99008]"
          initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}>
          <LogOut className="w-6 h-6 text-[#10d990]" />
        </motion.div>
        <p className="text-[10px] text-[#10d990] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
          Organizer / Session
        </p>
        <h3 className="text-lg font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Sign Out?</h3>
        <p className="text-xs text-[#3d6080] mb-7" style={{ fontFamily: "var(--font-mono)" }}>
          End your organizer session?
        </p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] hover:text-[#10d990] text-xs uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}>Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
            style={{ background: "#10d990", fontFamily: "var(--font-mono)" }}>Sign Out</motion.button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const OrgNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "O";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#10d99018] bg-[#060d18]/92 backdrop-blur-xl"
        style={{ boxShadow: "0 4px 30px #00000066" }}>
        {/* Top accent — green for organizer */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#10d990] via-[#00e5ff] to-[#a855f7]" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/organizer-dashboard" className="flex items-center gap-3 group select-none">
              <div className="relative w-9 h-9">
                <motion.div className="absolute inset-0" animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <svg viewBox="0 0 36 36" fill="none">
                    <path d="M18 2 L32 10 L32 26 L18 34 L4 26 L4 10 Z"
                      stroke="#10d990" strokeWidth="1.5" fill="none" opacity="0.6" />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#10d990]" fill="#10d990" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#10d990] blur-xl opacity-20 group-hover:opacity-35 transition-opacity" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-[0.2em] text-[#10d990] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Pulse</span>
                <span className="text-[10px] font-light tracking-[0.3em] text-[#8ab4d4] uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}>IQ / Org</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV.map(({ icon: Icon, label, path }) => {
                const active = path === "/organizer-dashboard"
                  ? location.pathname === path
                  : location.pathname.startsWith(path);
                return (
                  <Link key={path} to={path}>
                    <motion.div whileHover={{ scale: 1.03 }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all ${
                        active
                          ? "bg-[#10d99015] border border-[#10d99030] text-[#10d990]"
                          : "text-[#3d6080] hover:text-[#8ab4d4] hover:bg-[#ffffff08]"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Verification status badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: user?.verificationStatus === "VERIFIED" ? "#10d99030" : "#f59e0b30",
                  background: user?.verificationStatus === "VERIFIED" ? "#10d99008" : "#f59e0b08",
                }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: user?.verificationStatus === "VERIFIED" ? "#10d990" : "#f59e0b" }} />
                <span className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: user?.verificationStatus === "VERIFIED" ? "#10d990" : "#f59e0b", fontFamily: "var(--font-mono)" }}>
                  {user?.verificationStatus === "VERIFIED" ? "Verified Org" : "Pending Verify"}
                </span>
              </div>

              {/* Avatar */}
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowLogout(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#1a2a4a] bg-[#04080f] hover:border-[#10d99033] transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-[#020408]"
                  style={{ background: "linear-gradient(135deg,#10d990,#00e5ff)", fontFamily: "var(--font-display)", boxShadow: "0 0 14px #10d99055" }}>
                  {initials}
                </div>
                <span className="hidden sm:block text-[10px] text-[#8ab4d4] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}>{user?.name?.split(" ")[0]}</span>
                <LogOut className="w-3 h-3 text-[#3d6080]" />
              </motion.button>

              {/* Mobile */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#10d990] p-2">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-40 rounded-2xl border border-[#10d99018] bg-[#060d18] p-3 lg:hidden"
            style={{ boxShadow: "0 20px 60px #00000099" }}>
            {NAV.map(({ icon: Icon, label, path }) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold mb-0.5 transition-all ${
                  location.pathname === path ? "bg-[#10d99015] text-[#10d990]" : "text-[#3d6080] hover:text-[#8ab4d4]"
                }`} style={{ fontFamily: "var(--font-mono)" }}>
                  <Icon className="w-4 h-4" />{label}
                </div>
              </Link>
            ))}
            <div className="border-t border-[#1a2a4a] mt-2 pt-2">
              <button onClick={() => { setMobileOpen(false); setShowLogout(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] text-[#10d990] uppercase tracking-wider font-bold"
                style={{ fontFamily: "var(--font-mono)" }}>
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogout && (
          <LogoutModal
            onConfirm={() => { setShowLogout(false); logout(); }}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default OrgNavbar;