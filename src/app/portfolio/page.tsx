"use client";

import Image from "next/image";
import { Wallet, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BondingCurveBar } from "@/components/dashboard/BondingCurveBar";

const mockHoldings = [
  {
    id: "1",
    name: "SNEK",
    ticker: "SNEK",
    image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=200&h=200&fit=crop",
    balance: "2,500,000",
    value: "₳625",
    pnl: 156.7,
    bondingProgress: 94,
  },
  {
    id: "2",
    name: "HOSKY",
    ticker: "HOSKY",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    balance: "10,000,000",
    value: "₳250",
    pnl: -12.3,
    bondingProgress: 78,
  },
  {
    id: "3",
    name: "MOON",
    ticker: "MOON",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop",
    balance: "500,000",
    value: "₳45",
    pnl: 89.2,
    bondingProgress: 92,
  },
];

const Portfolio = () => {
  const totalValue = "₳920";
  const totalPnl = 45.8;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2">Your Portfolio</h1>
        <p className="text-muted-foreground">Track your meme coin holdings and performance.</p>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Total Value</span>
            <p className="text-4xl font-mono font-bold gradient-text">{totalValue}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Total P&L</span>
            <p className={`text-2xl font-mono font-bold flex items-center justify-end gap-2 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {totalPnl >= 0 ? '+' : ''}{totalPnl}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Holdings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="font-semibold">Holdings</h2>

        {mockHoldings.length > 0 ? (
          <div className="space-y-3">
            {mockHoldings.map((holding, index) => (
              <motion.div
                key={holding.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-panel p-4 card-hover"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={holding.image}
                    alt={holding.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{holding.name}</h3>
                      <span className="text-sm font-mono text-muted-foreground">${holding.ticker}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{holding.balance} tokens</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{holding.value}</p>
                    <p className={`text-sm font-mono ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {holding.pnl >= 0 ? '+' : ''}{holding.pnl}%
                    </p>
                  </div>
                  <Link href={`/token/${holding.id}`}>
                    <Button variant="glass" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Bonding Curve</span>
                    <span className="font-mono text-primary">{holding.bondingProgress}%</span>
                  </div>
                  <BondingCurveBar progress={holding.bondingProgress} size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No holdings yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect your wallet and start trading meme coins!
            </p>
            <Button variant="neon">Connect Wallet</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Portfolio;