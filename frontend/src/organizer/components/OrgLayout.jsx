// src/organizer/components/OrgLayout.jsx
import OrgNavbar from "./OrgNavbar";  // ✅ sahi
import { motion } from "framer-motion";
import { Zap, Activity } from "lucide-react";

const OrgFooter = () => (
  <footer className="border-t border-[#10d99015] bg-[#060d18] px-6 py-4 mt-auto">
    <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative w-5 h-5">
          <motion.div className="absolute inset-0" animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M18 2 L32 10 L32 26 L18 34 L4 26 L4 10 Z"
                stroke="#10d990" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-[#10d990]" fill="#10d990" />
          </div>
        </div>
        <span className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
          PulseIQ Organizer <span className="text-[#1a3a6b]">/ v2.0</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#10d990]" />
          <span className="text-[10px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Live</span>
        </div>
        <span className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
          © {new Date().getFullYear()} PulseIQ Analytics
        </span>
      </div>
    </div>
  </footer>
);

const OrgLayout = ({ children }) => (
  <div className="min-h-screen bg-[#020408] text-[#e8f4ff] flex flex-col">
    <OrgNavbar />
    <main className="flex-1 pt-16">{children}</main>
    <OrgFooter />
  </div>
);

export default OrgLayout;