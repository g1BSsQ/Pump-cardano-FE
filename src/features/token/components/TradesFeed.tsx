import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, MessageSquare, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTrades, Trade } from "../hooks/useTrades";
import { useComments, Comment as CommentType } from "../hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { formatDateTime, parseServerDate } from "@/utils/date";

interface TradesFeedProps {
  assetId: string;
  userWalletAddress?: string; // Địa chỉ ví của user đang đăng nhập
}

export const TradesFeed = ({ assetId, userWalletAddress }: TradesFeedProps) => {
  const [activeTab, setActiveTab] = useState<"trades" | "comments">("trades");
  const [showAll, setShowAll] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const { trades, loading } = useTrades(assetId, 50);
  const { comments, loading: commentsLoading, postComment, likeComment } = useComments(assetId, 50);
  
  const [newTradeId, setNewTradeId] = useState<string | null>(null);
  const prevTradesRef = useRef<Trade[]>([]);

  // Detect new trades
  useEffect(() => {
    if (trades.length > 0 && prevTradesRef.current.length > 0) {
      // Check if first trade is new
      if (trades[0].id !== prevTradesRef.current[0]?.id) {
        setNewTradeId(trades[0].id);
        // Clear animation after it completes
        setTimeout(() => setNewTradeId(null), 1000);
      }
    }
    prevTradesRef.current = trades;
  }, [trades]);

  // Show only 10 trades by default
  const displayedTrades = showAll ? trades : trades.slice(0, 10);

  const formatNumber = (num: string) => {
    const n = parseFloat(num);
    if (isNaN(n)) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  const formatADA = (num: string) => {
    return `₳${formatNumber(num)}`;
  };

  const getShortAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || !userWalletAddress) return;
    
    setIsPosting(true);
    try {
      await postComment(userWalletAddress, commentInput.trim());
      setCommentInput('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="glass-panel flex flex-col">
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

      {/* Content - Auto height container */}
      <div className="overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === "trades" ? (
            <motion.div
              key="trades"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {loading && trades.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading trades...
                </div>
              ) : trades.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No trades yet
                </div>
              ) : (
                <>
                  {/* Trades list - always scrollable when showAll */}
                  <div className={cn(
                    "divide-y divide-border/30 flex-1",
                    showAll ? "overflow-y-auto" : "overflow-hidden"
                  )}>
                    {displayedTrades.map((trade) => {
                    const isNewTrade = trade.id === newTradeId;
                    
                    return (
                      <motion.div
                        key={trade.id}
                        initial={isNewTrade ? { opacity: 0, x: -20, backgroundColor: "hsl(var(--primary) / 0.1)" } : false}
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
                            <span className="font-mono text-sm">{formatNumber(trade.tokenAmount)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {getShortAddress(trade.traderAddress)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-medium">{formatADA(trade.adaAmount)}</p>
                          <p className="text-[10px] text-muted-foreground" title={formatDateTime(parseServerDate(trade.createdAt))}>
                            {formatDistanceToNow(parseServerDate(trade.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  </div>
                  
                  {/* View All / Show Less Button - Fixed at bottom */}
                  {trades.length > 10 && (
                    <div className="p-3 border-t border-border/30 flex-shrink-0">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className={cn(
                          "w-full py-2 text-sm font-medium transition-colors",
                          !showAll ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {!showAll ? `View All (${trades.length} trades)` : "Show Less"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {commentsLoading && comments.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{comment.user.avatar || '👤'}</span>
                      <span className="font-semibold text-sm">{comment.user.username}</span>
                      <span className="text-xs text-muted-foreground" title={formatDateTime(parseServerDate(comment.createdAt))}>
                        {formatDistanceToNow(parseServerDate(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        className="hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3" /> {comment.likes}
                      </button>
                    </div>
                  </div>
                ))
              )}
              
              {/* Comment Input */}
              <div className="pt-2">
                {userWalletAddress ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePostComment();
                        }
                      }}
                      disabled={isPosting}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
                    />
                    <button 
                      onClick={handlePostComment}
                      disabled={isPosting || !commentInput.trim()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPosting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4 bg-secondary/30 rounded-lg">
                    Connect your wallet to comment
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};



