"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDecommit } from "../hooks/useDecommit";
import { TokenSelectModal } from "./TokenSelectModal";

export const BridgeL2Card = ({ isActive }: { isActive: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    connected,
    adaAmount,
    setAdaAmount,
    selectedUnits,
    setSelectedUnits,
    tokenAmounts,
    setTokenAmounts,
    activeHead,
    adaBalance,
    availableTokens,
    selectedTokens,
    isLoading,
    handleMaxAda,
    handleMaxToken,
    decommit
  } = useDecommit();

  const hasAmount = (Number(adaAmount) > 0) || Object.values(tokenAmounts).some(v => Number(v) > 0);

  return (
    <Card className={`glass-panel transition-all duration-300 ${isActive ? "border-primary/50 glow-cyan ring-1 ring-primary/50 scale-100" : "opacity-50 scale-[0.98] grayscale-[0.5]"}`}>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center justify-between text-lg">
           <div className="flex items-center gap-2">
             <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
             Hydra Head (L2)
           </div>
           {activeHead && (
             <div className="text-xs font-mono px-2 py-1 bg-secondary rounded-md">Port: {activeHead.port}</div>
           )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        
        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">L2 ADA Balance:</span>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="font-mono font-bold text-lg text-yellow-500">{adaBalance} ₳</span>}
        </div>

        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-visible">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <label>ADA Amount *</label>
                  <button className="text-xs text-yellow-500 hover:underline" onClick={handleMaxAda}>MAX</button>
                </div>
                <div className="relative">
                  <Input type="number" placeholder="0.00" value={adaAmount} onChange={(e) => setAdaAmount(e.target.value)} disabled={!connected} max={adaBalance.replace(/,/g,"")} className="pr-16 font-mono bg-background/50 h-12 text-lg focus-visible:ring-yellow-500/50 text-right overflow-x-auto whitespace-nowrap" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">ADA</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Additional Tokens (Optional)</label>
                {selectedTokens.map((tok) => (
                  <div key={tok.unit} className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 px-2 h-12 glass-panel border-yellow-500/30 rounded-md min-w-[120px]">
                      <span className="font-bold text-yellow-500">{tok.ticker}</span>
                    </div>
                    <div className="relative flex-1 min-w-0">
                       <Input
                         type="number"
                         integerOnly
                         placeholder="0"
                         value={tokenAmounts[tok.unit] || ""}
                         onChange={(e) => setTokenAmounts(prev => ({ ...prev, [tok.unit]: e.target.value }))}
                         disabled={!connected}
                         max={tok.balance.replace(/,/g,"")}
                         className="h-12 font-mono bg-background/50 pr-16 focus-visible:ring-yellow-500/50 text-right overflow-x-auto whitespace-nowrap"
                       />
                       <button
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-yellow-500"
                         onClick={() => handleMaxToken(tok.unit)}
                       >
                         MAX
                       </button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-destructive" onClick={() => {
                      setSelectedUnits(prev => prev.filter(u => u !== tok.unit));
                      setTokenAmounts(prev => {
                        const { [tok.unit]: _, ...rest } = prev;
                        return rest;
                      });
                    }}>
                       <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-dashed border-border/50 hover:border-yellow-500/50 hover:bg-yellow-500/5 group"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!connected || availableTokens.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {availableTokens.length === 0 ? "No tokens on L2" : "Add Token to Withdraw"}
                </Button>
              </div>

              <Button className="w-full font-bold text-lg h-14 bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/10" size="lg" onClick={decommit} disabled={!connected || !hasAmount}>
                Withdraw Assets to L1
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <TokenSelectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          tokens={availableTokens.filter(t => !selectedUnits.includes(t.unit))} 
          onSelect={(t) => {
            if (!selectedUnits.includes(t.unit)) {
              setSelectedUnits([...selectedUnits, t.unit]);
            }
          }}
          balanceKey="balanceL2"
          autoCloseOnSelect={false}
        />
      </CardContent>
    </Card>
  );
};