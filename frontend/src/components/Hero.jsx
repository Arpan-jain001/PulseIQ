import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Activity, Terminal, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

const Counter = ({ to, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / (duration * 60));
    const id = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(id);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [to, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const ParticleGrid = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setSize();

    const cols = Math.floor(canvas.width / 60);
    const rows = Math.floor(canvas.height / 60);
    const dots = [];

    for (let x = 0; x < cols; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        dots.push({
          x: x * 60 + 30,
          y: y * 60 + 30,
          r: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.4 + 0.05,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
        });
      }
    }

    let frame;
    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((dot) => {
        const alpha = dot.alpha * (0.5 + 0.5 * Math.sin(time * 0.001 * dot.speed * 60 + dot.phase));
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", setSize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />;
};

const chartData = [
  { t: "W1", sessions: 320, conversions: 95 },
  { t: "W2", sessions: 510, conversions: 160 },
  { t: "W3", sessions: 740, conversions: 270 },
  { t: "W4", sessions: 620, conversions: 215 },
  { t: "W5", sessions: 890, conversions: 360 },
  { t: "W6", sessions: 1050, conversions: 430 },
];

const stats = [
  { label: "Active Users", value: 12847, suffix: "", positive: true, change: "+14.2%" },
  { label: "Conversion Rate", value: 68, suffix: "%", positive: true, change: "+3.1%" },
  { label: "Sessions", value: 4320, suffix: "", positive: true, change: "+8.7%" },
  { label: "Drop-off Risk", value: 12, suffix: "%", positive: false, change: "-2.4%" },
];

const DashboardMockup = () => (
  <div
    className="rounded-2xl overflow-hidden border border-[#0d2140] bg-[#020408]"
    style={{ boxShadow: "0 0 60px #00e5ff0d, 0 20px 60px #00000099" }}
  >
    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[#0d2140] bg-[#04080f]">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/80" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-[9px] sm:text-[10px] text-[#3d6080] hidden xs:block" style={{ fontFamily: "var(--font-mono)" }}>
          dashboard.pulseiq.ai - live
        </span>
      </div>
      <span
        className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-md bg-[#10d99020] border border-[#10d99030] text-[#10d990]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        LIVE
      </span>
    </div>

    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="p-2.5 sm:p-3 rounded-xl border border-[#0d2140] bg-[#060d18] hover:border-[#00e5ff30] transition-colors duration-300"
          >
            <p className="text-[8px] sm:text-[9px] text-[#3d6080] mb-1 uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
              {stat.label}
            </p>
            <p className="text-sm sm:text-lg font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-mono)" }}>
              <Counter to={stat.value} suffix={stat.suffix} duration={1.5} />
            </p>
            <span className={`text-[9px] sm:text-[10px] font-bold ${stat.positive ? "text-[#10d990]" : "text-red-400"}`}>
              {stat.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-[#0d2140] bg-[#04080f]/60 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold text-[#8ab4d4] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
            User Activity
          </span>
          <div className="flex gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00e5ff]" />
              <span className="hidden sm:inline">Sessions</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10d990]" />
              <span className="hidden sm:inline">Conversions</span>
            </span>
          </div>
        </div>
        <div className="h-24 sm:h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gc1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gc2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10d990" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10d990" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#060d18",
                  border: "1px solid #0d2140",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "#8ab4d4",
                }}
              />
              <Area type="monotone" dataKey="sessions" stroke="#00e5ff" fill="url(#gc1)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="conversions" stroke="#10d990" fill="url(#gc2)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#00e5ff06] border border-[#00e5ff15]"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#00e5ff12] border border-[#00e5ff25] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00e5ff]" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] sm:text-[9px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            AI_INSIGHT - HIGH_PRIORITY
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#8ab4d4] leading-relaxed">
            Mobile checkout is showing <span className="text-[#00e5ff] font-semibold">23% higher drop-off</span>.
            Recommended action: shorten the third step and reduce required form fields.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-20 sm:pt-24 pb-16 px-4 sm:px-6 overflow-hidden bg-[#020408]">
      <ParticleGrid />
      <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />

      <div className="absolute top-24 left-0 w-px h-48 bg-gradient-to-b from-transparent via-[#00e5ff33] to-transparent" />
      <div className="absolute top-24 right-0 w-px h-48 bg-gradient-to-b from-transparent via-[#7c3aed33] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff22] to-transparent" />

      <div className="absolute top-32 right-[10%] w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-[#00e5ff] opacity-[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-[5%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-[#7c3aed] opacity-[0.06] blur-[80px] pointer-events-none" />

      <div className="absolute top-20 right-[8%] pointer-events-none hidden xl:block">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-64 h-64 rounded-full border border-[#00e5ff12]"
          style={{ boxShadow: "inset 0 0 30px #00e5ff08" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border border-[#7c3aed15]"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-14 rounded-full border border-[#00e5ff18]"
        />
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#00e5ff] blur-sm" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] gap-10 lg:gap-14 xl:gap-16 items-center"
        >
          <div>
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00e5ff25] bg-[#00e5ff08] mb-6 sm:mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#00e5ff] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                AI Analytics SaaS - Industry Ready
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[5.35rem] xl:text-[6rem] font-black leading-[1.02] mb-5 sm:mb-6 tracking-[0.015em] sm:tracking-[0.03em] animate-glitch"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-[#e8f4ff]">TRACK</span>
              <span className="block text-gradient-cyan text-[0.82em] sm:text-[0.92em] lg:text-[0.8em]">
                UNDERSTAND
              </span>
              <span className="block text-[#e8f4ff]">
                OPTI<span className="text-gradient-violet">MIZE</span>
              </span>
            </motion.h1>

            <motion.div variants={item} className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
              <div className="h-px w-8 sm:w-[60px] bg-[#00e5ff] flex-shrink-0 mt-2.5 sm:mt-0" />
              <p className="text-xs sm:text-sm text-[#8ab4d4] leading-relaxed">
                PulseIQ helps organizations track real-time user behavior, detect journey friction,
                and generate AI-powered recommendations that improve conversions, retention, and product decisions.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-2 mb-8 sm:mb-10">
              {[
                { icon: Zap, label: "Fast Setup" },
                { icon: Activity, label: "Real-Time Tracking" },
                { icon: TrendingUp, label: "AI Recommendations" },
                { icon: Shield, label: "Secure RBAC" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#0d2140] bg-[#060d18] hover:border-[#00e5ff33] hover:bg-[#00e5ff08] transition-all duration-300"
                >
                  <Icon className="w-3 h-3 text-[#00e5ff]" />
                  <span className="text-[9px] sm:text-[10px] text-[#8ab4d4] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 32px #00e5ff55" }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#00e5ff] text-[#020408] font-black rounded-xl overflow-hidden uppercase tracking-widest text-xs sm:text-sm"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    Create Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <Link to="/demo" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: "#00e5ff44" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent border border-[#0d2140] text-[#8ab4d4] hover:text-[#00e5ff] font-bold rounded-xl uppercase tracking-widest text-xs sm:text-sm transition-colors duration-300"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Terminal className="w-4 h-4" /> View Demo
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            <motion.div variants={item} className="flex gap-6 sm:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[#0d2140]">
              {[
                { val: "50K+", label: "Events / Day" },
                { val: "99.9%", label: "Availability" },
                { val: "<5m", label: "Setup Time" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-xl sm:text-2xl font-black text-[#00e5ff] text-glow-cyan" style={{ fontFamily: "var(--font-display)" }}>
                    {val}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#3d6080] uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={item} className="relative hidden sm:block">
            <div className="absolute inset-0 bg-[#00e5ff] opacity-[0.04] blur-[60px] rounded-3xl" />
            <DashboardMockup />
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="relative mt-10 sm:hidden">
          <div className="absolute inset-0 bg-[#00e5ff] opacity-[0.04] blur-[60px] rounded-3xl" />
          <DashboardMockup />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-[#00e5ff33] flex items-start justify-center pt-1">
          <div className="w-1 h-2 bg-[#00e5ff] rounded-full" />
        </div>
        <p className="text-[9px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
          Scroll
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
