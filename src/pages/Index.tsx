import { useState } from "react";
import { motion } from "framer-motion";
import { Type, ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import WorkflowText from "@/components/WorkflowText";
import WorkflowImage from "@/components/WorkflowImage";

type Tab = "text" | "image";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("text");

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-glow fixed inset-x-0 top-0 h-96 pointer-events-none" />
      <Navbar />

      <main className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Create with <span className="text-gradient">AI</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Enhance prompts, generate images, and explore style variations.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-muted p-1">
            {([
              { key: "text" as Tab, label: "Creative Studio", icon: Type },
              { key: "image" as Tab, label: "Style Lab", icon: ImageIcon },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-card text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "text" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
        >
          {activeTab === "text" ? <WorkflowText /> : <WorkflowImage />}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
