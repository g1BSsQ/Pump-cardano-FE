"use client";

import { KingOfHillCard } from "@/features/dashboard/components/KingOfHillCard";
import { TokenGrid } from "@/features/dashboard/components/TokenGrid";

// ... (Giữ nguyên phần code constants kingToken và stats như cũ) ...
const kingToken = {
  id: "king",
  name: "SNEK",
  ticker: "SNEK",
  image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=400&h=400&fit=crop",
  marketCap: "₳2.5M",
  change24h: 156.7,
  bondingProgress: 94,
  holders: 12847,
  volume24h: "₳890K",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* King of the Hill */}
      <section>
        <KingOfHillCard token={kingToken} />
      </section>

      {/* Token Grid */}
      <section>
        <TokenGrid />
      </section>
    </div>
  );
};



