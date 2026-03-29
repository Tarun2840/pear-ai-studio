import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface ImageCardProps {
  imageUrl: string;
  title?: string;
  description?: string;
}

const ImageCard = ({ imageUrl, title, description }: ImageCardProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `pear-media-${Date.now()}.png`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-md"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title || "Generated image"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div>
          {title && <p className="text-sm font-semibold text-primary-foreground">{title}</p>}
          {description && <p className="text-xs text-primary-foreground/70">{description}</p>}
        </div>
        <button
          onClick={handleDownload}
          className="gradient-primary rounded-lg p-2 text-primary-foreground transition-transform hover:scale-110"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ImageCard;
