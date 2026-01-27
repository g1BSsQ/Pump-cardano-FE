import { useState } from "react";
import { ArrowDownUp, Settings, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SwapPanelProps {
  token: {
    ticker: string;
    image: string;
    price: string;
  };
}

export const SwapPanel = ({ token }: SwapPanelProps) => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.5");

  const presetAmounts = ["10", "50", "100", "500"];

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* Mode Toggle */}
      <div className="flex p-1 bg-secondary/50 rounded-lg">
        <button
          onClick={() => setMode("buy")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            mode === "buy" 
              ? "bg-success text-primary-foreground shadow-lg shadow-success/25" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            mode === "sell" 
              ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sell
        </button>
      </div>

      {/* Settings Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {mode === "buy" ? "You pay" : "You sell"}
        </span>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
              <span className="text-xs text-muted-foreground">Slippage Tolerance</span>
              <div className="flex gap-2">
                {["0.1", "0.5", "1.0"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={cn(
                      "flex-1 py-1.5 text-xs rounded-md transition-colors",
                      slippage === value 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs text-center rounded-md bg-muted border border-border focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input - From */}
      <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-2xl font-mono font-bold outline-none w-full placeholder:text-muted-foreground"
          />
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
              ₳
            </div>
            <span className="font-semibold">ADA</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>≈ $0.00</span>
          <span>Balance: 1,234.56 ADA</span>
        </div>
        <div className="flex gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className="flex-1 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              {preset} ₳
            </button>
          ))}
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center -my-2 relative z-10">
        <button className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/50 hover:bg-secondary/80 transition-all">
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* Output - To */}
      <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-mono font-bold text-muted-foreground">
            {amount ? (parseFloat(amount) * 1000000).toLocaleString() : "0.00"}
          </span>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Image
              src={token.image}
              alt={token.ticker}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold">${token.ticker}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>≈ $0.00</span>
          <span>Balance: 0 {token.ticker}</span>
        </div>
      </div>

      {/* Trade Info */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Rate</span>
          <span className="font-mono">1 ADA = 1,000,000 {token.ticker}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Slippage</span>
          <span className="font-mono">{slippage}%</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Network Fee</span>
          <span className="font-mono">~0.17 ADA</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        variant="neon" 
        size="lg" 
        className={cn(
          "w-full",
          mode === "sell" && "bg-gradient-to-r from-destructive to-accent"
        )}
      >
        <Zap className="w-4 h-4" />
        {mode === "buy" ? `Buy $${token.ticker}` : `Sell $${token.ticker}`}
      </Button>
    </div>
  );
};
