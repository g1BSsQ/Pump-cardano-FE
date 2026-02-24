'use client';

import { Search, Wallet, ChevronDown, Sparkles, Power, X, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { WalletModal } from "@/components/common/WalletModal";
import { useWallet, useAddress } from "@meshsdk/react";
import axios from "axios";
import { Token } from "@/features/create/types";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UserProfile {
  walletAddress: string;
  username: string;
  bio: string;
  avatar?: string;
  createdAt: string;
}

interface SearchResult {
  type: 'token' | 'user';
  data: Token | UserProfile;
}

export const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { connected, disconnect } = useWallet();
  const address = useAddress();

  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";
    return `${fullAddress.slice(0, 8)}...${fullAddress.slice(-6)}`;
  };

  // Search tokens and users
  useEffect(() => {
    const searchAll = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        // Search tokens and users in parallel
        const [tokensRes, usersRes] = await Promise.all([
          axios.get<{ data: Token[] }>(`${API_URL}/tokens`, {
            params: {
              search: searchQuery,
              limit: 5
            }
          }),
          axios.get<UserProfile[]>(`${API_URL}/users/search`, {
            params: {
              q: searchQuery,
              limit: 5
            }
          })
        ]);

        const results: SearchResult[] = [
          ...tokensRes.data.data.map(token => ({ type: 'token' as const, data: token })),
          ...usersRes.data.map(user => ({ type: 'user' as const, data: user }))
        ];

        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchAll, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          const result = searchResults[highlightedIndex];
          if (result.type === 'token') {
            window.location.href = `/token/${(result.data as Token).assetId}`;
          } else {
            window.location.href = `/profile/${(result.data as UserProfile).walletAddress}`;
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <header className="h-16 glass-panel border-b border-border/50 flex items-center justify-between px-6 sticky top-0 !overflow-visible" style={{ zIndex: 100 }}>
      {/* Left - Logo (visible on mobile) */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-cyan">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold gradient-text">PUMP.CARDANO</span>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block relative" ref={dropdownRef}>
        <div className={cn(
          "relative transition-all duration-300",
          searchFocused && "scale-[1.02]"
        )}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search username or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              if (searchQuery) setShowDropdown(true);
            }}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full h-10 pl-11 pr-10 rounded-lg bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all duration-200 relative z-10",
              searchFocused && "glow-cyan border-primary/50"
            )}
          />
          {searchQuery ? (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 z-20">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground">K</kbd>
            </div>
          )}
        </div>

        {/* Search Dropdown - Portal style with fixed positioning */}
        {showDropdown && searchQuery && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto"
            style={{ zIndex: 99999 }}
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result, index) => {
                  const isHighlighted = index === highlightedIndex;

                  if (result.type === 'token') {
                    const token = result.data as Token;
                    const isOnHead = !!token.headPort && token.head?.status === 'Open';

                    return (
                      <Link
                        key={`token-${token.assetId}`}
                        href={`/token/${token.assetId}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                          isHighlighted && "bg-muted/50"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        {/* Token Logo */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-muted shrink-0">
                          {token.logoUrl ? (
                            <Image
                              src={`https://ipfs.io/ipfs/${token.logoUrl}`}
                              alt={token.tokenName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {token.ticker?.slice(0, 2) || '?'}
                            </div>
                          )}
                        </div>

                        {/* Token Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate flex items-center gap-2">
                            {token.tokenName}
                            {isOnHead && (
                              <span className="text-xs text-green-500">⚡</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ${token.ticker}
                          </div>
                        </div>

                        {/* Price Info */}
                        {token.currentPrice && parseFloat(token.currentPrice) > 0 && (
                          <div className="text-right">
                            <div className="text-sm font-mono">
                              ₳{parseFloat(token.currentPrice).toFixed(4)}
                            </div>
                            {token.priceChange24h !== undefined && token.priceChange24h !== 0 && (
                              <div className={cn(
                                "text-xs font-semibold",
                                token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                              )}>
                                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  } else {
                    // User result
                    const user = result.data as UserProfile;

                    return (
                      <Link
                        key={`user-${user.walletAddress}`}
                        href={`/profile/${user.walletAddress}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                          isHighlighted && "bg-muted/50"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        {/* User Avatar */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.username}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              {user.username.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate flex items-center gap-2">
                            {user.username}
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {user.walletAddress.slice(0, 12)}...{user.walletAddress.slice(-8)}
                          </div>
                        </div>
                      </Link>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-muted-foreground mb-2">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No results found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try searching with a different name, ticker, or address
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right - Wallet Connection */}
      <div className="flex items-center gap-3">
        {connected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="gap-2"
              >
                <Wallet className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline font-mono">
                  {getShortAddress(address || "")}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${address}`} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://preprod.cardanoscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Wallet
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={disconnect}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Power className="w-4 h-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="wallet"
            size="default"
            className="gap-2"
            onClick={() => setWalletModalOpen(true)}
          >
            <Wallet className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </header>
  );
};


