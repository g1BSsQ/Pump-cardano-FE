'use client';

import { 
    createChart, 
    ColorType, 
    IChartApi, 
    ISeriesApi, 
    CandlestickSeries, 
    HistogramSeries,
    Time
} from 'lightweight-charts';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { formatDateTime } from '@/utils/date';
import { useTokenDetail } from '../hooks/useTokenDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Cấu hình các khung giờ (giây)
const RESOLUTIONS = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '1d': 86400,
};
type ResolutionKey = keyof typeof RESOLUTIONS;

const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 9 });
};

export const CustomChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const lastCandleRef = useRef<any>(null);
    
    const params = useParams();
    const assetId = params.id as string;
    
    // Lấy thông tin Token để hiển thị tên Cặp giao dịch
    const { token } = useTokenDetail(assetId);
    
    // State quản lý Khung giờ
    const [resolution, setResolution] = useState<ResolutionKey>('15m');
    const intervalSeconds = RESOLUTIONS[resolution];
    
    const [tooltip, setTooltip] = useState<any>(null);

    // ========================================================
    // 1. FETCH DATA & DỰNG LỊCH SỬ (Tự động theo resolution)
    // ========================================================
    const fetchChartData = useCallback(async () => {
        if (!assetId) return;
        try {
            const res = await axios.get(`${API_URL}/pools/${assetId}/chart?resolution=${resolution}`);
            
            // Xóa chart nếu không có dữ liệu
            if (!res.data || res.data.length === 0) {
                if (candleSeriesRef.current && volumeSeriesRef.current) {
                    candleSeriesRef.current.setData([]);
                    volumeSeriesRef.current.setData([]);
                }
                return;
            }

            const rawData = res.data.sort((a: any, b: any) => a.time - b.time);
            const bucketedMap = new Map<number, any>();
            
            // Gom nến vào khung giờ
            rawData.forEach((candle: any) => {
                const bucketTime = Math.floor(candle.time / intervalSeconds) * intervalSeconds;
                if (!bucketedMap.has(bucketTime)) {
                    bucketedMap.set(bucketTime, { ...candle, time: bucketTime });
                } else {
                    const existing = bucketedMap.get(bucketTime)!;
                    existing.high = Math.max(existing.high, candle.high);
                    existing.low = Math.min(existing.low, candle.low);
                    existing.close = candle.close;
                    existing.volume = (existing.volume || 0) + (candle.volume || 0);
                }
            });
            
            const sortedBuckets = Array.from(bucketedMap.values()).sort((a, b) => a.time - b.time);
            const filledData: any[] = [];
            let last = sortedBuckets[0];
            filledData.push({ ...last });

            // Bơm nến & nối liền gap
            for (let i = 1; i < sortedBuckets.length; i++) {
                const curr = sortedBuckets[i];
                let nextTime = last.time + intervalSeconds;
                
                while (nextTime < curr.time) {
                    const fake = { time: nextTime, open: last.close, high: last.close, low: last.close, close: last.close, volume: 0 };
                    filledData.push(fake);
                    last = fake;
                    nextTime += intervalSeconds;
                }
                
                const connectedCandle = {
                    time: curr.time,
                    open: last.close,
                    high: Math.max(last.close, curr.high),
                    low: Math.min(last.close, curr.low),
                    close: curr.close,
                    volume: curr.volume,
                };
                filledData.push(connectedCandle);
                last = connectedCandle;
            }

            // Kéo nến ngang đến hiện tại
            const nowSeconds = Math.floor(Date.now() / 1000);
            const currentIntervalTime = nowSeconds - (nowSeconds % intervalSeconds);
            let nextFakeTime = last.time + intervalSeconds;

            while (nextFakeTime <= currentIntervalTime) {
                const fake = { time: nextFakeTime, open: last.close, high: last.close, low: last.close, close: last.close, volume: 0 };
                filledData.push(fake);
                last = fake;
                nextFakeTime += intervalSeconds;
            }

            lastCandleRef.current = last;

            // Render
            if (candleSeriesRef.current && volumeSeriesRef.current) {
                candleSeriesRef.current.setData(filledData);
                volumeSeriesRef.current.setData(filledData.map((d) => ({
                    time: d.time, value: d.volume, color: d.close >= d.open ? '#22c55e80' : '#ef444480', 
                })));
            }
        } catch (error) {
            console.error("Chart fetch error", error);
        }
    }, [assetId, resolution, intervalSeconds]);

    // ========================================================
    // 2. KHỞI TẠO CHART CƠ BẢN
    // ========================================================
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94a3b8' },
            grid: { vertLines: { color: '#1e293b', style: 2 }, horzLines: { color: '#1e293b', style: 2 } },
            width: chartContainerRef.current.clientWidth,
            height: 480, // Tăng thêm chút chiều cao cho thoáng
            timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#1e293b', rightOffset: 8 }, 
            rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0.2 } },
            crosshair: { mode: 1 },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
            wickUpColor: '#22c55e', wickDownColor: '#ef4444',
            priceFormat: { type: 'price', precision: 9, minMove: 0.000000001 },
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: '',
        });
        volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

        candleSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;
        chartRef.current = chart;

        chart.subscribeCrosshairMove((param) => {
            if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
                setTooltip(null);
            } else {
                const candle = param.seriesData.get(candlestickSeries) as any;
                const vol = param.seriesData.get(volumeSeries) as any;
                if (candle) {
                    setTooltip({
                        visible: true, o: candle.open, h: candle.high, l: candle.low, c: candle.close, v: vol?.value || 0,
                        time: formatDateTime(Number(param.time) * 1000), color: candle.close >= candle.open ? 'text-green-500' : 'text-red-500'
                    });
                }
            }
        });

        const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []); // Chỉ render sườn Chart 1 lần

    // ========================================================
    // 3. TICK ENGINE & TỰ ĐỘNG CHẠY LẠI KHI ĐỔI KHUNG GIỜ
    // ========================================================
    useEffect(() => {
        fetchChartData(); // Lấy data mỗi khi assetId hoặc resolution thay đổi

        const pollInterval = setInterval(() => {
            fetchChartData();
        }, 5000);

        const tickInterval = setInterval(() => {
            if (!candleSeriesRef.current || !lastCandleRef.current) return;
            
            const now = Math.floor(Date.now() / 1000);
            const currentBucket = now - (now % intervalSeconds);
            const lastCandle = lastCandleRef.current;

            if (currentBucket > lastCandle.time) {
                const newEmptyCandle = {
                    time: currentBucket as Time, open: lastCandle.close, high: lastCandle.close, low: lastCandle.close, close: lastCandle.close,
                };
                candleSeriesRef.current.update(newEmptyCandle);
                lastCandleRef.current = newEmptyCandle;
            }
        }, 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(tickInterval);
        };
    }, [fetchChartData, intervalSeconds]);

    return (
        <div className="glass-panel p-4 border border-border/50 rounded-xl bg-card/30 backdrop-blur-md relative">
            
            {/* Header Chart chuẩn Sàn DEX */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-border/30 pb-3 gap-3">
                <div className="flex flex-col">
                    {/* Tên cặp giao dịch thay cho "LIVE CHART" */}
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl text-foreground">
                            {token ? `${token.ticker} / ADA` : 'Loading...'}
                        </h3>
                        <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
                            Hydra L2
                        </span>
                    </div>

                    {/* Dữ liệu Tooltip hiển thị gọn gàng bên dưới tên cặp */}
                    <div className="h-4 flex items-center mt-1">
                        {tooltip ? (
                            <div className="flex gap-3 text-[11px] font-mono">
                                <span>O <span className={tooltip.color}>{formatPrice(tooltip.o)}</span></span>
                                <span>H <span className={tooltip.color}>{formatPrice(tooltip.h)}</span></span>
                                <span>L <span className={tooltip.color}>{formatPrice(tooltip.l)}</span></span>
                                <span>C <span className={tooltip.color}>{formatPrice(tooltip.c)}</span></span>
                            </div>
                        ) : (
                            <span className="text-[11px] text-muted-foreground">Hover trên biểu đồ để xem chi tiết nến</span>
                        )}
                    </div>
                </div>

                {/* Thanh chọn Khung Giờ (Timeframe Selector) */}
                <div className="flex bg-background border border-border/50 rounded-lg p-1 shrink-0">
                    {(Object.keys(RESOLUTIONS) as ResolutionKey[]).map((res) => (
                        <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                resolution === res
                                    ? 'bg-primary/20 text-primary' // Hiệu ứng sáng màu khi chọn
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            }`}
                        >
                            {res}
                        </button>
                    ))}
                </div>
            </div>

            {/* Container vẽ Chart */}
            <div ref={chartContainerRef} className="w-full h-[480px] relative outline-none" />
        </div>
    );
};