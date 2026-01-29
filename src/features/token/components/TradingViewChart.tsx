import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
}

export const TradingViewChart = ({ symbol = "BINANCE:ADAUSDT" }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(2, 6, 23, 1)",
      gridColor: "rgba(30, 41, 59, 0.5)",
      hide_side_toolbar: true,
      allow_symbol_change: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      height: 505
    });

    const currentContainer = containerRef.current;
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container w-full rounded-lg overflow-hidden"
      ref={containerRef}
      style={{ minHeight: '505px', height: '505px' }}
    >
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
};

