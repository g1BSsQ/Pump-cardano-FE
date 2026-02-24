"use client";

import { KingOfHillCard } from "@/features/dashboard/components/KingOfHillCard";
import { TokenGrid } from "@/features/dashboard/components/TokenGrid";
import { useKingToken } from "@/features/dashboard/hooks/useKingToken";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { kingToken, loading, error } = useKingToken();

  return (
    <div className="space-y-8">
      {/* King of the Hill */}
      <section>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            <p className="text-lg font-semibold mb-2">Error loading king token</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : kingToken ? (
          <KingOfHillCard token={kingToken} />
        ) : null}
      </section>

      {/* Token Grid */}
      <section>
        <TokenGrid />
      </section>
    </div>
  );
};



