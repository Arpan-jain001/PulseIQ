import { motion } from "framer-motion";
import { Building2, Code2, BarChart3, Cpu, Zap, ArrowRight } from "lucide-react";

const steps = [
  { icon: Building2, num: "01", title: "Create Account", desc: "Set up your workspace in seconds. No credit card required." },
  { icon: Code2, num: "02", title: "Generate API Key", desc: "Get a secure API key and lightweight tracking script." },
  { icon: Zap, num: "03", title: "Integrate & Track", desc: "Add one line of code. Events flow to PulseIQ instantly." },
  { icon: BarChart3, num: "04", title: "Analyze Data", desc: "Real-time dashboards show funnels, retention, and drops." },
  { icon: Cpu, num: "05", title: "AI Processes", desc: "Our engine detects patterns and anomalies automatically." },
  { icon: ArrowRight, num: "06", title: "Act on Insights", desc: "Get actionable recommendations to boost conversions." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-sm font-medium mb-6">
            How It Works
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            From integration to<br />
            <span className="text-gradient-hero">intelligence in minutes</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative p-6 rounded-2xl border border-border bg-background hover:shadow-medium transition-all duration-500 group overflow-hidden"
            >
              <span className="absolute -top-4 -right-2 text-8xl font-display font-bold text-secondary group-hover:text-primary/5 transition-colors duration-500 select-none">
                {step.num}
              </span>

              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-500">
                  <step.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {i < steps.length - 1 && i % 3 !== 2 && (
                <div className="absolute top-1/2 -right-3 w-6 h-px bg-border hidden lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;