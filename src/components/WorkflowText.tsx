import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Check, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageCard from "./ImageCard";

type Step = "input" | "enhancing" | "approval" | "generating" | "result";

const WorkflowText = () => {
  const [step, setStep] = useState<Step>("input");
  const [userPrompt, setUserPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const handleEnhance = async () => {
    if (!userPrompt.trim()) { toast.error("Please enter a prompt"); return; }
    setStep("enhancing");
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt: userPrompt },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setEnhancedPrompt(data.enhanced);
      setStep("approval");
    } catch (e: any) {
      toast.error(e.message || "Enhancement failed");
      setStep("input");
    }
  };

  const handleGenerate = async () => {
    setStep("generating");
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: enhancedPrompt },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setGeneratedImage(data.imageUrl);
      setStep("result");
    } catch (e: any) {
      toast.error(e.message || "Image generation failed");
      setStep("approval");
    }
  };

  const handleReset = () => {
    setStep("input");
    setUserPrompt("");
    setEnhancedPrompt("");
    setGeneratedImage("");
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {(["Input", "Enhance", "Approve", "Generate"] as const).map((label, i) => {
          const stepIndex = ["input", "enhancing", "approval", "generating", "result"].indexOf(step);
          const isActive = i <= Math.min(stepIndex, 3);
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${isActive ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {(step === "input" || step === "enhancing") && (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <label className="text-sm font-medium text-foreground">Describe the image you want to create</label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., A cat wearing a space suit floating in the cosmos..."
              className="w-full rounded-xl border border-input bg-card p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-none"
              disabled={step === "enhancing"}
            />
            <button
              onClick={handleEnhance}
              disabled={step === "enhancing" || !userPrompt.trim()}
              className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "enhancing" ? <><Loader2 className="h-5 w-5 animate-spin" /> Enhancing...</> : <><Wand2 className="h-5 w-5" /> Enhance Prompt</>}
            </button>
          </motion.div>
        )}

        {(step === "approval" || step === "generating") && (
          <motion.div key="approval" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original</p>
              <p className="text-sm text-muted-foreground">{userPrompt}</p>
            </div>
            <label className="text-sm font-medium text-foreground">Enhanced Prompt — edit if needed</label>
            <textarea
              value={enhancedPrompt}
              onChange={(e) => setEnhancedPrompt(e.target.value)}
              className="w-full rounded-xl border border-input bg-card p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[140px] resize-none"
              disabled={step === "generating"}
            />
            <div className="flex gap-3">
              <button onClick={() => setStep("input")} className="flex-1 rounded-xl border border-border bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-muted">
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={step === "generating"}
                className="gradient-primary flex flex-[2] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
              >
                {step === "generating" ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Check className="h-5 w-5" /> Approve &amp; Generate</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && generatedImage && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="mx-auto max-w-lg">
              <ImageCard imageUrl={generatedImage} title="Generated Image" description={enhancedPrompt.slice(0, 80) + "..."} />
            </div>
            <button onClick={handleReset} className="mx-auto flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-muted">
              <RotateCcw className="h-4 w-4" /> Create Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowText;
