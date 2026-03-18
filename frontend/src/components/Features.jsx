import { motion } from "framer-motion";
import { Shield, BarChart3, Brain, MessageSquare, Settings, GraduationCap } from "lucide-react";

const features = [
  { icon: Shield, title: "Auth & Access Control", description: "Secure login/signup with role-based access. Admin, Member, and Viewer roles with enterprise SSO.", color: "bg-emerald/10 text-emerald border-emerald/20", iconColor: "text-emerald" },
  { icon: BarChart3, title: "Advanced Analytics", description: "DAU/MAU tracking, page & event analytics, funnel drop analysis, and retention metrics — all in real time.", color: "bg-primary/10 text-primary border-primary/20", iconColor: "text-primary" },
  { icon: Brain, title: "AI Insights Engine", description: "Behavior anomaly detection, conversion optimization suggestions, and predictive analysis powered by AI.", color: "bg-accent/10 text-accent border-accent/20", iconColor: "text-accent" },
  { icon: MessageSquare, title: "AI Chatbot Assistant", description: "Natural language queries for your dashboard. Ask anything about your analytics data in plain English.", color: "bg-sky/10 text-sky border-sky/20", iconColor: "text-sky" },
  { icon: Settings, title: "Admin Control Panel", description: "API key management, project settings, team collaboration tools, and smart alert systems.", color: "bg-amber/10 text-amber border-amber/20", iconColor: "text-amber" },
  { icon: GraduationCap, title: "EdTech Analytics", description: "Question-wise drop rates, section difficulty patterns, time-per-question analysis for exam platforms.", color: "bg-rose/10 text-rose border-rose/20", iconColor: "text-rose" },
];

const Features = () => {
  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 line-pattern opacity-20 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/15 text-accent text-sm font-medium mb-6"
          >
            <Sparkle /> Core Features
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Everything you need to<br />
            <span className="text-gradient-hero">decode user behaviour</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Most analytics tools show numbers. PulseIQ explains the story behind the numbers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group p-6 rounded-2xl border border-border bg-background hover:shadow-medium transition-all duration-500 cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={1.5} />
              </div>

              <h3 className="text-lg font-display font-semibold text-foreground mb-2.5">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

const Sparkle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
  </svg>
);

export default Features;