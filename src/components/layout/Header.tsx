import { Search, Wallet, ChevronDown, Sparkles, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { WalletModal } from "@/components/common/WalletModal";
import { useWallet, useAddress } from "@meshsdk/react";

export const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { connected, disconnect } = useWallet();
  const address = useAddress();

  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";
    return `${fullAddress.slice(0, 8)}...${fullAddress.slice(-6)}`;
  };

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setWalletModalOpen(true);
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left - Logo (visible on mobile) */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-cyan">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold gradient-text">PUMP.CARDANO</span>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <div className={cn(
          "relative transition-all duration-300",
          searchFocused && "scale-[1.02]"
        )}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search token or address..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "w-full h-10 pl-11 pr-4 rounded-lg bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all duration-200",
              searchFocused && "glow-cyan border-primary/50"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground">K</kbd>
          </div>
        </div>
      </div>

      {/* Right - Wallet Connection */}
      <div className="flex items-center gap-3">
        <Button
          variant={connected ? "outline" : "wallet"}
          size="default"
          className="gap-2"
          onClick={handleWalletClick}
        >
          <Wallet className="w-4 h-4 text-primary" />
          {connected ? (
            <>
              <span className="hidden sm:inline font-mono">
                {getShortAddress(address || "")}
              </span>
              <Power className="w-3 h-3 text-destructive" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Connect Wallet</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </>
          )}
        </Button>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </header>
  );
};


