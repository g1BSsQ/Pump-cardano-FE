import { Rocket, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface BondingCurveVisualProps {
  progress: number;
  raised: string;
  target: string;
}

export const BondingCurveVisual = ({ progress, raised, target }: BondingCurveVisualProps) => {
  const isGraduating = progress >= 100;

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Bonding Curve
        </h3>
        {isGraduating && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
            <Rocket className="w-3 h-3" />
            Graduating!
          </span>
        )}
      </div>

      {/* Visual Curve */}
      <div className="relative h-32 bg-secondary/30 rounded-xl overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-full h-px bg-border"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>

        {/* Curve path */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            d="M 0 128 Q 50 100, 100 80 T 200 50 T 300 25 T 400 10"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            className="drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
          />
          <path
            d="M 0 128 Q 50 100, 100 80 T 200 50 T 300 25 T 400 10 L 400 128 L 0 128"
            fill="url(#curveGradient)"
            opacity="0.3"
          />
        </svg>

        {/* Progress marker */}
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 -translate-x-1/2"
          style={{ bottom: `${20 + (progress * 0.6)}%` }}
        >
          <div className="w-3 h-3 rounded-full bg-primary glow-cyan animate-pulse" />
        </motion.div>

        {/* DEX graduation line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-success/50" />
        <div className="absolute right-2 top-2 flex items-center gap-1 text-[10px] text-success font-semibold">
          <Rocket className="w-3 h-3" />
          DEX
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isGraduating ? 'bg-success' : 'bg-gradient-to-r from-primary to-accent'}`}
            style={{
              boxShadow: isGraduating 
                ? '0 0 20px hsl(var(--success) / 0.5)' 
                : '0 0 20px hsl(var(--primary) / 0.5)'
            }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono font-bold text-primary">{progress.toFixed(1)}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <DollarSign className="w-3 h-3" />
            Raised
          </div>
          <p className="font-mono font-bold text-lg">{raised}</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Rocket className="w-3 h-3" />
            Target
          </div>
          <p className="font-mono font-bold text-lg">{target}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        When the bonding curve reaches 100%, the token will graduate to DEX trading with full liquidity.
      </p>
    </div>
  );
};
