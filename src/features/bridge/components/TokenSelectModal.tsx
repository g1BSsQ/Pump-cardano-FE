"use client";

import { useState, useMemo } from "react";
import { Search, X, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { BridgeAsset } from "../types";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: BridgeAsset[];
  onSelect: (token: BridgeAsset) => void;
  balanceKey: "balanceL1" | "balanceL2"; // Tùy chọn hiển thị số dư L1 hay L2
  autoCloseOnSelect?: boolean; // nếu false thì không đóng modal khi chọn token
}

export const TokenSelectModal = ({ isOpen, onClose, tokens, onSelect, balanceKey, autoCloseOnSelect }: TokenSelectModalProps) => {
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => 
      t.ticker.toLowerCase().includes(search.toLowerCase()) || 
      t.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tokens, search]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] glass-panel p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">Select a Token</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ticker..." 
              className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
             <Wallet className="w-3 h-3" />
             <span>Your assets on this network:</span>
          </div>

          <ScrollArea className="h-[350px] pr-4 -mr-4">
            <div className="space-y-1">
              {filteredTokens.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground italic">
                   No tokens found with balance.
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <button
                    key={token.unit}
                    onClick={() => {
                      onSelect(token);
                      if (autoCloseOnSelect !== false) {
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                        {token.logoUrl ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border/50">
                              <Image
                                src={
                                  token.logoUrl.startsWith("http")
                                    ? token.logoUrl
                                    : `https://ipfs.io/ipfs/${token.logoUrl}`
                                }
                                alt={token.ticker}
                                fill
                                className="object-cover"
                                onError={(e: any) => (e.target.src = "/fallback-token.png")}
                                sizes="40px"
                              />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary">
                            {token.ticker[0]}
                            </div>
                        )}
                        <div>
                            <div className="font-bold group-hover:text-primary transition-colors">{token.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{token.name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                       <div className="font-mono font-medium">{token[balanceKey as keyof BridgeAsset]}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};