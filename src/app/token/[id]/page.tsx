'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { useTokenDetail } from '@/features/token/hooks/useTokenDetail';
import { TokenHeader } from '@/features/token/components/TokenHeader';
import { TokenStatsBar } from '@/features/token/components/TokenStatsBar'; // <-- Thêm dòng này
import { SwapPanel } from '@/features/token/components/SwapPanel';
import { TradesFeed } from '@/features/token/components/TradesFeed';
import { BondingCurveVisual } from '@/features/token/components/BondingCurveVisual';
import { CustomChart } from '@/features/token/components/CustomChart'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@meshsdk/react';
import { formatDate } from '@/utils/date';

export default function TokenDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const { connected, wallet } = useWallet();

  const { token, loading, error } = useTokenDetail(assetId);
  const [userWalletAddress, setUserWalletAddress] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then(setUserWalletAddress).catch(() => setUserWalletAddress(undefined));
    } else {
      setUserWalletAddress(undefined);
    }
  }, [connected, wallet]);

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

  if (error || !token) {
    return (
      <div className="container mx-auto p-20 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Token</h2>
        <p className="text-muted-foreground">{error || 'Token not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 pt-6">
      
      <TokenHeader token={token} />

      {/* --- GỌI COMPONENT MỚI Ở ĐÂY --- */}
      <TokenStatsBar token={token} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomChart />
          <BondingCurveVisual token={token} />
          <TradesFeed assetId={token.assetId} userWalletAddress={userWalletAddress} /> 
        </div>

        <div className="space-y-6">
          <SwapPanel token={token} />
          
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
                       {formatDate(token.createdAt)}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}