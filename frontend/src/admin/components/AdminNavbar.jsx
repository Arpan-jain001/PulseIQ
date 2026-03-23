// src/admin/components/AdminNavbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, ShieldCheck,
  Bell, Settings, LogOut, Menu, X, Zap, UserPlus, FolderKanban, HelpCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview",      path: "/admin-dashboard" },
  { icon: Users,           label: "Users",         path: "/admin-dashboard/users" },
  { icon: Building2,       label: "Organizations", path: "/admin-dashboard/organizations" },
  { icon: ShieldCheck,     label: "Verifications", path: "/admin-dashboard/verifications" },
  { icon: Building2,       label: "Workspaces",    path: "/admin-dashboard/workspaces" },
  { icon: FolderKanban,    label: "Projects",      path: "/admin-dashboard/projects" },
  { icon: UserPlus,        label: "Admins",        path: "/admin-dashboard/admins" },
  { icon: Bell,            label: "Notifications", path: "/admin-dashboard/notifications" },
  { icon: Settings,        label: "Settings",      path: "/admin-dashboard/settings" },
  { icon: HelpCircle,      label: "Help",           path: "/help" },
];

const AdminLogo = () => (
  <Link to="/admin-dashboard" className="flex items-center gap-3 group select-none">
    <div className="relative w-9 h-9">
      <motion.div className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M18 2 L32 10 L32 26 L18 34 L4 26 L4 10 Z"
            stroke="#f43f8e" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-4 h-4 text-[#f43f8e]" fill="#f43f8e" />
      </div>
      <div className="absolute inset-0 rounded-full bg-[#f43f8e] blur-xl opacity-20 group-hover:opacity-35 transition-opacity" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-sm font-black tracking-[0.2em] text-[#f43f8e] uppercase"
        style={{ fontFamily: "var(--font-display)" }}>Pulse</span>
      <span className="text-[10px] font-light tracking-[0.3em] text-[#8ab4d4] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}>IQ / Admin</span>
    </div>
  </Link>
);

const LogoutModal = ({ onConfirm, onCancel }) => (
  <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      className="relative w-full max-w-sm rounded-2xl border border-[#f43f8e20] bg-[#0a0f1a] p-7 text-center overflow-hidden"
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ boxShadow: "0 0 60px #f43f8e0d, 0 20px 60px #00000099" }}
    >
      {["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
          <div className={`absolute ${i<2?"top-0":"bottom-0"} ${i%2===0?"left-0":"right-0"} w-full h-px bg-[#f43f8e44]`} />
          <div className={`absolute ${i<2?"top-0":"bottom-0"} ${i%2===0?"left-0":"right-0"} w-px h-full bg-[#f43f8e44]`} />
        </div>
      ))}
      <motion.div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-[#f43f8e30] bg-[#f43f8e0a]"
        initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}>
        <LogOut className="w-6 h-6 text-[#f43f8e]" />
      </motion.div>
      <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
        Admin / Session
      </p>
      <h3 className="text-lg font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Logout?</h3>
      <p className="text-xs text-[#3d6080] mb-7" style={{ fontFamily: "var(--font-mono)" }}>
        End your admin session? All unsaved changes will be lost.
      </p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] hover:text-[#f43f8e] text-xs uppercase tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}>Cancel</motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}>Yes, Logout</motion.button>
      </div>
    </motion.div>
  </motion.div>
);

const AdminNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "A";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a2a4a] bg-[#060d18]/90 backdrop-blur-xl"
        style={{ boxShadow: "0 4px 30px #00000066" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-[#00e5ff]" />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <AdminLogo />

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                const active = path === "/admin-dashboard"
                  ? location.pathname === path
                  : location.pathname.startsWith(path);
                return (
                  <Link key={path} to={path}>
                    <motion.div whileHover={{ scale: 1.03 }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all ${
                        active
                          ? "bg-[#f43f8e15] border border-[#f43f8e30] text-[#f43f8e]"
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
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#f43f8e30] bg-[#f43f8e08]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f43f8e] animate-pulse" />
                <span className="text-[10px] text-[#f43f8e] uppercase tracking-widest font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}>Super Admin</span>
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowLogout(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#1a2a4a] bg-[#04080f] hover:border-[#f43f8e33] transition-all">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f43f8e] to-[#7c3aed] flex items-center justify-center text-[10px] font-black text-white"
                  style={{ fontFamily: "var(--font-display)", boxShadow: "0 0 14px #f43f8e55" }}>
                  {initials}
                </div>
                <span className="hidden sm:block text-[10px] text-[#8ab4d4] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}>{user?.name?.split(" ")[0]}</span>
                <LogOut className="w-3 h-3 text-[#3d6080]" />
              </motion.button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#f43f8e] p-2">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-40 rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-3 lg:hidden"
            style={{ boxShadow: "0 20px 60px #00000099" }}>
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold mb-0.5 transition-all ${
                  location.pathname === path ? "bg-[#f43f8e15] text-[#f43f8e]" : "text-[#3d6080] hover:text-[#8ab4d4]"
                }`} style={{ fontFamily: "var(--font-mono)" }}>
                  <Icon className="w-4 h-4" />{label}
                </div>
              </Link>
            ))}
            <div className="border-t border-[#1a2a4a] mt-2 pt-2">
              <button onClick={() => { setMobileOpen(false); setShowLogout(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] text-[#f43f8e] uppercase tracking-wider font-bold"
                style={{ fontFamily: "var(--font-mono)" }}>
                <LogOut className="w-4 h-4" />Logout
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

export default AdminNavbar;