"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@meshsdk/react";
import { BridgeL1Card } from "@/features/bridge/components/BridgeL1Card";
import { BridgeL2Card } from "@/features/bridge/components/BridgeL2Card";

export default function BridgePage() {
  const { connected } = useWallet();
  // Chỉ quản lý hướng để điều khiển UI (thẻ nào sáng, thẻ nào mờ)
  const [activeDirection, setActiveDirection] = useState<"L1_TO_L2" | "L2_TO_L1">("L1_TO_L2");

  const handleSwap = () => {
    setActiveDirection(prev => prev === "L1_TO_L2" ? "L2_TO_L1" : "L1_TO_L2");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-6">
      <div className="text-center space-y-2 mb-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 glow-cyan">
          <ArrowRightLeft className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text">Hydra Bridge</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">Seamlessly transfer your assets between Cardano Mainnet and Hydra L2 Head.</p>
      </div>

      {!connected && (
        <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center justify-center gap-2">
          <Wallet className="w-5 h-5" />
          <p className="font-medium">Please connect your wallet to use the bridge.</p>
        </div>
      )}

      <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-start">
        {/* Card L1: Tự gọi useDeposit, nhận isActive để biết có nên hiện form không */}
        <BridgeL1Card isActive={activeDirection === "L1_TO_L2"} />

        {/* Nút đảo chiều UI */}
        <div className="flex justify-center z-10 py-2 md:py-0 md:mt-32">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-14 h-14 glass-panel border-primary/20 hover:bg-primary/20 hover:text-primary transition-all shadow-lg" 
            onClick={handleSwap}
          >
            <ArrowRightLeft className={`w-6 h-6 transition-transform duration-500 ${activeDirection === "L2_TO_L1" ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Card L2: Tự gọi useDecommit, nhận isActive để biết có nên hiện form không */}
        <BridgeL2Card isActive={activeDirection === "L2_TO_L1"} />
      </div>
    </div>
  );
}