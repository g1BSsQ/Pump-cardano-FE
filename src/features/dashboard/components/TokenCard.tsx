import { Token } from '@/features/create/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const isOnHead = !!token.pool?.headPort;

  return (
    <Link href={`/token/${token.assetId}`}>
      <Card className="hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden group">
        {isOnHead && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 backdrop-blur-sm">
              ⚡ Head #{token.pool?.headPort}
            </Badge>
          </div>
        )}

        <CardHeader className="p-4">
          <div className="flex items-center gap-4">
            {/* Logo Token: Xử lý an toàn khi không có ảnh */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border bg-muted shrink-0">
               {token.logoUrl ? (
                  <Image 
                    src={`https://ipfs.io/ipfs/${token.logoUrl}`} 
                    alt={token.tokenName} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium">
                    {token.ticker?.slice(0, 2) || '?'}
                  </div>
               )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate group-hover:text-primary transition-colors">{token.tokenName}</h3>
              <p className="text-sm text-muted-foreground truncate font-mono">${token.ticker}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4 text-pretty">
            {token.description || 'No description provided.'}
          </p>
          
          {/* Thông tin Supply */}
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
             <span>Supply</span>
             <span className="font-mono text-foreground font-medium">
                {Number(token.totalSupply).toLocaleString()}
             </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}