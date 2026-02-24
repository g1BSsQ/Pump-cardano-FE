'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Import Slider
import { Settings, ArrowDown, Wallet, Info } from "lucide-react";
import { Token } from "@/features/create/types";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Mock Balance (Sau này thay bằng balance thật từ ví)
const MOCK_ADA_BALANCE = 1500; 
const MOCK_TOKEN_BALANCE = 10000;

export const SwapPanel = ({ token }: { token: Token }) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>(""); 
  const [estimated, setEstimated] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [sliderVal, setSliderVal] = useState([0]); // State cho Slider (0-100%)
  const [slippage, setSlippage] = useState("5"); // Mặc định slippage 5%

  const price = Number(token.currentPrice) || 0.000001;

  // Lấy balance hiện tại theo mode
  const currentBalance = mode === 'buy' ? MOCK_ADA_BALANCE : MOCK_TOKEN_BALANCE;

  // --- 1. TÍNH TOÁN KHI NHẬP SỐ ---
  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setEstimated("0");
      return;
    }

    // Update Slider ngược lại (Nếu user gõ phím)
    // Ví dụ: Có 100 ADA, gõ 50 -> Slider nhảy về 50%
    if (currentBalance > 0) {
        const percent = Math.min((val / currentBalance) * 100, 100);
        // Chỉ update slider nếu chênh lệch đáng kể để tránh loop
        if (Math.abs(percent - sliderVal[0]) > 1) {
             setSliderVal([percent]);
        }
    }

    if (mode === 'buy') {
      const tokenReceived = val / price;
      setEstimated(tokenReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }));
    } else {
      const adaReceived = val * price;
      setEstimated(adaReceived.toLocaleString('en-US', { maximumFractionDigits: 6 }));
    }
  }, [amount, mode, price, currentBalance]);

  // --- 2. XỬ LÝ KHI KÉO SLIDER ---
  const handleSliderChange = (vals: number[]) => {
      setSliderVal(vals);
      const percent = vals[0];
      
      if (percent === 0) {
          setAmount("");
          return;
      }

      // Tính số lượng dựa trên % Balance
      const calculatedAmount = (currentBalance * percent) / 100;
      
      // Làm tròn số đẹp
      // Nếu là ADA (Buy) thì lấy 2 số lẻ, Token (Sell) thì lấy số nguyên hoặc 2 số lẻ
      const formattedAmount = mode === 'buy' 
        ? calculatedAmount.toFixed(2)
        : calculatedAmount.toFixed(2);

      setAmount(formattedAmount);
  };

  // --- 3. XỬ LÝ GIAO DỊCH ---
  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      setLoading(true);
      const fakeTrader = "addr_test1_fake_user_" + Math.floor(Math.random() * 1000);

      let adaAmount = 0;
      let tokenAmount = 0;

      if (mode === 'buy') {
          adaAmount = parseFloat(amount);
          tokenAmount = parseFloat(estimated.replace(/,/g, ''));
      } else {
          tokenAmount = parseFloat(amount);
          adaAmount = parseFloat(estimated.replace(/,/g, ''));
      }

      // Nếu là Hydra token và đang mua -> Dùng API Buy Hydra (Deposit ADA UTxO)
      if (token.headPort && mode === 'buy') {
        console.log("Using Hydra L2 Buy flow");
        await axios.post(`${API_URL}/tokens/buy/hydra`, {
          assetId: token.assetId,
          adaAmount,
          buyerAddress: fakeTrader,
        });
      } else {
        // Gửi cả Slippage lên backend (để backend check Hydra logic)
        await axios.post(`${API_URL}/tokens/trade/simulate`, {
          assetId: token.assetId,
          type: mode === 'buy' ? 'BUY' : 'SELL',
          adaAmount,
          tokenAmount,
          traderAddress: fakeTrader,
          slippage: parseFloat(slippage) // Gửi slippage lên
        });
      }

      toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} successful!`);
      setAmount("");
      setSliderVal([0]);
      setEstimated("0");
      
    } catch (error) {
      console.error("Trade failed", error);
      toast.error("Trade failed. Price moved too fast!"); // Báo lỗi kiểu Slippage
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl">
      {/* TABS */}
      <Tabs defaultValue="buy" onValueChange={(v) => {
          setMode(v as 'buy' | 'sell');
          setAmount("");
          setSliderVal([0]);
      }} className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent border-b border-border/50 p-0 h-12">
          <TabsTrigger value="buy" className="rounded-none h-full data-[state=active]:text-green-500 data-[state=active]:border-b-2 data-[state=active]:border-green-500 font-bold">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="rounded-none h-full data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 font-bold">Sell</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="p-4 space-y-5">
        {token.headPort && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-500">Hydra L2 Enabled</p>
              <p className="text-[10px] text-blue-500/80 leading-tight">
                This token is trading on Hydra Head #{token.headPort}. Your purchase will be processed as a UTxO deposit to the L2 head.
              </p>
            </div>
          </div>
        )}
        
        {/* SETTINGS & BALANCE */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            {/* Popover chỉnh Max Slippage */}
            <Popover>
                <PopoverTrigger className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Settings className="w-3 h-3" />
                    <span>Slippage: {slippage}%</span>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold">Max Slippage</span>
                        <div className="grid grid-cols-3 gap-2">
                            {['1', '5', '10'].map((s) => (
                                <Button 
                                    key={s} 
                                    variant={slippage === s ? "default" : "outline"} 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setSlippage(s)}
                                >{s}%</Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 border rounded px-2 py-1">
                            <Input 
                                className="h-6 border-none p-0 text-right text-xs" 
                                value={slippage} 
                                onChange={(e) => setSlippage(e.target.value)}
                            />
                            <span className="text-xs">%</span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                <span>Bal: {currentBalance.toLocaleString()} {mode === 'buy' ? 'ADA' : token.ticker}</span> 
            </div>
        </div>

        {/* INPUT AREA */}
        <div className="space-y-3">
            <div className="bg-background/50 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Amount</span>
                    <span 
                        className="font-mono text-primary cursor-pointer hover:underline"
                        onClick={() => handleSliderChange([100])} // Bấm Max = 100%
                    >
                        Max
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        placeholder="0.0" 
                        className="border-none bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0 shadow-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex items-center gap-2 bg-card border border-border px-2 py-1 rounded-full shrink-0">
                        <span className="font-bold text-sm">
                            {mode === 'buy' ? 'ADA' : token.ticker}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- SLIDER COMPONENT --- */}
            <div className="px-1 py-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-2 px-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
                <Slider 
                    value={sliderVal} 
                    onValueChange={handleSliderChange} 
                    max={100} 
                    step={1}
                    className={`cursor-pointer ${mode === 'buy' ? 'text-green-500' : 'text-red-500'}`}
                />
            </div>
        </div>

        {/* OUTPUT & INFO */}
        <div className="bg-secondary/20 p-3 rounded-lg border border-border/50 text-xs space-y-2">
            <div className="flex justify-between">
                <span className="text-muted-foreground">You receive</span>
                <span className="font-bold font-mono text-sm">{estimated} {mode === 'buy' ? token.ticker : 'ADA'}</span>
            </div>
            {amount && (
                <>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Impact</span>
                        <span className="text-orange-500">~2.5%</span> 
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Hydra Fee</span>
                        <span className="text-green-500">~0.00 ADA (Free)</span>
                    </div>
                </>
            )}
        </div>

        {/* MAIN BUTTON */}
        <Button 
            className={`w-full font-bold text-lg h-12 shadow-lg transition-all ${
                mode === 'buy' 
                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20 text-white' 
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white'
            }`}
            onClick={handleTrade}
            disabled={loading || !amount || parseFloat(amount) <= 0}
        >
            {loading ? "Processing..." : (mode === 'buy' ? `Buy ${token.ticker}` : `Sell ${token.ticker}`)}
        </Button>
      </div>
    </div>
  );
};