"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeposit } from "../hooks/useDeposit";
import { TokenSelectModal } from "./TokenSelectModal";

export const BridgeL1Card = ({ isActive }: { isActive: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    connected,
    adaAmount,
    setAdaAmount,
    selectedUnits,
    setSelectedUnits,
    tokenAmounts,
    setTokenAmounts,
    adaBalance,
    availableTokens,
    selectedTokens,
    isLoading,
    handleMaxAda,
    handleMaxToken,
    deposit
  } = useDeposit();

  // compute whether user entered any positive amount
  const hasAmount = (Number(adaAmount) > 0) || Object.values(tokenAmounts).some(v => Number(v) > 0);

  return (
    <Card className={`glass-panel transition-all duration-300 ${isActive ? "border-primary/50 glow-cyan ring-1 ring-primary/50 scale-100" : "opacity-50 scale-[0.98] grayscale-[0.5]"}`}>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
           <ShieldAlert className="w-5 h-5 text-blue-400" />
           Cardano Mainnet (L1)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        
        {/* Balance Summary - Rút gọn cho sạch */}
        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">L1 ADA Balance:</span>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="font-mono font-bold text-lg">{adaBalance} ₳</span>}
        </div>

        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-visible">
              
              {/* Input ADA */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <label>ADA Amount *</label>
                  <button className="text-xs text-primary hover:underline" onClick={handleMaxAda}>MAX</button>
                </div>
                <div className="relative">
                  <Input type="number" placeholder="0.00" value={adaAmount} onChange={(e) => setAdaAmount(e.target.value)} disabled={!connected} max={adaBalance.replace(/,/g,"")} className="pr-16 font-mono bg-background/50 h-12 text-lg text-right overflow-x-auto whitespace-nowrap" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">ADA</span>
                </div>
              </div>

              {/* Thêm Tokens - Modal UI đều cho phép nhiều */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Additional Tokens (Optional)</label>
                {/* list of selected tokens with amount inputs */}
                {selectedTokens.map((tok) => (
                  <div key={tok.unit} className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 px-2 h-12 glass-panel border-primary/30 rounded-md min-w-[130px]">
                      {tok.logoUrl && (
                        <img src={`https://ipfs.io/ipfs/${tok.logoUrl}`} className="w-6 h-6 rounded-full" alt="" />
                      )}
                      <span className="font-bold text-primary">{tok.ticker}</span>
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
                         className="h-12 font-mono bg-background/50 pr-16 text-right overflow-x-auto whitespace-nowrap"
                       />
                       <button
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary"
                         onClick={() => handleMaxToken(tok.unit)}
                       >
                         MAX
                       </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setSelectedUnits(prev => prev.filter(u => u !== tok.unit));
                        setTokenAmounts(prev => {
                          const { [tok.unit]:_, ...rest } = prev;
                          return rest;
                        });
                      }}
                    >
                       <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 group"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!connected || availableTokens.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {availableTokens.length === 0 ? "No tokens in wallet" : "Add Token to Bridge"}
                </Button>
              </div>

              <Button className="w-full font-bold text-lg h-14" size="lg" onClick={deposit} disabled={!connected || !hasAmount}>
                Commit Assets to L2
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
          balanceKey="balanceL1"
          autoCloseOnSelect={false}
        />
      </CardContent>
    </Card>
  );
};