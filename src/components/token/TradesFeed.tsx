import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  type: "buy" | "sell";
  amount: string;
  value: string;
  address: string;
  time: string;
}

const mockTrades: Trade[] = [
  { id: "1", type: "buy", amount: "2.5M", value: "₳125", address: "addr1...x7k2", time: "2s ago" },
  { id: "2", type: "sell", amount: "500K", value: "₳25", address: "addr1...m4p9", time: "15s ago" },
  { id: "3", type: "buy", amount: "10M", value: "₳500", address: "addr1...q8n1", time: "32s ago" },
  { id: "4", type: "buy", amount: "1M", value: "₳50", address: "addr1...j3w5", time: "1m ago" },
  { id: "5", type: "sell", amount: "3M", value: "₳150", address: "addr1...h2k8", time: "2m ago" },
  { id: "6", type: "buy", amount: "750K", value: "₳37.5", address: "addr1...p9r3", time: "3m ago" },
];

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
}

const mockComments: Comment[] = [
  { id: "1", author: "DegenWhale", avatar: "🐋", content: "This is going to moon! Just aped in 1000 ADA 🚀", time: "5m ago", likes: 24 },
  { id: "2", author: "CardanoMaxi", avatar: "💎", content: "Best meme on Cardano rn, dev is based", time: "12m ago", likes: 18 },
  { id: "3", author: "NFT_Hunter", avatar: "🎨", content: "Chart looking bullish af", time: "25m ago", likes: 9 },
];

export const TradesFeed = () => {
  const [activeTab, setActiveTab] = useState<"trades" | "comments">("trades");
  const [trades, setTrades] = useState(mockTrades);

  // Simulate new trades coming in
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade: Trade = {
        id: Date.now().toString(),
        type: Math.random() > 0.4 ? "buy" : "sell",
        amount: `${(Math.random() * 5 + 0.1).toFixed(1)}M`,
        value: `₳${Math.floor(Math.random() * 500 + 10)}`,
        address: `addr1...${Math.random().toString(36).substring(2, 6)}`,
        time: "just now",
      };
      setTrades((prev) => [newTrade, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("trades")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === "trades" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Latest Trades
          {activeTab === "trades" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-1.5",
            activeTab === "comments" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Thread
          {activeTab === "comments" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "trades" ? (
            <motion.div
              key="trades"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-border/30"
            >
              <AnimatePresence>
                {trades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={index === 0 ? { opacity: 0, x: -20, backgroundColor: "hsl(var(--primary) / 0.1)" } : false}
                    animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      trade.type === "buy" ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {trade.type === "buy" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          trade.type === "buy" ? "text-success" : "text-destructive"
                        )}>
                          {trade.type === "buy" ? "Bought" : "Sold"}
                        </span>
                        <span className="font-mono text-sm">{trade.amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{trade.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">{trade.value}</p>
                      <p className="text-[10px] text-muted-foreground">{trade.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-3"
            >
              {mockComments.map((comment) => (
                <div key={comment.id} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{comment.avatar}</span>
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="hover:text-foreground transition-colors">❤️ {comment.likes}</button>
                    <button className="hover:text-foreground transition-colors">Reply</button>
                  </div>
                </div>
              ))}
              
              {/* Comment Input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:border-primary/50"
                  />
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
