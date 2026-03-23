import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2, GraduationCap, ShoppingCart, Briefcase,
  Users, Globe, Terminal, Sparkles, Linkedin, Mail,
  ArrowRight, Loader2, Heart,
} from "lucide-react";

import { Zap } from "lucide-react";

/* ══════════════════════════════════════════════════════
   USE CASES
══════════════════════════════════════════════════════ */

const TARGETS = [
  { icon: GraduationCap, name: "Coaching Centers",   desc: "Student engagement, question difficulty, drop-off heatmaps", color: "#00e5ff" },
  { icon: Building2,     name: "EdTech Platforms",   desc: "Course completion, section analytics, LMS integration",       color: "#a855f7" },
  { icon: ShoppingCart,  name: "E-commerce",         desc: "Cart abandonment, checkout funnels, product engagement",      color: "#10d990" },
  { icon: Briefcase,     name: "SaaS Products",      desc: "Feature adoption, churn prediction, onboarding optimization", color: "#f43f8e" },
  { icon: Users,         name: "HR & Job Portals",   desc: "Application funnels, candidate behavior, drop analysis",      color: "#f59e0b" },
  { icon: Globe,         name: "Digital Businesses", desc: "Full-stack analytics for any web or mobile platform",         color: "#7c3aed" },
];

