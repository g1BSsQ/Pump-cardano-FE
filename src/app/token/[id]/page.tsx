'use client';

import { useParams } from 'next/navigation';
import { useTokenDetail } from '@/features/token/hooks/useTokenDetail';
import { TokenHeader } from '@/features/token/components/TokenHeader';
import { SwapPanel } from '@/features/token/components/SwapPanel';
import { TradesFeed } from '@/features/token/components/TradesFeed';
import { BondingCurveVisual } from '@/features/token/components/BondingCurveVisual';
import { CustomChart } from '@/features/token/components/CustomChart'; // Import Chart thật
import { Skeleton } from '@/components/ui/skeleton';

// --- Helper format số liệu ---
const formatADA = (val: string | number | undefined) => {
  if (!val) return '0';
  const num = Number(val);
  // Hiển thị tối đa 6 số lẻ cho giá nhỏ
  return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
};

const formatCurrency = (val: string | number | undefined) => {
  if (!val) return '0';
  const num = Number(val);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString();
};
// -----------------------------

export default function TokenDetailPage() {
  const params = useParams();
  const assetId = params.id as string;

  // Lấy dữ liệu thật từ Hook
  const { token, loading, error } = useTokenDetail(assetId);

  // 1. Loading State
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6 pt-20">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !token) {
    return (
      <div className="container mx-auto p-20 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Token</h2>
        <p className="text-muted-foreground">{error || 'Token not found'}</p>
      </div>
    );
  }

  // 3. Main Render
  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 pt-6">
      
      {/* Header hiển thị thông tin sản phẩm (Tên, Logo, Social) */}
      <TokenHeader token={token} />

      {/* --- THANH THÔNG TIN TÀI CHÍNH (PRICE, CAP, VOL) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
          <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-mono font-bold text-lg text-green-400">
                  {formatADA(token.currentPrice)} ADA
              </p>
          </div>
          <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-mono font-bold text-lg">
                  {formatCurrency(token.marketCap)} ADA
              </p>
          </div>
          <div>
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="font-mono font-bold text-lg">
                  {formatCurrency(token.volume24h)} ADA
              </p>
          </div>
          <div>
              <p className="text-xs text-muted-foreground">24h Change</p>
              <p className={`font-mono font-bold text-lg ${(token.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(token.priceChange24h || 0) > 0 ? '+' : ''}
                  {(token.priceChange24h || 0).toFixed(2)}%
              </p>
          </div>
      </div>
      {/* ---------------------------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Chart & Bonding Curve */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Nến thật (Lightweight Charts) */}
          <CustomChart />
          
          {/* Thanh tiến trình Bonding Curve */}
          <BondingCurveVisual token={token} />
          
          {/* Lịch sử giao dịch */}
          <TradesFeed /> 
        </div>

        {/* Cột phải: Swap Panel & Info */}
        <div className="space-y-6">
          
          {/* Swap Form */}
          <SwapPanel token={token} />
          
          {/* Thông tin Creator */}
          <div className="p-4 rounded-xl border bg-card/50 text-card-foreground shadow-sm">
             <h3 className="font-semibold mb-2 text-sm">Token Info</h3>
             <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                   <span>Creator</span>
                   <span className="font-mono text-primary cursor-pointer hover:underline" title={token.ownerAddress}>
                      {token.ownerAddress.slice(0, 10)}...{token.ownerAddress.slice(-4)}
                   </span>
                </div>
                <div className="flex justify-between">
                   <span>Asset ID</span>
                   <span className="font-mono break-all text-right ml-4" title={token.assetId}>
                       {token.assetId.slice(0, 10)}...{token.assetId.slice(-6)}
                   </span>
                </div>
                <div className="flex justify-between">
                   <span>Created</span>
                   <span className="font-mono">
                       {new Date(token.createdAt).toLocaleDateString()}
                   </span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}