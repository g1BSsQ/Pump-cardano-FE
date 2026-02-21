'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TokenHolding, TokenInfo } from '../types';

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

  return (
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
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : tokenHoldings.length > 0 ? (
            tokenHoldings.map((holding) => {
              const tokenInfo = tokensInfo[holding.assetId];
              if (!tokenInfo) return null;

              const amount = formatTokenAmount(holding.amount, tokenInfo.decimals);
              const value = (Number(holding.amount) / Math.pow(10, tokenInfo.decimals)) * Number(tokenInfo.currentPrice);

              return (
                <div
                  key={holding.assetId}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => router.push(`/token/${holding.assetId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      {tokenInfo.logoUrl ? (
                        <Image src={tokenInfo.logoUrl} alt={tokenInfo.tokenName} width={40} height={40} className="object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {tokenInfo.ticker?.slice(0, 2).toUpperCase() || '??'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{tokenInfo.tokenName}</p>
                      <p className="text-xs text-muted-foreground">{tokenInfo.ticker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">{amount} {tokenInfo.ticker}</p>
                    <p className="text-xs text-muted-foreground">≈ {value.toFixed(2)} ADA</p>
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
  );
};
