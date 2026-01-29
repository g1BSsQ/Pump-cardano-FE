import { ExternalLink, Share2, Star, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface TokenHeaderProps {
  token: {
    name: string;
    ticker: string;
    image: string;
    price: string;
    change24h: number;
    marketCap: string;
    volume24h: string;
    contractAddress: string;
  };
}

export const TokenHeader = ({ token }: TokenHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Token Info */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden glow-cyan">
          <Image
            src={token.image}
            alt={token.name}
            width={256}
            height={256}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{token.name}</h1>
            <span className="text-lg font-mono text-primary">${token.ticker}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-muted-foreground">
              {token.contractAddress.slice(0, 12)}...{token.contractAddress.slice(-6)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Price & Stats */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{token.price}</p>
          <p className={`text-sm font-mono ${token.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
            {token.change24h >= 0 ? '+' : ''}{token.change24h}%
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-border">
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Market Cap</span>
            <p className="font-mono font-semibold">{token.marketCap}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">24h Volume</span>
            <p className="font-mono font-semibold">{token.volume24h}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="glass" size="icon">
          <Star className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="sm" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          Explorer
        </Button>
      </div>
    </motion.div>
  );
};

