import { Token } from '@/features/create/types';
import { Progress } from '@/components/ui/progress';

interface Props {
  token: Token;
}

export function BondingCurveVisual({ token }: Props) {
  // Giả sử logic Pump.fun: Max Supply 1 Tỷ. 
  // Bonding Curve hoàn thành khi bán được khoảng 80% (tùy logic bạn set).
  // Ở đây hiển thị đơn giản là % Supply đang lưu hành.
  const MAX_SUPPLY = 1_000_000_000; 
  const currentSupply = Number(token.totalSupply);
  
  const percentage = Math.min((currentSupply / MAX_SUPPLY) * 100, 100);

  // Status text
  const isCompleted = percentage >= 80; // Ví dụ mốc 80% là tốt nghiệp

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Bonding Curve Progress</h3>
        <span className="text-primary font-mono font-bold">{percentage.toFixed(2)}%</span>
      </div>

      <Progress value={percentage} className="h-4 bg-secondary" />

      <p className="text-sm text-muted-foreground">
        {isCompleted 
          ? "🎉 Bonding curve completed! Trading is now live on Hydra." 
          : "When the bonding curve reaches 100%, liquidity will be deposited into Hydra Head."
        }
      </p>

      <div className="text-xs text-muted-foreground font-mono mt-2">
         {currentSupply.toLocaleString()} / {MAX_SUPPLY.toLocaleString()} {token.ticker}
      </div>
    </div>
  );
}