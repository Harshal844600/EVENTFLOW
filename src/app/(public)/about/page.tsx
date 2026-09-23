"use client";

import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/SpotlightCard";

export default function AboutPage() {
  return (
    <div className="space-y-24 py-12 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-anton text-6xl md:text-8xl uppercase tracking-tighter"
        >
          About <span className="text-primary">EventFlow</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-foreground/70 font-medium max-w-3xl mx-auto"
        >
          We are redefining how events are discovered, created, and experienced.
        </motion.p>
      </section>

      {/* Grid Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
        className="grid md:grid-cols-2 gap-8"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="h-full p-8 bg-inverted-bg text-inverted-text">
            <h2 className="font-anton text-4xl uppercase mb-4 text-primary">Our Mission</h2>
            <p className="text-lg leading-relaxed text-secondary/90">
              EventFlow was built with a single goal in mind: to eliminate the friction between event organizers and attendees. By leveraging modern AI and a serverless architecture, we provide a platform that handles scale effortlessly while maintaining a stunning user experience.
            </p>
          </SpotlightCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="h-full p-8 bg-background">
            <h2 className="font-anton text-4xl uppercase mb-4 text-foreground">The Tech</h2>
            <p className="text-lg leading-relaxed text-foreground/70">
              We utilize a cutting-edge stack. Our platform is powered by Next.js 15, styled with Tailwind CSS, and animated with Framer Motion. Content generation is augmented by Groq's Llama 3 models, and payments are securely processed via Razorpay.
            </p>
          </SpotlightCard>
        </motion.div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center"
      >
        <SpotlightCard className="p-16 bg-secondary/10 border-none">
          <h2 className="font-anton text-5xl uppercase mb-8 text-foreground">
            Ready to dive in?
          </h2>
          <a
            href="/events"
            className="inline-block bg-primary text-foreground px-12 py-5 text-xl font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-transform duration-300 shadow-xl"
          >
            Find an Event
          </a>
        </SpotlightCard>
      </motion.section>
    </div>
  );
}
