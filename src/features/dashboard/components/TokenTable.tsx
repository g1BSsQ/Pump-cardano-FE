'use client';

import { Token } from '@/features/create/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDateTime, parseServerDate } from '@/utils/date';

interface TokenTableProps {
  tokens: Token[];
}

export function TokenTable({ tokens }: TokenTableProps) {
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n) || n === 0) return '-';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  const formatADA = (num: string | number) => {
    const formatted = formatNumber(num);
    return formatted === '-' ? '-' : `₳${formatted}`;
  };

  const formatPrice = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n) || n === 0) return '-';
    
    // Nếu giá rất nhỏ, hiển thị nhiều số thập phân hơn
    if (n < 0.000001) return `₳${n.toExponential(2)}`;
    if (n < 0.01) return `₳${n.toFixed(6)}`;
    return `₳${n.toFixed(4)}`;
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-3 font-semibold">#</th>
              <th className="text-left p-3 font-semibold">Token</th>
              <th className="text-right p-3 font-semibold">MCAP</th>
              <th className="text-right p-3 font-semibold">Price</th>
              <th className="text-right p-3 font-semibold">24H VOL</th>
              <th className="text-right p-3 font-semibold">24H</th>
              <th className="text-right p-3 font-semibold">Age</th>
              <th className="text-center p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => {
              const isOnHead = !!token.headPort && token.head?.status === 'Open';
              const priceChange = token.priceChange24h || 0;
              const isPositive = priceChange >= 0;
              const hasActivity = parseFloat(token.volume24h || '0') > 0;

              return (
                <tr 
                  key={token.assetId}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  {/* Index */}
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground font-medium">
                      {idx + 1}
                    </span>
                  </td>

                  {/* Token Info */}
                  <td className="p-3">
                    <Link 
                      href={`/token/${token.assetId}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border bg-muted shrink-0 group-hover:border-primary/50 transition-colors">
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
                      <div className="min-w-0">
                        <div className="font-bold truncate group-hover:text-primary transition-colors flex items-center gap-2">
                          {token.tokenName}
                          {hasActivity && (
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ${token.ticker}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Market Cap */}
                  <td className="p-3 text-right font-mono text-sm font-medium">
                    {formatADA(token.marketCap || 0)}
                  </td>

                  {/* Current Price */}
                  <td className="p-3 text-right font-mono text-sm">
                    {formatPrice(token.currentPrice || 0)}
                  </td>

                  {/* 24h Volume */}
                  <td className="p-3 text-right font-mono text-sm">
                    {formatADA(token.volume24h || 0)}
                  </td>

                  {/* 24h Change */}
                  <td className="p-3 text-right">
                    {priceChange === 0 ? (
                      <span className="text-sm text-muted-foreground">-</span>
                    ) : (
                      <div className={`flex items-center justify-end gap-1 font-bold text-sm ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                    )}
                  </td>

                  {/* Age */}
                  <td className="p-3 text-right text-xs text-muted-foreground" title={formatDateTime(parseServerDate(token.createdAt))}>
                    {formatDistanceToNow(parseServerDate(token.createdAt), { addSuffix: true })}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    {isOnHead ? (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 font-semibold"
                      >
                        ⚡ L2
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground font-medium">
                        L1
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact List */}
      <div className="md:hidden divide-y">
        {tokens.map((token, idx) => {
          const isOnHead = !!token.headPort && token.head?.status === 'Open';
          const priceChange = token.priceChange24h || 0;
          const isPositive = priceChange >= 0;

          return (
            <Link 
              key={token.assetId}
              href={`/token/${token.assetId}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-medium w-6">
                {idx + 1}
              </span>
              
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border bg-muted shrink-0">
                {token.logoUrl ? (
                  <Image 
                    src={`https://ipfs.io/ipfs/${token.logoUrl}`}
                    alt={token.tokenName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    {token.ticker?.slice(0, 2) || '?'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold truncate">{token.tokenName}</div>
                  {isOnHead && (
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                    >
                      ⚡
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">${token.ticker}</span>
                  {priceChange !== 0 && (
                    <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
