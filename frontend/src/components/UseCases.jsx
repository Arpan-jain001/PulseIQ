import { motion } from "framer-motion";
import { Building2, GraduationCap, ShoppingCart, Briefcase, Users, Globe, Sparkles } from "lucide-react";

const targets = [
  { icon: GraduationCap, name: "Coaching Centers", desc: "Track student engagement and question difficulty patterns", color: "from-primary/10 to-accent/5" },
  { icon: Building2, name: "EdTech Platforms", desc: "Analyze course completion rates and drop-off points", color: "from-accent/10 to-primary/5" },
  { icon: ShoppingCart, name: "E-commerce", desc: "Optimize checkout flows and reduce cart abandonment", color: "from-emerald/10 to-primary/5" },
  { icon: Briefcase, name: "SaaS Companies", desc: "Understand feature adoption and user retention", color: "from-amber/10 to-emerald/5" },
  { icon: Users, name: "HR & Job Portals", desc: "Track application funnels and candidate behaviour", color: "from-sky/10 to-accent/5" },
  { icon: Globe, name: "Digital Businesses", desc: "Comprehensive analytics for growing platforms", color: "from-rose/10 to-amber/5" },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-28 px-6 relative">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald/5 border border-emerald/15 text-emerald text-sm font-medium mb-6">
            Who We Serve
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Built for <span className="text-gradient-hero">every industry</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            From startups to enterprises, PulseIQ adapts to your unique analytics needs.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {targets.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background hover:shadow-medium transition-all duration-500"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${t.color}`} />

              <div className="p-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <t.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </div>

                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {t.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="relative p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-primary/10 rounded-full animate-[spin-slow_20s_linear_infinite] pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-28 h-28 border border-accent/10 rounded-full animate-[spin-slow_15s_linear_infinite_reverse] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>

                <div>
                  <span className="text-xs font-mono text-primary uppercase tracking-widest block">
                    AI Insight
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Generated 2 seconds ago
                  </span>
                </div>
              </div>

              <p className="text-foreground font-medium leading-relaxed">
                "Math section shows <span className="text-primary font-bold">28% higher drop-off</span> compared to other sections.
                Question 8 appears significantly difficult — consider rewording or providing contextual hints.
                <span className="text-accent font-bold"> Reattempt rate: 42%</span> suggests students want to try again."
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default UseCases;