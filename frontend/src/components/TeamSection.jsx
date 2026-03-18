import { motion } from "framer-motion";
import { Linkedin, Mail, ExternalLink } from "lucide-react";

const team = [
  {
    name: "Arpan Jain",
    role: "Project Lead & Coordinator",
    color: "from-blue-600 via-blue-500 to-cyan-400",
    linkedin: "https://www.linkedin.com/in/arpan-jain-42386b2a7",
    email: "arpanjain00123@gmail.com",
    isLead: true,
  },
  {
    name: "Aryan Gupta",
    role: "Core Team",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    linkedin: "https://www.linkedin.com/in/aryan-gupta-5731662b4/",
    email: "aryan2135gupta@gmail.com",
  },
  {
    name: "Girraj Singh",
    role: "Core Team",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    email: "girraj.singh_cs23@gla.ac.in",
  },
  {
    name: "Khushi Malhotra",
    role: "Core Team",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    linkedin: "https://www.linkedin.com/in/khushi-malhotra-843b64310/",
  },
  {
    name: "Radhika Gupta",
    role: "Core Team",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    linkedin: "https://www.linkedin.com/in/radhika-gupta-45a954300/",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

const TeamSection = () => {
  return (
    <section id="team" className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Expert</span> Team
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The talented engineers driving innovation through code and collaboration.
          </p>
        </div>

        {/* Flexbox with justify-center to handle the 3+2 layout perfectly */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 lg:gap-10"
        >
          {team.map((member) => (
            <motion.div
              key={member.name}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="relative w-full sm:w-[320px] group bg-card/60 border border-border/50 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl transition-all duration-300"
            >
              {/* Top Banner with Gradient Pattern */}
              <div className={`h-28 w-full bg-gradient-to-br ${member.color} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:20px_20px]" />
              </div>

              {/* Card Content */}
              <div className="px-6 pb-8 pt-2 relative">
                
                {/* Avatar with Ring */}
                <div className="relative -mt-14 mb-5 flex justify-center">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${member.color} flex items-center justify-center text-3xl font-bold text-white ring-[6px] ring-card shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                    {member.name.charAt(0)}
                  </div>
                  {member.isLead && (
                    <div className="absolute -top-2 right-1/4 bg-primary text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg border-2 border-card">
                      LEAD
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${member.color} bg-opacity-10`}>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">
                        {member.role}
                     </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                  Delivering high-quality solutions and exceptional user experiences.
                </p>

                {/* Social Actions */}
                <div className="flex items-center justify-center gap-3 border-t border-border/40 pt-6">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" 
                       className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`}
                       className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20">
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                  
                </div>
              </div>

              {/* Subtle Bottom Accent */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${member.color} opacity-50`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;