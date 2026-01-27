import Image from "next/image";
import { TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BondingCurveBar } from "./BondingCurveBar";

interface TokenCardProps {
  token: {
    id: string;
    name: string;
    ticker: string;
    image: string;
    marketCap: string;
    change24h: number;
    bondingProgress: number;
    holders: number;
  };
  index: number;
}

export const TokenCard = ({ token, index }: TokenCardProps) => {
  return (
    <Link href={`/token/${token.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="glass-panel p-4 card-hover group cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0 group-hover:glow-cyan transition-all duration-300">
            <Image
              src={token.image}
              alt={token.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {token.name}
            </h3>
            <span className="text-sm font-mono text-muted-foreground">
              ${token.ticker}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-mono ${token.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
            <TrendingUp className={`w-3 h-3 ${token.change24h < 0 ? 'rotate-180' : ''}`} />
            {token.change24h >= 0 ? '+' : ''}{token.change24h}%
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Market Cap</span>
            <p className="font-mono font-semibold text-sm">{token.marketCap}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" /> Holders
            </span>
            {/* FIX LỖI HYDRATION: Thêm 'en-US' để đồng nhất định dạng số giữa Server và Client */}
            <p className="font-mono font-semibold text-sm">{token.holders.toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Bonding Curve */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Bonding Curve</span>
            <span className="text-xs font-mono text-primary">{token.bondingProgress}%</span>
          </div>
          <BondingCurveBar progress={token.bondingProgress} size="sm" />
        </div>
      </motion.div>
    </Link>
  );
};