export const UseCases = () => (
  <section id="use-cases" className="py-28 px-6 relative overflow-hidden bg-[#020408]">
    <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f722] to-transparent" />

    <div className="max-w-6xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10d99025] bg-[#10d99008] text-[#10d990] text-[11px] font-semibold mb-6 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Industries
        </div>
        <h2
          className="text-4xl md:text-5xl font-black text-[#e8f4ff] mb-5 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Built For
          <br />
          <span className="text-gradient-cyan">Every Industry</span>
        </h2>
        <p className="text-[#3d6080] max-w-lg mx-auto">
          Plug PulseIQ into any platform. From EdTech to E-commerce, our engine adapts to your domain.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TARGETS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.07, duration: 0.6 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative rounded-2xl border border-[#0d2140] bg-[#060d18] overflow-hidden "
            style={{ boxShadow: "0 4px 24px #00000055" }}
          >
            <div
              className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }}
            />
            <div className="p-6 flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
              >
                <t.icon className="w-5 h-5" strokeWidth={1.5} style={{ color: t.color }} />
              </div>
              <div>
                <h3
                  className="text-sm font-bold text-[#e8f4ff] mb-1.5 uppercase tracking-wider group-hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.name}
                </h3>
                <p className="text-xs text-[#3d6080] leading-relaxed group-hover:text-[#8ab4d4] transition-colors duration-300">
                  {t.desc}
                </p>
              </div>
            </div>
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 50%, ${t.color}0d 0%, transparent 60%)` }}
            />
          </motion.div>
        ))}
      </div>

      {/* AI insight showcase */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-12 relative rounded-2xl border border-[#00e5ff18] bg-[#060d18] p-7 overflow-hidden"
        style={{ boxShadow: "0 0 60px #00e5ff08" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff06] via-transparent to-[#7c3aed06] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 border border-[#00e5ff10] rounded-full animate-spin-slow pointer-events-none" />
        <div className="absolute -top-8 -right-8 w-24 h-24 border border-[#7c3aed15] rounded-full animate-spin-r pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00e5ff12] border border-[#00e5ff25] flex items-center justify-center flex-shrink-0">
            <Terminal className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div>
            <p
              className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ai_insight → edtech_client → high_priority
            </p>
            <p className="text-sm text-[#8ab4d4] leading-relaxed">
              "Math section shows{" "}
              <span className="text-[#00e5ff] font-bold">28% higher drop-off</span>{" "}
              vs other sections. Question 8 difficulty spike detected —{" "}
              <span className="text-[#10d990] font-semibold">reattempt rate: 42%</span>.
              Recommended action: Add contextual hint or restructure question phrasing."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   TEAM SECTION
══════════════════════════════════════════════════════ */

const TEAM = [
  {
    name: "Arpan Jain",
    role: "Lead & Architect",
    color: "#00e5ff",
    gradient: "from-cyan-500 to-blue-600",
    linkedin: "https://linkedin.com/in/arpan-jain-42386b2a7",
    email: "arpanjain00123@gmail.com",
    isLead: true,
  },
  {
    name: "Aryan Gupta",
    role: "Core Engineer",
    color: "#a855f7",
    gradient: "from-violet-500 to-purple-600",
    linkedin: "https://linkedin.com/in/aryan-gupta-5731662b4/",
    email: "aryan2135gupta@gmail.com",
  },
  {
    name: "Girraj Singh",
    role: "Core Engineer",
    color: "#10d990",
    gradient: "from-emerald-500 to-teal-600",
    email: "girraj.singh_cs23@gla.ac.in",
  },
  {
    name: "Khushi Malhotra",
    role: "Core Engineer",
    color: "#f43f8e",
    gradient: "from-pink-500 to-rose-600",
    linkedin: "https://linkedin.com/in/khushi-malhotra-843b64310/",
  },
  {
    name: "Radhika Gupta",
    role: "Core Engineer",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    linkedin: "https://linkedin.com/in/radhika-gupta-45a954300/",
  },
];

export const TeamSection = () => (
  <section id="team" className="py-24 px-6 relative overflow-hidden bg-[#04080f]">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f722] to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff22] to-transparent" />

    <div className="max-w-6xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#a855f730] bg-[#a855f708] text-[#a855f7] text-[11px] font-semibold mb-6 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Team
        </div>
        <h2
          className="text-4xl md:text-5xl font-black text-[#e8f4ff] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The <span className="text-gradient-violet">Engineers</span>
        </h2>
        <p className="text-[#3d6080] mt-4 max-w-md mx-auto">
          GLA University, Mathura — building industry-grade systems from scratch.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6">
        {TEAM.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative w-full sm:w-[260px] rounded-2xl border border-[#0d2140] bg-[#060d18] overflow-hidden  group"
            style={{ boxShadow: "0 4px 30px #00000055" }}
          >
            {/* Top accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${member.gradient}`} />

            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 30%, ${member.color}10 0%, transparent 70%)` }}
            />

            <div className="px-5 pb-6 pt-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 mb-4 mx-auto">
                <div
                  className={`w-full h-full rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl font-black text-white group-hover:rotate-3 transition-transform duration-500`}
                  style={{
                    fontFamily: "var(--font-display)",
                    boxShadow: `0 0 24px ${member.color}33`,
                  }}
                >
                  {member.name.charAt(0)}
                </div>
                {member.isLead && (
                  <div className="absolute -top-2 -right-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-[#00e5ff] text-[#020408] uppercase tracking-wider">
                    Lead
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <h3
                  className="text-sm font-bold text-[#e8f4ff] group-hover:text-white transition-colors uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-[10px] mt-1 uppercase tracking-widest"
                  style={{ color: member.color, fontFamily: "var(--font-mono)" }}
                >
                  {member.role}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 border-t border-[#0d2140] pt-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-[#0d2140] text-[#3d6080] hover:border-[#00e5ff33] hover:text-[#00e5ff] hover:bg-[#00e5ff08] transition-all duration-300"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 rounded-lg border border-[#0d2140] text-[#3d6080] hover:border-[#00e5ff33] hover:text-[#00e5ff] hover:bg-[#00e5ff08] transition-all duration-300"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-10 text-[11px] text-[#3d6080] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Under the supervision of Mr. Shiv Kumar Verma · Dept. of Computer Engineering Application
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   CTA SECTION
══════════════════════════════════════════════════════ */

export const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.target);
    fd.append("access_key", "7204ba5c-6385-4e57-bdc7-d4bf451f23c7");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("done");
        e.target.reset();
        showToast("success", "✅ You're on the list!");
      } else {
        setStatus("");
        showToast("error", "❌ Failed. Try again.");
      }
    } catch {
      setStatus("");
      showToast("error", "❌ Network error.");
    }
  };

  return (
    <section className="py-28 px-6 relative overflow-hidden bg-[#020408]" ref={ref}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-8 right-6 z-[100] px-5 py-3 rounded-xl border text-sm font-bold backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-[#10d99015] border-[#10d99030] text-[#10d990]"
                : "bg-[#f43f8e15] border-[#f43f8e30] text-[#f43f8e]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00e5ff] opacity-[0.025] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <div
          className="relative rounded-3xl border border-[#00e5ff18] bg-[#060d18] p-8 md:p-14 text-center overflow-hidden"
          style={{ boxShadow: "0 0 80px #00e5ff08, 0 20px 80px #00000066" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff05] via-transparent to-[#7c3aed05] pointer-events-none rounded-3xl" />

          {/* Corner brackets */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-10 h-10 pointer-events-none`}>
              <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-full h-px bg-[#00e5ff44]`} />
              <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-px h-full bg-[#00e5ff44]`} />
            </div>
          ))}

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center animate-glow-pulse border border-[#00e5ff30]"
              style={{ background: "linear-gradient(135deg, #00e5ff22, #7c3aed22)" }}
            >
              <Sparkles className="w-7 h-7 text-[#00e5ff]" />
            </motion.div>

            <h2
              className="text-3xl md:text-5xl font-black text-[#e8f4ff] mb-4 uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              STOP GUESSING.
              <br />
              <span className="text-gradient-cyan">START KNOWING.</span>
            </h2>

            <p className="text-[#3d6080] mb-10 max-w-md mx-auto">
              Join teams already using PulseIQ to reduce drop-offs and increase conversions with
              AI-powered behavioral intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 32px #00e5ff55" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-[#00e5ff] text-[#020408] font-black rounded-xl  uppercase tracking-widest text-sm flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <button
                className="px-8 py-4 border border-[#0d2140] text-[#8ab4d4] hover:border-[#00e5ff33] hover:text-[#00e5ff] rounded-xl  uppercase tracking-widest text-sm transition-colors duration-300"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Book Demo
              </button>
            </div>

            {/* Waitlist form */}
            <div className="pt-10 border-t border-[#0d2140]">
              <p
                className="text-[10px] text-[#3d6080] uppercase tracking-[0.2em] mb-5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — Join Waitlist for Early Access —
              </p>

              <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["name", "email"].map((field) => (
                    <input
                      key={field}
                      type={field}
                      name={field}
                      placeholder={field === "name" ? "Your Name" : "Email Address"}
                      required
                      disabled={status === "loading" || status === "done"}
                      className="w-full px-4 py-3 rounded-xl border border-[#0d2140] bg-[#04080f] text-[#8ab4d4] placeholder:text-[#3d6080] outline-none focus:border-[#00e5ff33] focus:ring-1 focus:ring-[#00e5ff22] transition-all text-sm disabled:opacity-50"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  ))}
                </div>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  required
                  rows={3}
                  disabled={status === "loading" || status === "done"}
                  className="w-full px-4 py-3 rounded-xl border border-[#0d2140] bg-[#04080f] text-[#8ab4d4] placeholder:text-[#3d6080] outline-none focus:border-[#00e5ff33] focus:ring-1 focus:ring-[#00e5ff22] resize-none text-sm disabled:opacity-50 transition-all"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0 0 24px #00e5ff33" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={status === "loading" || status === "done"}
                  className="w-full py-3.5 rounded-xl font-bold text-[#020408] bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]  uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                  ) : status === "done" ? (
                    "🎉 You're on the list!"
                  ) : (
                    "Reserve Your Spot →"
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Features",      href: "#features" },
      { label: "How It Works",  href: "#how-it-works" },
      { label: "Use Cases",     href: "#use-cases" },
      { label: "Pricing — Soon" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Team",        href: "#team" },
      { label: "Help Center", to: "/help" },
      { label: "Blog — Soon" },
      { label: "Careers" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login",      to: "/login" },
      { label: "Sign Up",    to: "/signup" },
      { label: "Docs — Soon" },
    ],
  },
];

