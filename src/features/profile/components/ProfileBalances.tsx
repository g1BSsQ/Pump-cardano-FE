'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TokenHolding, TokenInfo } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BondingCurveBar } from '@/features/dashboard/components/BondingCurveBar';

interface Props {
  isOwnProfile: boolean;
  lovelace: number | undefined;
  tokenHoldings: TokenHolding[];
  tokensInfo: Record<string, TokenInfo>;
  loadingTokens: boolean;
}

const formatTokenAmount = (amount: string, decimals: number = 0) => {
  const num = Number(amount) / Math.pow(10, decimals);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(decimals > 0 ? 2 : 0);
};

const formatADA = (lovelaceAmount: number | undefined) => {
  if (!lovelaceAmount) return '0.00';
  return (lovelaceAmount / 1_000_000).toFixed(2);
};

export const ProfileBalances = ({ isOwnProfile, lovelace, tokenHoldings, tokensInfo, loadingTokens }: Props) => {
  const router = useRouter();

  const totalValue = tokenHoldings.reduce((acc, holding) => {
    const tokenInfo = tokensInfo[holding.assetId];
    if (!tokenInfo) return acc;
    const value = (Number(holding.amount) / Math.pow(10, tokenInfo.decimals)) * Number(tokenInfo.currentPrice);
    return acc + value;
  }, 0);

  // Mock total P&L for now
  const totalPnl = 45.8;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Total Value</span>
            <p className="text-4xl font-mono font-bold gradient-text">≈ {totalValue.toFixed(2)} ADA</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Total P&L</span>
            <p className={`text-2xl font-mono font-bold flex items-center justify-end gap-2 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {totalPnl >= 0 ? '+' : ''}{totalPnl}%
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Balances</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* ADA Balance */}
            {isOwnProfile && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">₳</span>
                  </div>
                  <div>
                    <p className="font-semibold">Cardano</p>
                    <p className="text-xs text-muted-foreground">ADA</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{formatADA(lovelace)} ADA</p>
                  <p className="text-xs text-muted-foreground">From Wallet</p>
                </div>
              </div>
            )}

            {/* Token Holdings */}
            {loadingTokens ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : tokenHoldings.length > 0 ? (
              tokenHoldings.map((holding) => {
                const tokenInfo = tokensInfo[holding.assetId];
                if (!tokenInfo) return null;

                const amount = formatTokenAmount(holding.amount, tokenInfo.decimals);
                const value = (Number(holding.amount) / Math.pow(10, tokenInfo.decimals)) * Number(tokenInfo.currentPrice);
                // Mock P&L and bonding progress
                const pnl = Math.random() * 200 - 100;
                const bondingProgress = Math.random() * 100;

                return (
                  <div
                    key={holding.assetId}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/token/${holding.assetId}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                        {tokenInfo.logoUrl ? (
                          <Image src={tokenInfo.logoUrl} alt={tokenInfo.tokenName} width={48} height={48} className="object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            {tokenInfo.ticker?.slice(0, 2).toUpperCase() || '??'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{tokenInfo.tokenName}</h3>
                          <span className="text-sm font-mono text-muted-foreground">${tokenInfo.ticker}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{amount} tokens</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">≈ {value.toFixed(2)} ADA</p>
                        <p className={`text-sm font-mono ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Bonding Curve</span>
                        <span className="font-mono text-primary">{bondingProgress.toFixed(0)}%</span>
                      </div>
                      <BondingCurveBar progress={bondingProgress} size="sm" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No token holdings found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
