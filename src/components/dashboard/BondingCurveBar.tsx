import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

interface BondingCurveBarProps {
  progress: number;
  showGraduation?: boolean;
  size?: "sm" | "md" | "lg";
}

export const BondingCurveBar = ({ 
  progress, 
  showGraduation = false,
  size = "md" 
}: BondingCurveBarProps) => {
  const heightMap = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className="relative">
      <div className={cn("bonding-bar", heightMap[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bonding-bar-fill"
        />
      </div>
      
      {showGraduation && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
            progress >= 100 
              ? "bg-success/20 text-success" 
              : "bg-muted text-muted-foreground"
          )}>
            <Rocket className="w-3 h-3" />
            DEX
          </div>
        </div>
      )}
    </div>
  );
};
