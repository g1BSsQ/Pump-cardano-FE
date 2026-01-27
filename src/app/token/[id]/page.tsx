"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TokenHeader } from "@/components/token/TokenHeader";
import { BondingCurveVisual } from "@/components/token/BondingCurveVisual";
import { SwapPanel } from "@/components/token/SwapPanel";
import { TradesFeed } from "@/components/token/TradesFeed";
import { TradingViewChart } from "@/components/token/TradingViewChart";

const mockTokenData = {
  id: "1",
  name: "SNEK",
  ticker: "SNEK",
  description: "The ultimate meme coin on Cardano. Join the snake revolution!",
  image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=400&h=400&fit=crop",
  creator: "0x1234...5678",
  createdAt: "2024-01-15",
  marketCap: "₳2,450,000",
  price: "₳0.00049",
  change24h: 15.7,
  volume24h: "₳125,000",
  holders: "1,247",
  bondingProgress: 94,
  
  // FIX: Convert to string to match BondingCurveVisual interface
  raised: "₳94,000", 
  target: "₳100,000",

  contractAddress: "addr1qxqs59lphg8g6qndelq8xwqn60ag3aeyfcp33c2kdp46a429mgm8tq9rjmf7z9d0v8n8ddc7v7gwq6y5dss3ts2k8sqq6s9xh",
  socialLinks: {
    twitter: "https://twitter.com/snekcoin",
    telegram: "https://t.me/snekcoin",
    discord: "https://discord.gg/snekcoin",
  },
};

const TokenDetail = () => {
  const _params = useParams();
  // const tokenId = params.id as string; // Not used currently

  // In a real app, fetch token data based on tokenId
  const token = mockTokenData;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>

      {/* Token Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TokenHeader token={token} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <TradingViewChart />
          </motion.div>

          {/* Bonding Curve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <h3 className="font-semibold mb-4">Bonding Curve</h3>
            <BondingCurveVisual 
              progress={token.bondingProgress} 
              raised={token.raised}
              target={token.target}
            />
          </motion.div>

          {/* Trades Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h3 className="font-semibold mb-4">Recent Trades</h3>
            <TradesFeed />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Swap Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SwapPanel token={token} />
          </motion.div>

          {/* Token Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel p-6"
          >
            <h3 className="font-semibold mb-4">Token Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Cap</span>
                <span className="font-mono">{token.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24h Volume</span>
                <span className="font-mono">{token.volume24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holders</span>
                <span className="font-mono">{token.holders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-sm">{token.createdAt}</span>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-panel p-6"
          >
            <h3 className="font-semibold mb-4">Community</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={token.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={token.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Telegram
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-2"
          >
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              Favorite
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail;