import { Token } from '@/features/create/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Globe, Twitter, Send } from 'lucide-react'; // Import icon Telegram là Send hoặc dùng thư viện khác

interface TokenHeaderProps {
  token: Token;
}

export function TokenHeader({ token }: TokenHeaderProps) {
  // Logic check Head
  const isOnHead = !!token.headPort && token.head?.status === 'Open';

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Background Gradient nhẹ */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col md:flex-row gap-6 items-start">
        {/* Logo */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 bg-black/40 shrink-0">
          {token.logoUrl ? (
             <Image 
                src={`https://ipfs.io/ipfs/${token.logoUrl}`}
                alt={token.tokenName} 
                width={96} 
                height={96} 
                className="w-full h-full object-cover"
             />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
               {token.ticker[0]}
             </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{token.tokenName}</h1>
            <Badge variant="outline" className="text-primary border-primary/50 text-base px-3 py-0.5">
              {token.ticker}
            </Badge>
            {isOnHead && (
               <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                 ⚡ Hydra Head #{token.headPort}
               </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span className="font-mono text-xs bg-muted px-2 py-1 rounded select-all cursor-pointer hover:bg-muted/80" title="Click to copy">
               Policy: {token.policyId.slice(0, 12)}...{token.policyId.slice(-6)}
             </span>
             <span>•</span>
             <span>Supply: {Number(token.totalSupply).toLocaleString()}</span>
          </div>

          {/* Description */}
          {token.description && (
             <p className="text-muted-foreground max-w-2xl text-pretty">
               {token.description}
             </p>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {token.socialLinks?.website && (
              <a href={token.socialLinks.website} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
            {token.socialLinks?.twitter && (
              <a href={token.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {token.socialLinks?.telegram && (
              <a href={token.socialLinks.telegram} target="_blank" rel="noreferrer" className="p-2 bg-muted/50 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <Send className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}