import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, Zap, LogOut, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

const NAV_LINKS = ["Features", "How It Works", "Use Cases", "Team"];

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group select-none">
    <div className="relative w-9 h-9">
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 36 36" fill="none">
          <path
            d="M18 2 L32 10 L32 26 L18 34 L4 26 L4 10 Z"
            stroke="#00e5ff"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-4 h-4 text-[#00e5ff]" fill="#00e5ff" />
      </div>
      <div className="absolute inset-0 rounded-full bg-[#00e5ff] blur-xl opacity-15 group-hover:opacity-30 transition-opacity" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-sm font-black tracking-[0.2em] text-[#00e5ff] uppercase"
        style={{ fontFamily: "var(--font-display)" }}>
        Pulse
      </span>
      <span className="text-[10px] font-light tracking-[0.4em] text-[#8ab4d4] uppercase"
        style={{ fontFamily: "var(--font-mono)" }}>
        IQ / v2.0
      </span>
    </div>
  </Link>
);

/* ── Logout Confirmation Modal ──────────────────────── */
const LogoutModal = ({ onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* Modal card */}
      <motion.div
        className="relative w-full max-w-sm rounded-2xl border border-[#00e5ff20] bg-[#060d18] p-7 text-center overflow-hidden"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ boxShadow: "0 0 60px #00e5ff0d, 0 20px 60px #00000099" }}
      >
        {/* Corner brackets */}
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
            <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-full h-px bg-[#00e5ff44]`} />
            <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-px h-full bg-[#00e5ff44]`} />
          </div>
        ))}

        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-[#f43f8e30] bg-[#f43f8e0a]"
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <LogOut className="w-6 h-6 text-[#f43f8e]" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.2em] mb-2"
            style={{ fontFamily: "var(--font-mono)" }}>
            PulseIQ / Session
          </p>
          <h3 className="text-lg font-black text-[#e8f4ff] mb-2 uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}>
            Logout?
          </h3>
          <p className="text-xs text-[#3d6080] leading-relaxed mb-7"
            style={{ fontFamily: "var(--font-mono)" }}>
            Are you sure you want to end your session? Your data will remain safe.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#0d2140] text-[#8ab4d4] hover:border-[#00e5ff33] hover:text-[#00e5ff] text-xs uppercase tracking-widest transition-colors duration-200"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px #f43f8e44" }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Yes, Logout
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ── User Avatar Menu ───────────────────────────────── */
const UserMenu = ({ user, onLogoutClick }) => {
  const [open, setOpen] = useState(false);

  // Get initials from name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleColor = {
    SUPER_ADMIN: "#f43f8e",
    ORGANIZER:   "#a855f7",
    USER:        "#00e5ff",
  }[user?.role] || "#00e5ff";

  const dashboardPath = {
    SUPER_ADMIN: "/admin-dashboard",
    ORGANIZER:   "/organizer-dashboard",
    USER:        "/dashboard",
  }[user?.role] || "/dashboard";

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#0d2140] bg-[#04080f]/80 hover:border-[#00e5ff33] transition-all duration-200"
      >
        {/* Avatar circle */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-[#020408] flex-shrink-0"
          style={{ background: roleColor, boxShadow: `0 0 12px ${roleColor}55`, fontFamily: "var(--font-display)" }}
        >
          {initials}
        </div>

        {/* Name — hidden on small screens */}
        <span className="hidden sm:block text-[10px] text-[#8ab4d4] uppercase tracking-wider max-w-[80px] truncate"
          style={{ fontFamily: "var(--font-mono)" }}>
          {user?.name?.split(" ")[0]}
        </span>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 text-[#3d6080]" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-xl border border-[#0d2140] bg-[#060d18] overflow-hidden shadow-[0_20px_60px_#00000099]"
            onMouseLeave={() => setOpen(false)}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-[#0d2140]">
              <p className="text-[11px] font-bold text-[#e8f4ff] truncate"
                style={{ fontFamily: "var(--font-mono)" }}>
                {user?.name}
              </p>
              <p className="text-[9px] uppercase tracking-widest mt-0.5"
                style={{ color: roleColor, fontFamily: "var(--font-mono)" }}>
                {user?.role?.replace("_", " ")}
              </p>
            </div>

            {/* Dashboard link */}
            <Link
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] text-[#8ab4d4] hover:text-[#00e5ff] hover:bg-[#00e5ff08] transition-all uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <User className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); onLogoutClick(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] text-[#f43f8e] hover:bg-[#f43f8e08] transition-all uppercase tracking-wider border-t border-[#0d2140]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Navbar ─────────────────────────────────────────── */
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 30));

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 px-5 md:px-10 glass-dark border-b border-[#00e5ff15] shadow-[0_0_40px_#00000080]"
            : "py-5 px-6 md:px-10 bg-transparent"
        }`}
      >
        {scrolled && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff44] to-transparent" />
        )}

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1 bg-[#04080f]/80 backdrop-blur-sm rounded-full px-2 py-1.5 border border-[#0d2140]">
            {NAV_LINKS.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative px-4 py-2 text-xs font-medium text-[#8ab4d4] hover:text-[#00e5ff] transition-colors duration-200 rounded-full group"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="relative z-10 uppercase">{item}</span>
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#00e5ff08] border border-[#00e5ff20]"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Right side — user logged in OR login/signup */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <UserMenu user={user} onLogoutClick={() => setShowLogoutModal(true)} />
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 text-xs font-medium text-[#8ab4d4] hover:text-[#00e5ff] transition-colors uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Log in
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 24px #00e5ff44" }}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-6 py-2.5 text-xs font-bold text-[#020408] bg-[#00e5ff] rounded-full uppercase tracking-widest overflow-hidden group"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span className="relative z-10">Start Free →</span>
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#00e5ff] p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-4 right-4 z-40 glass-dark rounded-2xl border border-[#00e5ff20] p-4 shadow-[0_20px_60px_#00000080]"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-xs text-[#8ab4d4] hover:text-[#00e5ff] hover:bg-[#00e5ff08] rounded-xl transition-all uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item}
              </a>
            ))}

            <div className="mt-3 pt-3 border-t border-[#0d2140]">
              {user ? (
                <>
                  {/* Mobile user info */}
                  <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                      style={{ background: "#00e5ff", fontFamily: "var(--font-display)" }}
                    >
                      {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[11px] text-[#e8f4ff] font-bold" style={{ fontFamily: "var(--font-mono)" }}>{user.name}</p>
                      <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>{user.role?.replace("_", " ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); setShowLogoutModal(true); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#f43f8e] hover:bg-[#f43f8e08] rounded-xl transition-all uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs text-[#8ab4d4] rounded-xl border border-[#0d2140] hover:border-[#00e5ff33] transition-all uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono)" }}>
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold text-[#020408] bg-[#00e5ff] rounded-xl uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono)" }}>
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;