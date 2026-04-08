import { motion, useInView } from "framer-motion";
import { Building2, Code2, BarChart3, Cpu, Zap, Lightbulb } from "lucide-react";
import { useRef } from "react";

const STEPS = [
  {
    icon: Building2,
    num: "01",
    title: "Create a Workspace",
    desc: "Register your organization and launch a secure multi-tenant environment with role-based access control.",
    color: "#00e5ff",
  },
  {
    icon: Code2,
    num: "02",
    title: "Generate an API Key",
    desc: "Provision a unique project key to identify traffic, isolate data, and secure every tracking request.",
    color: "#a855f7",
  },
  {
    icon: Zap,
    num: "03",
    title: "Install the Tracking Script",
    desc: "Add a lightweight script to your website or app to capture page views, clicks, forms, and custom events.",
    color: "#10d990",
  },
  {
    icon: BarChart3,
    num: "04",
    title: "Visualize Live Analytics",
    desc: "Watch dashboards populate with traffic trends, conversion funnels, retention metrics, and user activity.",
    color: "#f43f8e",
  },
  {
    icon: Cpu,
    num: "05",
    title: "Run AI Interpretation",
    desc: "Use the AI engine to detect anomalies, score project health, and generate practical recommendations.",
    color: "#f59e0b",
  },
  {
    icon: Lightbulb,
    num: "06",
    title: "Take Action Faster",
    desc: "Share reports, respond to alerts, and optimize the product experience with clear evidence behind every decision.",
    color: "#7c3aed",
  },
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
      className="relative flex gap-5 group"
    >
      {!isLast && (
        <div
          className="absolute left-[22px] top-[52px] bottom-[-24px] w-px"
          style={{ background: `linear-gradient(to bottom, ${step.color}60, transparent)` }}
        />
      )}

      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-11 h-11 rounded-xl border flex items-center justify-center relative overflow-hidden"
          style={{ borderColor: `${step.color}40`, background: `${step.color}10` }}
        >
          <step.icon className="w-5 h-5 relative z-10" style={{ color: step.color }} />
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ background: step.color }}
            initial={{ scale: 0, opacity: 0.4 }}
            whileHover={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }}
        />
      </div>

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
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff22] to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed22] to-transparent" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e5ff25] bg-[#00e5ff08] text-[#00e5ff] text-[11px] font-semibold mb-6 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Product Workflow
            </div>

            <h2
              className="text-4xl md:text-5xl font-black text-[#e8f4ff] mb-5 uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From Setup To
              <br />
              <span className="text-gradient-cyan">Actionable Insights</span>
              <br />
              In Minutes
            </h2>

            <p className="text-[#3d6080] leading-relaxed mb-8">
              PulseIQ is designed for fast onboarding. Teams can install tracking, capture events,
              review dashboards, and start acting on AI recommendations without a complex analytics stack.
            </p>

            <div className="rounded-xl border border-[#0d2140] bg-[#020408] p-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-[#0d2140]">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                <span className="w-2 h-2 rounded-full bg-green-500/70" />
                <span className="ml-2 text-[#3d6080]">setup.sh</span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[#10d990]">$</span>{" "}
                  <span className="text-[#8ab4d4]">pulseiq init --project storefront</span>
                </div>
                <div>
                  <span className="text-[#3d6080]"># Creating workspace and project keys...</span>
                </div>
                <div>
                  <span className="text-[#10d990]">OK</span>{" "}
                  <span className="text-[#e8f4ff]">Project key: piq_live_xK9m...abc</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#a855f7]">&lt;script</span>{" "}
                  <span className="text-[#00e5ff]">src</span>
                  <span className="text-[#3d6080]">=</span>
                  <span className="text-[#10d990]">"cdn.pulseiq.ai/v2.js"</span>
                </div>
                <div className="pl-10">
                  <span className="text-[#00e5ff]">data-key</span>
                  <span className="text-[#3d6080]">=</span>
                  <span className="text-[#10d990]">"piq_live_xK9m"</span>
                  <span className="text-[#a855f7]">&gt;&lt;/script&gt;</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#10d990]">OK</span>{" "}
                  <span className="text-[#8ab4d4]">Tracking active. Insights incoming.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pt-2">
          {STEPS.map((step, index) => (
            <StepCard key={step.num} step={step} index={index} isLast={index === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