export const Footer = () => (
  <footer className="border-t border-[#0d2140] py-14 px-6 bg-[#04080f]">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-10 mb-10">

        {/* Brand — new animated hex logo */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-3 group select-none mb-4 w-fit">
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
              <span
                className="text-sm font-black tracking-[0.2em] text-[#00e5ff] uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pulse
              </span>
              <span
                className="text-[10px] font-light tracking-[0.4em] text-[#8ab4d4] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                IQ / v2.0
              </span>
            </div>
          </Link>

          <p
            className="text-xs text-[#3d6080] leading-relaxed max-w-[180px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            AI-powered analytics. Real-time intelligence. Actionable decisions.
          </p>
        </div>

        {/* Nav columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h4
              className="text-[10px] font-bold text-[#8ab4d4] mb-4 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {col.title}
            </h4>
            <div className="flex flex-col gap-2.5">
              {col.links.map((l) =>
                l.href ? (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-xs text-[#3d6080] hover:text-[#00e5ff] transition-colors uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {l.label}
                  </a>
                ) : l.to ? (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="text-xs text-[#3d6080] hover:text-[#00e5ff] transition-colors uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <span
                    key={l.label}
                    className="text-xs text-[#1a3a6b] uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {l.label}
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0d2140] pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p
          className="text-[11px] text-[#3d6080] flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Built with{" "}
          <Heart className="w-3 h-3 text-[#f43f8e] fill-[#f43f8e]" />{" "}
          by Arpan Jain &amp; Team · GLA University, Mathura
        </p>
        <p
          className="text-[10px] text-[#1a3a6b]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          © {new Date().getFullYear()} PulseIQ Analytics. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
