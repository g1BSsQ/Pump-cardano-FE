'use client';

import { useState } from 'react';
import { useTokens } from '@/features/dashboard/hooks/useTokens';
import { TokenCard } from './TokenCard';
import { TokenTable } from './TokenTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Grid3x3, List, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = 'grid' | 'list';
type SortField = 'createdAt' | 'marketCap' | 'volume24h' | 'priceChange24h';
type SortOrder = 'asc' | 'desc';

export function TokenGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showOnlyHydra, setShowOnlyHydra] = useState(false);
  
  const { tokens, meta, loading, error, setPage } = useTokens({ 
    limit: viewMode === 'grid' ? 12 : 20 
  });

  // Sort tokens locally
  const sortedTokens = [...tokens].sort((a, b) => {
    let aVal: number, bVal: number;
    
    switch(sortField) {
      case 'marketCap':
        aVal = parseFloat(a.marketCap || '0');
        bVal = parseFloat(b.marketCap || '0');
        break;
      case 'volume24h':
        aVal = parseFloat(a.volume24h || '0');
        bVal = parseFloat(b.volume24h || '0');
        break;
      case 'priceChange24h':
        aVal = a.priceChange24h || 0;
        bVal = b.priceChange24h || 0;
        break;
      case 'createdAt':
      default:
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
    }
    
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Filter by Hydra status
  const filteredTokens = showOnlyHydra 
    ? sortedTokens.filter(t => t.headPort && t.head?.status === 'Open')
    : sortedTokens;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex gap-2 justify-end">
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortField === 'createdAt'}
              onCheckedChange={() => setSortField('createdAt')}
            >
              Newest
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortField === 'marketCap'}
              onCheckedChange={() => setSortField('marketCap')}
            >
              Market Cap
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortField === 'volume24h'}
              onCheckedChange={() => setSortField('volume24h')}
            >
              24h Volume
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortField === 'priceChange24h'}
              onCheckedChange={() => setSortField('priceChange24h')}
            >
              24h Change
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortOrder === 'desc'}
              onCheckedChange={() => setSortOrder('desc')}
            >
              Descending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortOrder === 'asc'}
              onCheckedChange={() => setSortOrder('asc')}
            >
              Ascending
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showOnlyHydra}
              onCheckedChange={setShowOnlyHydra}
            >
              ⚡ Hydra L2 Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )
      ) : error ? (
        <div className="text-center text-red-500 py-10 px-4">
          <p className="text-lg font-semibold mb-2">Error loading tokens</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 px-4">
          <p className="text-lg font-semibold mb-2">No tokens found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTokens.map((token) => (
            <TokenCard key={token.assetId} token={token} />
          ))}
        </div>
      ) : (
        <TokenTable tokens={filteredTokens} />
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