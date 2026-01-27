"use client";

import { Crown, TrendingUp, Flame, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BondingCurveBar } from "./BondingCurveBar";
import { useEffect, useState } from "react";

interface KingOfHillCardProps {
  token: {
    id: string;
    name: string;
    ticker: string;
    image: string;
    marketCap: string;
    change24h: number;
    bondingProgress: number;
    holders: number;
    volume24h: string;
  };
}

interface Particle {
  id: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
}

export const KingOfHillCard = ({ token }: KingOfHillCardProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Tạo dữ liệu ngẫu nhiên 1 lần duy nhất sau khi mount
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    }));

    // Bọc trong setTimeout để tránh cảnh báo "setState synchronously"
    const timer = setTimeout(() => {
      setParticles(newParticles);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Link href={`/token/${token.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative glass-panel border-glow p-6 pulse-glow overflow-hidden group"
      >
        {/* Render Particles */}
        {particles.length > 0 && (
          <div className="particles">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-primary/50 rounded-full"
                initial={{ 
                  x: particle.x, 
                  y: particle.y,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, "-20px"],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* Crown Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30">
          <Crown className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-warning">King of the Hill</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative z-10">
          {/* Token Image */}
          <div className="relative">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden glow-cyan">
              <img 
                src={token.image} 
                alt={token.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-success flex items-center justify-center animate-bounce">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* Token Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl lg:text-3xl font-bold">{token.name}</h2>
                <span className="text-xl font-mono text-primary">${token.ticker}</span>
              </div>
              <p className="text-muted-foreground text-sm">The legendary meme that conquered Cardano.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap</span>
                <p className="text-xl font-mono font-bold gradient-text">{token.marketCap}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">24h Change</span>
                <p className={`text-xl font-mono font-bold flex items-center gap-1 ${token.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  <TrendingUp className={`w-4 h-4 ${token.change24h < 0 ? 'rotate-180' : ''}`} />
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Holders</span>
                {/* FIX: Thêm 'en-US' để đồng nhất format số giữa server/client */}
                <p className="text-xl font-mono font-bold">{token.holders.toLocaleString('en-US')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">24h Volume</span>
                <p className="text-xl font-mono font-bold">{token.volume24h}</p>
              </div>
            </div>

            {/* Bonding Curve */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Bonding Curve Progress</span>
                <span className="text-sm font-mono text-primary">{token.bondingProgress}%</span>
              </div>
              <BondingCurveBar progress={token.bondingProgress} showGraduation />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ExternalLink className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};