import React from 'react';
import { Token } from '@/features/create/types';

// --- Helper Format Currency ---
const formatCurrency = (val: string | number | undefined) => {
  if (!val) return '0';
  const num = Number(val);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// --- Component Format Giá (Subscript Zeros) ---
const FormattedPrice = ({ price }: { price: number }) => {
  if (!price) return <span>0</span>;
  const priceStr = price.toFixed(10).replace(/0+$/, ''); 
  const match = priceStr.match(/^0\.0+/);
  
  if (match) {
    const zeroCount = match[0].length - 2; 
    if (zeroCount >= 3) {
      const remaining = priceStr.slice(match[0].length);
      return (
        <span>
          0.0<sub className="text-[10px] mt-1">{zeroCount}</sub>{remaining}
        </span>
      );
    }
  }
  return <span>{priceStr}</span>;
}

export const TokenStatsBar = ({ token }: { token: Token }) => {
  // Lấy dữ liệu an toàn từ token.pool
  const price = Number(token.pool?.currentPrice) || 0;
  const marketCap = token.pool?.marketCap || '0';
  const volume24h = token.pool?.volume24h || '0';
  const priceChange24h = Number(token.pool?.priceChange24h) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
        <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-mono font-bold text-lg text-green-400 flex items-center gap-1">
                <FormattedPrice price={price} /> ADA
            </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-mono font-bold text-lg">
                {formatCurrency(marketCap)} ADA
            </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="font-mono font-bold text-lg">
                {formatCurrency(volume24h)} ADA
            </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground">24h Change</p>
            <p className={`font-mono font-bold text-lg ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange24h > 0 ? '+' : ''}
                {priceChange24h.toFixed(2)}%
            </p>
        </div>
    </div>
  );
};