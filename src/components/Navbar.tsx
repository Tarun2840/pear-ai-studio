import { Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-display">
            <span className="text-gradient">Pear Media</span>
          </h1>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">
          AI-Powered Creative Studio
        </p>
      </div>
    </nav>
  );
};

export default Navbar;
