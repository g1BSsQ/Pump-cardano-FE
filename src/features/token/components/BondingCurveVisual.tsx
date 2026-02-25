import { Token } from '@/features/create/types';
import { Progress } from '@/components/ui/progress';

interface Props {
  token: Token;
}

export function BondingCurveVisual({ token }: Props) {
  // 1. Cấu hình hằng số (Khớp với Smart Contract)
  const MAX_SUPPLY = 1_000_000_000; 
  
  // 2. LẤY DỮ LIỆU THỰC TẾ TỪ POOL (Thay vì token.totalSupply)
  const currentSupply = Number(token.pool?.currentSupply || 0);
  const decimals = token.decimals || 0;
  
  // 3. Tính toán tỷ lệ phần trăm
  const percentage = Math.min((currentSupply / MAX_SUPPLY) * 100, 100);

  // 4. Trạng thái tốt nghiệp (Nếu pool chuyển sang status GRADUATED)
  const isCompleted = token.pool?.status === 'GRADUATED' || percentage >= 100;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                Bonding Curve Progress
                {isCompleted && <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Completed</span>}
            </h3>
            <p className="text-xs text-muted-foreground">
                {isCompleted 
                  ? "Token has graduated to DEX liquidity!" 
                  : `Collect 100% to migrate liquidity to Hydra Head.`}
            </p>
        </div>
        <span className="text-primary font-mono font-bold text-xl">{percentage.toFixed(2)}%</span>
      </div>

      <div className="relative">
          <Progress value={percentage} className="h-4 bg-secondary shadow-inner" />
          {/* Mark mốc 80% nếu bạn muốn hiển thị điểm mồi */}
          {!isCompleted && (
              <div className="absolute top-0 left-[80%] w-0.5 h-4 bg-white/20" title="80% Milestone" />
          )}
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
         <span>Available: {(MAX_SUPPLY - currentSupply).toLocaleString()} {token.ticker}</span>
         <span>Sold: {currentSupply.toLocaleString()} / {MAX_SUPPLY.toLocaleString()}</span>
      </div>
    </div>
  );
}