import { motion, useMotionValue, useTransform } from "framer-motion";
import { Shield, BarChart3, Brain, MessageSquare, Settings, GraduationCap } from "lucide-react";
import { useRef } from "react";

const FEATURES = [
  {
    icon: Shield,
    title: "Authentication and Access",
    desc: "Secure authentication with JWT, role-based access control, and multi-tenant data isolation for every organization.",
    color: "#10d990",
    glow: "#10d99022",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Monitor DAU, MAU, page activity, event trends, funnel performance, and retention metrics from one live dashboard.",
    color: "#00e5ff",
    glow: "#00e5ff22",
  },
  {
    icon: Brain,
    title: "AI Insights Engine",
    desc: "Turn raw event streams into recommendations, anomaly detection, and behavioral summaries that teams can act on immediately.",
    color: "#a855f7",
    glow: "#a855f722",
  },
  {
    icon: MessageSquare,
    title: "Analytics Chat Assistant",
    desc: "Ask natural-language questions about performance, drop-offs, and engagement without writing queries or opening spreadsheets.",
    color: "#f43f8e",
    glow: "#f43f8e22",
  },
  {
    icon: Settings,
    title: "Admin and Workspace Control",
    desc: "Manage projects, API keys, members, alerts, and health signals across the full lifecycle of each tracked product.",
    color: "#f59e0b",
    glow: "#f59e0b22",
  },
  {
    icon: GraduationCap,
    title: "Exam and Coaching Analytics",
    desc: "Analyze question difficulty, student exits, section-level friction, and time-per-question for academic platforms.",
    color: "#7c3aed",
    glow: "#7c3aed22",
  },
];

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [8, -8]);
  const rotateY = useTransform(x, [-60, 60], [-8, 8]);

  const handleMouse = (event) => {
    const rect = ref.current.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const resetMouse = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      whileHover={{ scale: 1.03 }}
      className="group relative rounded-2xl border border-[#0d2140] bg-[#060d18] p-6 overflow-hidden transition-shadow duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${feature.glow} 0%, transparent 70%)` }}
      />

      <div
        className="absolute top-0 left-[20%] right-[20%] h-px group-hover:left-0 group-hover:right-0 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }}
      />

      <motion.div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
        style={{
          transform: "translateZ(20px)",
          background: feature.glow,
          borderColor: `${feature.color}30`,
          border: `1px solid ${feature.color}30`,
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <feature.icon className="w-5 h-5" strokeWidth={1.5} style={{ color: feature.color }} />
        <div
          className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: feature.color }}
        />
      </motion.div>

      <h3
        className="text-sm font-bold text-[#e8f4ff] mb-2.5 uppercase tracking-wider group-hover:text-white transition-colors"
        style={{ fontFamily: "var(--font-display)", transform: "translateZ(10px)" }}
      >
        {feature.title}
      </h3>
      <p
        className="text-sm text-[#3d6080] leading-relaxed group-hover:text-[#8ab4d4] transition-colors duration-300"
        style={{ transform: "translateZ(5px)" }}
      >
        {feature.desc}
      </p>

      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-4 h-4 border-r border-b rounded-br-md" style={{ borderColor: feature.color }} />
      </div>
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-4 h-4 border-l border-t rounded-tl-md" style={{ borderColor: feature.color }} />
      </div>

      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none opacity-0 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.color}66, transparent)` }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
};

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
  </svg>
);

const Features = () => (
  <section id="features" className="py-28 px-6 relative overflow-hidden bg-[#020408]">
    <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7c3aed] opacity-[0.03] blur-[120px] pointer-events-none" />

    <div className="max-w-6xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7c3aed30] bg-[#7c3aed08] text-[#a855f7] text-[11px] font-semibold mb-6 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <SparkleIcon /> Platform Capabilities
        </div>

        <h2
          className="text-4xl md:text-5xl font-black text-[#e8f4ff] mb-5 leading-tight uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Everything Needed To
          <br />
          <span className="text-gradient-cyan">Understand User Behavior</span>
        </h2>

        <p className="text-[#3d6080] max-w-2xl mx-auto text-base leading-relaxed">
          PulseIQ combines tracking, analytics, reporting, AI interpretation, and team controls
          into one modern SaaS platform for websites and applications.
        </p>

        <div className="flex items-center gap-4 mt-8 justify-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#00e5ff44]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#00e5ff44]" />
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ perspective: "1000px" }}>
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  </section>
);

export default Features;
