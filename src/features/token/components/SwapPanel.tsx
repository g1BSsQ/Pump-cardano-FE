'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@meshsdk/react"; // <-- Import hook ví
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider"; 
import { Settings, Wallet, Info } from "lucide-react";
import { Token } from "@/features/create/types";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- COMPONENT FORMAT GIÁ HIỂN THỊ (Subscript Zeros) ---
const FormattedPrice = ({ price }: { price: number }) => {
  if (!price) return <span>0</span>;
  const priceStr = price.toFixed(10).replace(/0+$/, ''); // Cắt số 0 thừa
  const match = priceStr.match(/^0\.0+/);
  
  if (match) {
    const zeroCount = match[0].length - 2; // Số lượng số 0 sau dấu phẩy
    if (zeroCount >= 3) {
      const remaining = priceStr.slice(match[0].length);
      return (
        <span>
          0.0<sub className="text-[10px] mt-1">{zeroCount}</sub>{remaining}
        </span>
      );
    }
  }
  return <span>{priceStr}</span>;
}

export const SwapPanel = ({ token }: { token: Token }) => {
  const { wallet, connected } = useWallet(); // Lấy ví người dùng
  
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>(""); 
  const [estimated, setEstimated] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [sliderVal, setSliderVal] = useState([0]); 
  const [slippage, setSlippage] = useState("5"); 

  // --- STATE LƯU TRỮ SỐ DƯ THẬT ---
  const [adaBalance, setAdaBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const price = Number(token.pool?.currentPrice) || 0.000001;
  const currentBalance = mode === 'buy' ? adaBalance : tokenBalance;

  // --- 1. FETCH BALANCE THẬT TỪ L1 HOẶC L2 ---
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !wallet) {
        setAdaBalance(0);
        setTokenBalance(0);
        return;
      }

      try {
        const address = await wallet.getChangeAddress();
        const assetId = token.policyId + token.tokenNameHex;
        const decimals = token.decimals || 0;

        if (token.pool?.headPort) {
          // 🔵 NẾU TOKEN ĐANG Ở L2 (HYDRA): Áp dụng chuẩn logic từ useDecommit
          const balRes = await axios.get(`${API_URL}/users/${address}/balance?headPort=${token.pool.headPort}`);
          
          const l2Balance: { lovelace?: string; assets?: Record<string, string> } = balRes.data.balance || { lovelace: "0", assets: {} };
          
          const rawLovelace = l2Balance.lovelace || "0";
          const rawToken = l2Balance.assets?.[assetId] || "0";

          setAdaBalance(Number(rawLovelace) / 1_000_000); // Lovelace -> ADA
          setTokenBalance(Number(rawToken) / Math.pow(10, decimals)); 
          
        } else {
          // 🟡 NẾU TOKEN Ở L1: Lấy trực tiếp từ ví MeshJS
          const lovelace = await wallet.getLovelace();
          setAdaBalance(Number(lovelace) / 1_000_000);

          const assets = await wallet.getBalance();
          const tokenAsset = assets.find(a => a.unit === assetId);
          setTokenBalance(tokenAsset ? (Number(tokenAsset.quantity) / Math.pow(10, decimals)) : 0);
        }
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    };

    fetchBalances();
    // Poll mỗi 5 giây để cập nhật số dư mới nhất
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [connected, wallet, token]);

  // --- 2. TÍNH TOÁN KHI NHẬP SỐ ---
  useEffect(() => {
  const val = parseFloat(amount);
  if (isNaN(val) || val <= 0) {
    setEstimated("0");
    return;
  }

  const decimals = token.decimals || 0;

  if (mode === 'buy') {
    // Buy: ADA / (ADA/Token) = Tokens nhận được
    const tokenReceived = val / price;
    // Làm tròn theo đúng số lẻ của token
    setEstimated(tokenReceived.toFixed(decimals));
  } else {
    // Sell: Tokens * (ADA/Token) = ADA nhận được
    const adaReceived = val * price;
    setEstimated(adaReceived.toFixed(6)); // ADA luôn 6 số lẻ
  }
}, [amount, mode, price, currentBalance, sliderVal, token.decimals]);

  // --- 3. XỬ LÝ KHI KÉO SLIDER ---
  const handleSliderChange = (vals: number[]) => {
    setSliderVal(vals);
    const percent = vals[0];
    if (percent === 0) { setAmount(""); return; }

    const decimals = token.decimals || 0;
    const calculatedAmount = (currentBalance * percent) / 100;
    
    if (mode === 'buy') {
      // ADA tính theo 2 số lẻ hoặc giữ nguyên tùy ví
      setAmount(calculatedAmount.toFixed(2));
    } else {
      // Token tính theo đúng số lẻ decimals
      setAmount(calculatedAmount.toFixed(decimals));
    }
};
  // --- 4. XỬ LÝ GIAO DỊCH ---
  const handleTrade = async () => {
    if (!connected || !wallet) {
      toast.error("Vui lòng kết nối ví trước!");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      setLoading(true);
      const traderAddress = await wallet.getChangeAddress(); // Lấy ví thật thay vì fakeTrader

      const cleanEstimated = estimated.replace(/,/g, '');
  const cleanAmount = amount.replace(/,/g, '');

  let adaAmount = 0;
  let tokenAmount = 0;

      if (mode === 'buy') {
adaAmount = parseFloat(cleanAmount);
      tokenAmount = parseFloat(cleanEstimated);
      } else {
tokenAmount = parseFloat(cleanAmount);
      adaAmount = parseFloat(cleanEstimated);
      }

      if (token.pool?.headPort) {
        const endpoint = mode === 'buy' ? '/pools/buy/hydra' : '/pools/sell/hydra';
        
        const buildRes = await axios.post(`${API_URL}${endpoint}`, {
          assetId: token.assetId,
          tokenAmount,
          [mode === 'buy' ? 'buyerAddress' : 'sellerAddress']: traderAddress, 
          slippage: parseFloat(slippage) || 0,
        });
        
        // 1. Lấy dữ liệu thực tế từ Backend trả về
        const payload = buildRes.data.data; 
        const txHex = payload.txHex;
        
        // Con số ADA thực tế mà Blockchain sẽ thực hiện
        // Với Buy là adaCost, với Sell là adaReceive
        const actualAdaAmount = mode === 'buy' ? payload.adaCost : payload.adaReceive;
        
        // 2. Ký giao dịch
        const signedTx = await wallet.signTx(txHex, true);
        
        // 3. Đẩy lên Head và ghi vào Database con số THẬT
        await axios.post(`${API_URL}/pools/hydra/submit`, {
          assetId: token.assetId,
          type: mode === 'buy' ? 'BUY' : 'SELL',
          adaAmount: Number(actualAdaAmount) / 1_000_000, // Chuyển từ Lovelace về ADA để lưu DB
          tokenAmount,
          traderAddress,
          signedTxHex: signedTx,
          slippage: parseFloat(slippage) || 0,
        });
      } else {
        await axios.post(`${API_URL}/pools/trade/simulate`, {
          assetId: token.assetId,
          type: mode === 'buy' ? 'BUY' : 'SELL',
          adaAmount,
          tokenAmount,
          traderAddress,
          slippage: parseFloat(slippage),
        });
      }

      toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} thành công!`);
      setAmount("");
      setSliderVal([0]);
      setEstimated("0");
      
    } catch (error: any) {
  console.error("🔥 Chi tiết lỗi Trade:", error);
  
  // 1. Trích xuất thông điệp lỗi từ Backend (NestJS)
  const backendError = error.response?.data?.message;
  
  // 2. Trích xuất lỗi từ Hydra Node (nếu có trong message)
  let displayMessage = "Giao dịch thất bại";
  
  if (backendError) {
    displayMessage = backendError;
    // Nếu lỗi liên quan đến trượt giá thực sự
    if (backendError.includes('slippage')) {
      displayMessage = "Giá đã thay đổi quá mức Slippage cho phép!";
    }
  } else if (error.message) {
    displayMessage = error.message;
  }

  // 3. Hiển thị thông báo chi tiết lên màn hình
  toast.error(displayMessage, {
    description: "Vui lòng kiểm tra Console (F12) để xem chi tiết kỹ thuật.",
    duration: 5000,
  });

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
        
        {/* THÔNG BÁO HYDRA */}
        {token.pool?.headPort && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-500">Hydra L2 Enabled</p>
              <p className="text-[10px] text-blue-500/80 leading-tight">
                This token is trading on Hydra Head #{token.pool?.headPort}. Your purchase will be processed as a UTxO deposit to the L2 head.
              </p>
            </div>
          </div>
        )}

        {/* PRICE DISPLAY */}
        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border border-border/30">
           <span className="text-xs text-muted-foreground">Current Price</span>
           <span className="text-sm font-bold font-mono text-primary flex items-center gap-1">
              <FormattedPrice price={price} /> ADA
           </span>
        </div>
        
        {/* SETTINGS & BALANCE */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <Popover>
                <PopoverTrigger className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
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

            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSliderChange([100])}
            >
                <Wallet className="w-3 h-3" />
                <span className="font-mono">
                  Bal: {currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} {mode === 'buy' ? 'ADA' : token.ticker}
                </span> 
            </div>
        </div>

        {/* INPUT AREA */}
        <div className="space-y-3">
            <div className="bg-background/50 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Amount</span>
                    <span 
                        className="font-mono text-primary cursor-pointer hover:underline"
                        onClick={() => handleSliderChange([100])}
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

            <div className="px-1 py-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-2 px-1">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
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
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">You receive</span>
                <span className="font-bold font-mono text-sm text-foreground">{estimated} {mode === 'buy' ? token.ticker : 'ADA'}</span>
            </div>
            {amount && (
                <>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Impact</span>
                        <span className="text-orange-500">~0.5%</span> 
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Hydra Fee</span>
                        <span className="text-green-500">Free</span>
                    </div>
                </>
            )}
        </div>

        {/* MAIN BUTTON */}
        <Button 
            className={`w-full font-bold text-lg h-12 shadow-lg transition-all ${
                !connected 
                ? 'bg-muted text-muted-foreground'
                : mode === 'buy' 
                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20 text-white' 
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white'
            }`}
            onClick={handleTrade}
            disabled={loading || !connected || !amount || parseFloat(amount) <= 0}
        >
            {!connected ? "Connect Wallet" : loading ? "Processing..." : (mode === 'buy' ? `Buy ${token.ticker}` : `Sell ${token.ticker}`)}
        </Button>
      </div>
    </div>
  );
};