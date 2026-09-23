"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/SpotlightCard";
import { 
  Briefcase, 
  Building, 
  FileText, 
  Tag, 
  Globe, 
  User as UserIcon,
  Save,
  Loader2
} from "lucide-react";

// Custom SVG Icons for LinkedIn and GitHub to avoid missing exports in this lucide-react version
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio: string | null;
    company: string | null;
    jobTitle: string | null;
    skills: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    jobTitle: user.jobTitle || "",
    company: user.company || "",
    bio: user.bio || "",
    skills: user.skills || "",
    linkedin: user.linkedin || "",
    github: user.github || "",
    website: user.website || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Profile submit error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (id: string, text: string, IconComponent: any, iconColorClass = "text-primary") => {
    const isActive = activeField === id;
    return (
      <label 
        htmlFor={id} 
        className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-2 cursor-pointer select-none mb-1.5"
      >
        <motion.div
          animate={{
            scale: isActive ? 1.25 : 1,
            rotate: isActive ? [0, -10, 10, -5, 5, 0] : 0,
            color: isActive ? "var(--color-primary)" : undefined
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={iconColorClass}
        >
          <IconComponent className="w-3.5 h-3.5" />
        </motion.div>
        <motion.span
          animate={{
            color: isActive ? "var(--color-primary)" : "var(--color-foreground)"
          }}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.span>
      </label>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Spotlight Card 1: Professional Details */}
      <SpotlightCard disableTilt={true} className="bg-card-bg/40 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 md:p-8 shadow-xl transition-theme overflow-visible" spotlightColor="rgba(255, 225, 124, 0.1)">
        <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground border-b border-card-border/30 pb-3 mb-6 flex items-center justify-between">
          <span>Professional Info</span>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">Required</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="flex flex-col">
            {renderLabel("name", "Full Name", UserIcon)}
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setActiveField("name")}
              onBlur={() => setActiveField(null)}
              required
              placeholder="Your Name"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Job Title */}
          <div className="flex flex-col">
            {renderLabel("jobTitle", "Job Title", Briefcase)}
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              onFocus={() => setActiveField("jobTitle")}
              onBlur={() => setActiveField(null)}
              placeholder="e.g. Senior Developer, Designer"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Company */}
          <div className="flex flex-col">
            {renderLabel("company", "Organization / Company", Building)}
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              onFocus={() => setActiveField("company")}
              onBlur={() => setActiveField(null)}
              placeholder="e.g. Acme Corp, Freelance"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Skills */}
          <div className="flex flex-col">
            {renderLabel("skills", "Skills (comma-separated)", Tag)}
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              onFocus={() => setActiveField("skills")}
              onBlur={() => setActiveField(null)}
              placeholder="e.g. React, Next.js, Figma, SQL"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
            {formData.skills && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {formData.skills.split(",").map((skill, index) => {
                  const trimmed = skill.trim();
                  if (!trimmed) return null;
                  return (
                    <motion.span 
                      key={index} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: Math.min(index * 0.05, 0.3) }}
                      className="text-[10px] font-bold bg-primary/10 text-foreground px-2.5 py-0.5 rounded-full border border-primary/10 select-none cursor-default"
                    >
                      {trimmed}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col mt-6">
          {renderLabel("bio", "Professional Bio", FileText)}
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            onFocus={() => setActiveField("bio")}
            onBlur={() => setActiveField(null)}
            rows={4}
            placeholder="Tell us about yourself, your career, and what you are building or looking to connect about..."
            className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium resize-none"
          />
        </div>
      </SpotlightCard>

      {/* Spotlight Card 2: Social Links */}
      <SpotlightCard disableTilt={true} className="bg-card-bg/40 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 md:p-8 shadow-xl transition-theme overflow-visible" spotlightColor="rgba(183, 198, 194, 0.15)">
        <h3 className="font-anton text-2xl uppercase tracking-wide text-foreground border-b border-card-border/30 pb-3 mb-6 flex items-center justify-between">
          <span>Social & Links</span>
          <span className="text-xs font-bold text-secondary bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20">Optional</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LinkedIn */}
          <div className="flex flex-col">
            {renderLabel("linkedin", "LinkedIn URL", LinkedinIcon, "text-[#0a66c2]")}
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              onFocus={() => setActiveField("linkedin")}
              onBlur={() => setActiveField(null)}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          {/* GitHub */}
          <div className="flex flex-col">
            {renderLabel("github", "GitHub URL", GithubIcon, "text-foreground")}
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              onFocus={() => setActiveField("github")}
              onBlur={() => setActiveField(null)}
              placeholder="https://github.com/username"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Website */}
          <div className="flex flex-col">
            {renderLabel("website", "Personal Website", Globe, "text-primary")}
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              onFocus={() => setActiveField("website")}
              onBlur={() => setActiveField(null)}
              placeholder="https://yourportfolio.com"
              className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
        </div>
      </SpotlightCard>

      {/* Submit Section */}
      <div className="pt-4 flex justify-end">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(255, 225, 124, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 bg-primary text-foreground px-8 py-4 rounded-2xl font-bold uppercase tracking-wider disabled:opacity-60 disabled:scale-100 disabled:shadow-none cursor-pointer duration-300 text-sm shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} />
              <span>Save Profile Details</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
