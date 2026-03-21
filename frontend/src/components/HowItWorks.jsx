import { motion, useInView } from "framer-motion";
import { Building2, Code2, BarChart3, Cpu, Zap, Lightbulb } from "lucide-react";
import { useRef } from "react";

const STEPS = [
  { icon: Building2, num: "01", title: "Create Workspace",   desc: "Register your org. Isolated multi-tenant environment with role-based access control.", color: "#00e5ff" },
  { icon: Code2,     num: "02", title: "Generate API Key",   desc: "One-click secure key generation. Unique hash per project for data isolation.",          color: "#a855f7" },
  { icon: Zap,       num: "03", title: "Inject Script",      desc: "Single <script> tag. Captures clicks, scrolls, forms, and custom events instantly.",   color: "#10d990" },
  { icon: BarChart3, num: "04", title: "Live Dashboard",     desc: "Watch funnels, retention curves, and DAU/MAU populate in real time.",                   color: "#f43f8e" },
  { icon: Cpu,       num: "05", title: "AI Processing",      desc: "Gemini-powered engine detects anomalies, patterns, and behavioral shifts automatically.",color: "#f59e0b" },
  { icon: Lightbulb, num: "06", title: "Act on Insights",    desc: "Get prioritized, actionable recommendations with impact scores and implementation steps.", color: "#7c3aed" },
];

const StepCard = ({ step, index, isLast }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-5 group "
    >
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[22px] top-[52px] bottom-[-24px] w-px"
          style={{ background: `linear-gradient(to bottom, ${step.color}60, transparent)` }}
        />
      )}

      {/* Step number + icon */}
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-11 h-11 rounded-xl border flex items-center justify-center relative overflow-hidden"
          style={{ borderColor: `${step.color}40`, background: `${step.color}10` }}
        >
          <step.icon className="w-5 h-5 relative z-10" style={{ color: step.color }} />
          {/* Pulse on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ background: step.color }}
            initial={{ scale: 0, opacity: 0.4 }}
            whileHover={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
        {/* Glow dot */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }}
        />
      </div>

      {/* Content */}
      <div className="pb-10 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: step.color, fontFamily: "var(--font-mono)" }}
          >
            Step {step.num}
          </span>
          <div className="h-px flex-1 max-w-[40px]" style={{ background: `${step.color}44` }} />
        </div>

        <h3
          className="text-base font-bold text-[#e8f4ff] mb-1.5 uppercase tracking-wider group-hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {step.title}
        </h3>

        <p className="text-sm text-[#3d6080] leading-relaxed group-hover:text-[#8ab4d4] transition-colors duration-300">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
};

const HowItWorks = () => (
  <section id="how-it-works" className="py-28 px-6 relative overflow-hidden bg-[#04080f]">
    {/* Top + bottom borders */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff22] to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed22] to-transparent" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-start">

        {/* Left: Header sticky-ish */}
        <div className="lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e5ff25] bg-[#00e5ff08] text-[#00e5ff] text-[11px] font-semibold mb-6 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>
              Pipeline
            </div>

            <h2
              className="text-4xl md:text-5xl font-black text-[#e8f4ff] mb-5 uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Zero TO FULL<br />
              <span className="text-gradient-cyan">INTELLIGENCE</span><br />
              in minutes
            </h2>

            <p className="text-[#3d6080] leading-relaxed mb-8">
              From signup to AI-powered insights in under 10 minutes. No complex setup. No data scientists required.
            </p>

            {/* Terminal-style code block */}
            <div className="rounded-xl border border-[#0d2140] bg-[#020408] p-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-[#0d2140]">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                <span className="w-2 h-2 rounded-full bg-green-500/70" />
                <span className="ml-2 text-[#3d6080]">integration.sh</span>
              </div>
              <div className="space-y-1.5">
                <div><span className="text-[#10d990]">$</span> <span className="text-[#8ab4d4]">pulseiq init --project my-app</span></div>
                <div><span className="text-[#3d6080]"># Generating API key...</span></div>
                <div><span className="text-[#10d990]">✓</span> <span className="text-[#e8f4ff]">Key: piq_live_xK9m...abc</span></div>
                <div className="mt-2"><span className="text-[#a855f7]">&lt;script</span> <span className="text-[#00e5ff]">src</span><span className="text-[#3d6080]">=</span><span className="text-[#10d990]">"cdn.pulseiq.ai/v2.js"</span></div>
                <div className="pl-10"><span className="text-[#00e5ff]">data-key</span><span className="text-[#3d6080]">=</span><span className="text-[#10d990]">"piq_live_xK9m"</span><span className="text-[#a855f7]">&gt;&lt;/script&gt;</span></div>
                <div className="mt-2"><span className="text-[#10d990]">✓</span> <span className="text-[#8ab4d4]">Tracking active. Events flowing.</span></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Steps timeline */}
        <div className="pt-2">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;