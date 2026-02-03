'use client';

import { useTokens } from '@/features/dashboard/hooks/useTokens';
import { TokenCard } from './TokenCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function TokenGrid() {
  // --- SỬA LỖI 1: Bỏ 'params' nếu không dùng để hiển thị UI ---
  const { tokens, meta, loading, error, setSearch, setPage } = useTokens({ 
    limit: 12 
  });

  // --- SỬA LỖI 2: Đảm bảo hàm này được dùng ở dưới ---
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value); 
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search tokens by name or ticker..." 
          className="pl-9"
          onChange={handleSearch} // <--- GẮN HÀM handleSearch VÀO ĐÂY
        />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : tokens.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">No tokens found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tokens.map((token) => (
            <TokenCard key={token.assetId} token={token} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            size="sm"
            disabled={meta.page === 1}
            onClick={() => setPage(meta.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="flex items-center px-4 text-sm font-medium">
            Page {meta.page} of {meta.lastPage}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={meta.page === meta.lastPage}
            onClick={() => setPage(meta.page + 1)}
          >
             <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}