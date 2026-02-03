'use client';

import { 
    createChart, 
    ColorType, 
    IChartApi, 
    ISeriesApi, 
    CandlestickData, 
    CandlestickSeries, 
    HistogramSeries,
    Time
} from 'lightweight-charts';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Format giá hiển thị (đến 9 số lẻ)
const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 9 
    });
};

export const CustomChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    
    const params = useParams();
    const assetId = params.id as string;
    
    // State dữ liệu
    const [chartData, setChartData] = useState<(CandlestickData & { volume?: number })[]>([]);
    
    // State Tooltip
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        o: number; h: number; l: number; c: number; v: number;
        time: string;
        color: string;
    } | null>(null);

    // 1. Fetch Data
    const fetchChartData = useCallback(async () => {
        if (!assetId) return;
        try {
            const res = await axios.get(`${API_URL}/tokens/${assetId}/chart?resolution=15m`);
            if (res.data && Array.isArray(res.data)) {
                // Sort dữ liệu theo thời gian
                const sortedData = res.data.sort((a: any, b: any) => a.time - b.time);
                
                // Cập nhật dữ liệu nếu chart đã init
                if (candleSeriesRef.current && volumeSeriesRef.current) {
                    candleSeriesRef.current.setData(sortedData);
                    
                    // Tạo dữ liệu volume
                    const volumeData = sortedData.map((d: any) => ({
                        time: d.time,
                        value: d.volume,
                        color: d.close >= d.open ? '#22c55e80' : '#ef444480', // Xanh/Đỏ mờ
                    }));
                    volumeSeriesRef.current.setData(volumeData);
                } else {
                    // Nếu chưa init thì lưu vào state
                    setChartData(sortedData);
                }
            }
        } catch (error) {
            console.error("Failed to load chart", error);
        }
    }, [assetId]);

    // Auto-refresh mỗi 5s
    useEffect(() => {
        fetchChartData();
        const interval = setInterval(fetchChartData, 5000);
        return () => clearInterval(interval);
    }, [fetchChartData]);

    // 2. Khởi tạo Chart (Chạy 1 lần)
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // --- Cấu hình Chart ---
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 450, // Tăng chiều cao chút
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#1e293b',
            },
            rightPriceScale: {
                borderColor: '#1e293b',
                scaleMargins: {
                    top: 0.1,    // Chừa 10% bên trên
                    bottom: 0.2, // Chừa 20% bên dưới cho Volume
                },
            },
            crosshair: {
                // Hiển thị đường gióng
                vertLine: {
                    width: 1,
                    color: '#94a3b8',
                    style: 3, // Dotted
                },
                horzLine: {
                    visible: true,
                    labelVisible: true,
                },
            },
        });

        // --- Thêm Series Nến (Main) ---
        // SỬA LỖI V5.0: Dùng addSeries(CandlestickSeries, options)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            priceFormat: {
                type: 'price',
                precision: 9, // Hiển thị 9 số lẻ
                minMove: 0.000000001,
            },
        });

        // --- Thêm Series Volume (Phụ) ---
        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: '', // Overlay lên cùng biểu đồ
        });
        
        // Đẩy volume xuống đáy biểu đồ
        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.85, // Volume chỉ chiếm 15% chiều cao bên dưới
                bottom: 0,
            },
        });

        candleSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // --- Nạp dữ liệu ban đầu ---
        if (chartData.length > 0) {
            candlestickSeries.setData(chartData);
            
            const volumeData = chartData.map((d: any) => ({
                time: d.time,
                value: d.volume || 0,
                color: d.close >= d.open ? '#22c55e80' : '#ef444480',
            }));
            volumeSeries.setData(volumeData);
            
            chart.timeScale().fitContent();
        }

        // --- Xử lý Tooltip (Crosshair Move) ---
        chart.subscribeCrosshairMove((param) => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current!.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current!.clientHeight
            ) {
                setTooltip(null);
            } else {
                // Lấy data của nến tại vị trí chuột
                const candleData = param.seriesData.get(candlestickSeries) as any;
                const volumeData = param.seriesData.get(volumeSeries) as any;
                
                if (candleData) {
                    const dateStr = new Date(Number(param.time) * 1000).toLocaleString();
                    setTooltip({
                        visible: true,
                        o: candleData.open,
                        h: candleData.high,
                        l: candleData.low,
                        c: candleData.close,
                        v: volumeData?.value || 0,
                        time: dateStr,
                        color: candleData.close >= candleData.open ? 'text-green-500' : 'text-red-500'
                    });
                }
            }
        });

        // Resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        chartRef.current = chart;

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []); // Init once

    // Update data khi state change lần đầu
    useEffect(() => {
        if (candleSeriesRef.current && volumeSeriesRef.current && chartData.length > 0) {
            candleSeriesRef.current.setData(chartData);
            volumeSeriesRef.current.setData(chartData.map((d: any) => ({
                time: d.time,
                value: d.volume || 0,
                color: d.close >= d.open ? '#22c55e80' : '#ef444480',
            })));
        }
    }, [chartData]);

    return (
        <div className="glass-panel p-4 border border-border/50 rounded-xl bg-card/30 backdrop-blur-md relative">
            {/* Header Chart */}
            <div className="flex justify-between items-center mb-2 border-b border-border/30 pb-2">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        LIVE CHART
                    </h3>
                    {/* Floating Tooltip Values */}
                    {tooltip && (
                        <div className="hidden md:flex gap-4 text-xs font-mono">
                            <span>O: <span className={tooltip.color}>{formatPrice(tooltip.o)}</span></span>
                            <span>H: <span className={tooltip.color}>{formatPrice(tooltip.h)}</span></span>
                            <span>L: <span className={tooltip.color}>{formatPrice(tooltip.l)}</span></span>
                            <span>C: <span className={tooltip.color}>{formatPrice(tooltip.c)}</span></span>
                            <span className="text-muted-foreground">Vol: {tooltip.v.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <div className="text-xs text-muted-foreground font-mono">15m</div>
            </div>

            {/* Container vẽ Chart */}
            <div ref={chartContainerRef} className="w-full h-[450px] relative" />

            {/* Mobile Tooltip Overlay (Nếu cần) */}
            {tooltip && (
                <div className="absolute top-16 left-4 bg-background/90 backdrop-blur border border-border p-2 rounded text-xs font-mono shadow-xl md:hidden pointer-events-none z-10">
                     <div className="text-muted-foreground mb-1">{tooltip.time}</div>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span>Open:</span> <span className={tooltip.color}>{formatPrice(tooltip.o)}</span>
                        <span>High:</span> <span className={tooltip.color}>{formatPrice(tooltip.h)}</span>
                        <span>Low:</span> <span className={tooltip.color}>{formatPrice(tooltip.l)}</span>
                        <span>Close:</span> <span className={tooltip.color}>{formatPrice(tooltip.c)}</span>
                        <span>Vol:</span> <span>{tooltip.v.toFixed(2)}</span>
                     </div>
                </div>
            )}
        </div>
    );
};