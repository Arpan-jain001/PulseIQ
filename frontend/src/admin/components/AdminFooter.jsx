import { motion } from "framer-motion";
import { Activity, Shield, Zap } from "lucide-react";

const AdminFooter = () => (
  <footer className="mt-auto border-t border-[#1a2a4a] bg-[#060d18] px-6 py-4">
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="relative h-5 w-5">
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M18 2 L32 10 L32 26 L18 34 L4 26 L4 10 Z" stroke="#f43f8e" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-2.5 w-2.5 text-[#f43f8e]" fill="#f43f8e" />
          </div>
        </div>
        <span className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
          PulseIQ Admin Panel <span className="text-[#1a3a6b]">/ v2.0</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-[#10d990]" />
          <span className="text-[10px] uppercase tracking-wider text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
            Secure Session
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-[#00e5ff]" />
          <span className="text-[10px] uppercase tracking-wider text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
            Live
          </span>
        </div>
        <span className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
          Copyright {new Date().getFullYear()} PulseIQ Analytics
        </span>
      </div>
    </div>
  </footer>
);

export default AdminFooter;
