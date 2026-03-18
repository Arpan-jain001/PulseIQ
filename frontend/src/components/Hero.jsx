import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const Hero = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative pt-32 md:pt-40 pb-20 px-6 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-60 left-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none"
      />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div variants={container} initial="hidden" animate="show">

          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary">Now in Private Beta</span>
          </motion.div>

          <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-8">
            <span className="text-gradient-hero">Transform Data</span>
            <br />
            <span className="text-foreground">Into </span>
            <span className="relative inline-block">
              <span className="text-gradient-hero">Intelligence</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
              >
                <motion.path
                  d="M2 8 C 50 2, 100 12, 150 6 S 250 2, 298 8"
                  fill="none"
                  stroke="hsl(220, 90%, 56%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p variants={item} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            PulseIQ combines real-time tracking, behavioral analytics, and AI insights
            to help you understand <strong className="text-foreground">why users do what they do</strong> — not just what they do.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/signup">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="group w-full sm:w-auto px-8 py-4 bg-foreground text-background font-bold rounded-full transition-all shadow-medium flex items-center gap-2.5 text-base"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </motion.button>
            </Link>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="w-full sm:w-auto px-8 py-4 bg-secondary border border-border text-foreground font-bold rounded-full transition-all hover:shadow-soft flex items-center gap-2.5 text-base"
            >
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={2} />
              View Demo
            </motion.button>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: Zap, text: "Setup in 5 minutes" },
              { icon: TrendingUp, text: "+14.2% avg conversion lift" },
              { icon: Sparkles, text: "AI-powered insights" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 max-w-6xl mx-auto"
      >
        <div className="relative rounded-2xl border border-border bg-background shadow-medium p-1.5 overflow-hidden">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
          <div className="relative rounded-xl bg-card overflow-hidden">
            <DashboardMockup />
          </div>
        </div>
      </motion.div>
    </section>
  );
};



const DashboardMockup = () => {
  const stats = [
    { label: "Active Users", value: "12,847", change: "+14.2%", positive: true },
    { label: "Conversion", value: "68.4%", change: "+3.1%", positive: true },
    { label: "Avg. Session", value: "4m 32s", change: "+8.7%", positive: true },
    { label: "Drop-off Rate", value: "12.3%", change: "-2.4%", positive: false }
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full !bg-red-500 shadow-sm" />
<div className="w-3 h-3 rounded-full !bg-yellow-400 shadow-sm" />
<div className="w-3 h-3 rounded-full !bg-green-500 shadow-sm" />
          <span className="ml-3 text-xs font-mono text-muted-foreground">
            dashboard.pulseiq.ai
          </span>
        </div>

        <div className="h-7 px-3 rounded-md bg-secondary flex items-center">
          <span className="text-[10px] font-mono text-muted-foreground">
            Last 30 days
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-3.5 rounded-xl border border-border bg-background"
          >
            <p className="text-[11px] text-muted-foreground mb-1">
              {s.label}
            </p>

            <p className="text-lg md:text-xl font-mono font-bold text-foreground">
              {s.value}
            </p>

            <span
              className={`text-[11px] font-semibold ${
  s.positive ? "!text-green-500" : "!text-red-500"
}`}
            >
              {s.change}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground">
            User Activity
          </span>

          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Sessions
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conversions
            </span>
          </div>
        </div>

  <div className="h-40 w-full bg-white/60 backdrop-blur-sm rounded-md p-2">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={[
          { name: "1", sessions: 400, conversions: 120 },
          { name: "2", sessions: 600, conversions: 200 },
          { name: "3", sessions: 800, conversions: 300 },
          { name: "4", sessions: 700, conversions: 250 },
          { name: "5", sessions: 900, conversions: 400 },
        ]}
      >
        <defs>
          <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>

          <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <Tooltip />

        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#6366f1"
          fill="url(#s)"
          strokeWidth={2}
        />

        <Area
          type="monotone"
          dataKey="conversions"
          stroke="#22c55e"
          fill="url(#c)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            AI Insight:
          </span>{" "}
          Checkout page shows 23% higher drop-off on mobile.
        </p>
      </motion.div>
    </div>
  );




};

export default Hero;