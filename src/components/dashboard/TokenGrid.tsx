"use client";

import { TokenCard } from "./TokenCard";
import { motion } from "framer-motion";
import { useState } from "react";
import { Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- 1. Định nghĩa Type cho Token để dùng chung ---
interface Token {
  id: string;
  name: string;
  ticker: string;
  image: string;
  marketCap: string;
  change24h: number;
  bondingProgress: number;
  holders: number;
}

// Mock data
const mockTokens: Token[] = [
  {
    id: "1",
    name: "HOSKY Token",
    ticker: "HOSKY",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    marketCap: "₳125.5K",
    change24h: 42.5,
    bondingProgress: 78,
    holders: 2847,
  },
  {
    id: "2",
    name: "Cardano Apes",
    ticker: "CAPES",
    image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop",
    marketCap: "₳89.2K",
    change24h: -5.3,
    bondingProgress: 45,
    holders: 1523,
  },
  {
    id: "3",
    name: "Moon Rocket",
    ticker: "MOON",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop",
    marketCap: "₳67.8K",
    change24h: 128.7,
    bondingProgress: 92,
    holders: 3891,
  },
  {
    id: "4",
    name: "DeFi Frog",
    ticker: "FROG",
    image: "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=200&h=200&fit=crop",
    marketCap: "₳54.3K",
    change24h: 15.2,
    bondingProgress: 33,
    holders: 892,
  },
  {
    id: "5",
    name: "Crypto Cat",
    ticker: "CCAT",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop",
    marketCap: "₳43.1K",
    change24h: -12.8,
    bondingProgress: 67,
    holders: 1245,
  },
  {
    id: "6",
    name: "Ada Whale",
    ticker: "WHALE",
    image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=200&h=200&fit=crop",
    marketCap: "₳38.9K",
    change24h: 8.4,
    bondingProgress: 21,
    holders: 567,
  },
  {
    id: "7",
    name: "Pixel Punk",
    ticker: "PUNK",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=200&h=200&fit=crop",
    marketCap: "₳31.2K",
    change24h: 67.9,
    bondingProgress: 55,
    holders: 1089,
  },
  {
    id: "8",
    name: "Degen Diamond",
    ticker: "DGEN",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop",
    marketCap: "₳28.7K",
    change24h: -3.1,
    bondingProgress: 88,
    holders: 2134,
  },
  {
    id: "9",
    name: "Cardano Dragon",
    ticker: "DRAGON",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
    marketCap: "₳25.4K",
    change24h: 95.2,
    bondingProgress: 76,
    holders: 1756,
  },
  {
    id: "10",
    name: "Space Monkey",
    ticker: "MONKEY",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=200&fit=crop",
    marketCap: "₳22.8K",
    change24h: -8.7,
    bondingProgress: 43,
    holders: 934,
  },
  {
    id: "11",
    name: "Quantum Quokka",
    ticker: "QUOK",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    marketCap: "₳19.5K",
    change24h: 156.3,
    bondingProgress: 89,
    holders: 2876,
  },
  {
    id: "12",
    name: "Neon Ninja",
    ticker: "NINJA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    marketCap: "₳17.2K",
    change24h: 23.8,
    bondingProgress: 34,
    holders: 1456,
  },
  {
    id: "13",
    name: "Cyber Shark",
    ticker: "SHARK",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop",
    marketCap: "₳15.8K",
    change24h: -15.4,
    bondingProgress: 67,
    holders: 2034,
  },
  {
    id: "14",
    name: "Galactic Goat",
    ticker: "GOAT",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop",
    marketCap: "₳13.9K",
    change24h: 78.9,
    bondingProgress: 91,
    holders: 3456,
  },
  {
    id: "15",
    name: "Mystic Mushroom",
    ticker: "MYST",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
    marketCap: "₳12.3K",
    change24h: 45.6,
    bondingProgress: 52,
    holders: 1234,
  },
  {
    id: "16",
    name: "Electric Eagle",
    ticker: "EAGLE",
    image: "https://images.unsplash.com/photo-1452570053594-1a950e8338a1?w=200&h=200&fit=crop",
    marketCap: "₳11.7K",
    change24h: -22.1,
    bondingProgress: 28,
    holders: 876,
  },
];

// --- 2. Tách Component ListView ra ngoài ---
const ListView = ({ tokens }: { tokens: Token[] }) => (
  <div className="space-y-2">
    {tokens.map((token, index) => (
      <motion.div
        key={token.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-panel p-4 hover:card-hover transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden glow-cyan">
              <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{token.name}</h3>
                <span className="text-sm font-mono text-primary">${token.ticker}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{token.holders.toLocaleString('en-US')} holders</span>
                <span>{token.bondingProgress}% bonding</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold">{token.marketCap}</p>
            <p className={`text-sm font-mono ${token.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h}%
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// --- 3. Tách Component Pagination ra ngoài ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
  <div className="flex items-center justify-center gap-2 mt-6">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="w-4 h-4" />
    </Button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <Button
        key={page}
        variant={currentPage === page ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(page)}
        className="w-8 h-8 p-0"
      >
        {page}
      </Button>
    ))}

    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
);

// --- 4. Component chính ---
export const TokenGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'hot' | 'new' | 'graduating'>('hot');

  const itemsPerPage = viewMode === 'grid' ? 12 : 10;
  const totalPages = Math.ceil(mockTokens.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTokens = mockTokens.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl font-bold">Trending Tokens</h2>
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('hot')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'hot'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              Hot 🔥
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'new'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('graduating')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'graduating'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              Graduating
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentTokens.map((token, index) => (
            <TokenCard key={token.id} token={token} index={index} />
          ))}
        </div>
      ) : (
        <ListView tokens={currentTokens} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
};