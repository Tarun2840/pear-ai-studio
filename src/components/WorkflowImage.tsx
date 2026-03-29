import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanSearch, Loader2, Image as ImageIcon, RotateCcw, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageCard from "./ImageCard";

type Step = "upload" | "analyzing" | "analysis" | "generating" | "result";

interface Analysis {
  mainSubject: string;
  objects: string[];
  colorPalette: string[];
  lighting: string;
  artisticStyle: string;
  mood: string;
  composition: string;
  variationPrompt: string;
}

const WorkflowImage = () => {
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [variationImage, setVariationImage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) { toast.error("Please upload an image"); return; }
    setStep("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64 },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
      setStep("analysis");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      setStep("upload");
    }
  };

  const handleGenerateVariation = async () => {
    if (!analysis) return;
    setStep("generating");
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: analysis.variationPrompt },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setVariationImage(data.imageUrl);
      setStep("result");
    } catch (e: any) {
      toast.error(e.message || "Variation generation failed");
      setStep("analysis");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setImagePreview("");
    setImageBase64("");
    setAnalysis(null);
    setVariationImage("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {(step === "upload" || step === "analyzing") && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            
            {!imagePreview ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card p-12 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="gradient-primary rounded-xl p-4">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Upload an image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-border">
                  <img src={imagePreview} alt="Uploaded" className="w-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setImagePreview(""); setImageBase64(""); if (fileRef.current) fileRef.current.value = ""; }} className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground hover:bg-muted">
                    Change
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={step === "analyzing"}
                    className="gradient-primary flex flex-[2] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-50"
                  >
                    {step === "analyzing" ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><ScanSearch className="h-5 w-5" /> Analyze Image</>}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {(step === "analysis" || step === "generating") && analysis && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="mx-auto max-w-[200px] overflow-hidden rounded-xl border border-border">
                <img src={imagePreview} alt="Source" className="w-full object-cover" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold text-foreground">Analysis Results</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-foreground">Subject:</span> <span className="text-muted-foreground">{analysis.mainSubject}</span></p>
                  <p><span className="font-medium text-foreground">Style:</span> <span className="text-muted-foreground">{analysis.artisticStyle}</span></p>
                  <p><span className="font-medium text-foreground">Lighting:</span> <span className="text-muted-foreground">{analysis.lighting}</span></p>
                  <p><span className="font-medium text-foreground">Mood:</span> <span className="text-muted-foreground">{analysis.mood}</span></p>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Colors:</span>
                    {analysis.colorPalette?.map((c, i) => (
                      <div key={i} className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Variation Prompt</p>
              <p className="text-sm text-foreground">{analysis.variationPrompt}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground hover:bg-muted">
                Start Over
              </button>
              <button
                onClick={handleGenerateVariation}
                disabled={step === "generating"}
                className="gradient-primary flex flex-[2] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-50"
              >
                {step === "generating" ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Palette className="h-5 w-5" /> Generate Variation</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original</p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <img src={imagePreview} alt="Original" className="w-full object-cover" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Variation</p>
                <ImageCard imageUrl={variationImage} title="AI Variation" />
              </div>
            </div>
            <button onClick={handleReset} className="mx-auto flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-muted">
              <RotateCcw className="h-4 w-4" /> Try Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowImage;
