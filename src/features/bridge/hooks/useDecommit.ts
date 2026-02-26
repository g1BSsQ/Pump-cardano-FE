import { useState, useEffect } from "react";
import { useWallet, useAddress } from "@meshsdk/react";
import { MeshTxBuilder } from "@meshsdk/core";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { BridgeAsset, DecommitHook, HydraHead } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useDecommit = (): DecommitHook => {
  const { wallet, connected } = useWallet();
  const address = useAddress();
  const { toast } = useToast();
  
  const [activeHead, setActiveHead] = useState<HydraHead | null>(null);
  const [adaAmount, setAdaAmount] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [tokenAmounts, setTokenAmounts] = useState<{ [unit: string]: string }>({});
  const [assets, setAssets] = useState<BridgeAsset[]>([]);
  const [dbUtxos, setDbUtxos] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);

  interface ApiHead { status: string; port: number; }
  interface ApiToken { assetId: string; ticker: string; logoUrl?: string; imageUrl?: string; decimals?: number; }

  const fetchL2Data = async () => {
    // ... [Phần này giữ NGUYÊN không đổi - logic gọi API và map assets đã hoạt động đúng] ...
    if (!connected || !address) return;
    setIsLoading(true);
    
    try {
      let head = null;
      let dbTokens: ApiToken[] = [];
      
      try {
        const [headsRes, tokensRes] = await Promise.all([
          axios.get<ApiHead[]>(`${API_URL}/heads`),
          axios.get(`${API_URL}/tokens?limit=100`) 
        ]);
        
        const heads = headsRes.data;
        head = heads.find(h => h.status === 'Open') || heads[0];
        setActiveHead(head);
        
        dbTokens = tokensRes.data?.data || (Array.isArray(tokensRes.data) ? tokensRes.data : []);
        
        dbTokens = await Promise.all(dbTokens.map(async (t) => {
          if (!t.logoUrl) {
            try {
              const res = await axios.get(`${API_URL}/tokens/${t.assetId}`);
              return { ...t, logoUrl: res.data.logoUrl || res.data.imageUrl };
            } catch { return t; }
          }
          return t;
        }));
      } catch (e) {
        console.warn("⚠️ API Heads/Tokens lỗi. Dùng cấu hình mặc định (port 4001).", e);
        head = { status: 'Open', port: 4001 };
        setActiveHead(head);
      }

      if (head) {
        let utxosData: any[] = [];
        try {
          const utxoRes = await axios.get(`${API_URL}/users/${address}/utxos?headPort=${head.port}`);
          utxosData = utxoRes.data || [];
        } catch (apiError) {
          console.warn("⚠️ API lấy UTxO L2 chưa sẵn sàng:", apiError);
        }

        setDbUtxos(utxosData);

        let calculatedLovelace = 0n;
        const calculatedAssets: Record<string, bigint> = {};

        utxosData.forEach((utxo: any) => {
          calculatedLovelace += BigInt(utxo.lovelace || 0);
          
          if (utxo.assets && typeof utxo.assets === 'object') {
            Object.entries(utxo.assets).forEach(([policyId, tokens]: [string, any]) => {
              if (policyId === 'lovelace') return;
              if (tokens && typeof tokens === 'object') {
                Object.entries(tokens).forEach(([assetNameHex, qty]: [string, any]) => {
                  const key = `${policyId}${assetNameHex}`; 
                  if (!calculatedAssets[key]) calculatedAssets[key] = 0n;
                  calculatedAssets[key] += BigInt(qty);
                });
              }
            });
          }
        });

        const mappedAssets: BridgeAsset[] = [
          { 
            unit: "lovelace", ticker: "ADA", logoUrl: "/ada-logo.png", decimals: 6, 
            rawBalance: calculatedLovelace.toString(), 
            balance: (Number(calculatedLovelace) / 1000000).toLocaleString() 
          }
        ];

        Object.entries(calculatedAssets).forEach(([assetKey, amount]) => {
          if (amount > 0n) {
            const foundInDb = dbTokens.find(t => {
               const dbId = t.assetId.replace('.', '');
               return dbId === assetKey;
            });
            
            if (!foundInDb) return; 

            const decimals = foundInDb.decimals || 0;
            mappedAssets.push({
              unit: assetKey, ticker: foundInDb.ticker, 
              logoUrl: foundInDb.logoUrl || foundInDb.imageUrl || undefined, decimals: decimals,
              rawBalance: amount.toString(), balance: (Number(amount) / Math.pow(10, decimals)).toLocaleString()
            });
          }
        });

        setAssets(mappedAssets);
      }
    } catch (e) {
      console.error("L2 Fetch Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchL2Data(); }, [connected, address]);

  const adaBalance = assets.find(a => a.unit === "lovelace")?.balance || "0";
  const availableTokens = assets.filter(a => a.unit !== "lovelace");
  const selectedTokens = availableTokens.filter(t => selectedUnits.includes(t.unit));

const handleMaxAda = () => {
    const rawAda = assets.find(a => a.unit === "lovelace")?.rawBalance || "0";
    const totalAda = Number(rawAda) / 1000000;

    // Kiểm tra xem ví có Token nào khác không
    const hasOtherTokens = availableTokens.length > 0;
    
    // Kiểm tra xem người dùng có đang cố gắng rút TẤT CẢ các token đó không
    const isWithdrawingAllTokens = availableTokens.every(tok => {
        const withdrawQtyStr = tokenAmounts[tok.unit] || "0";
        const totalQtyStr = (Number(tok.rawBalance) / Math.pow(10, tok.decimals)).toString();
        return withdrawQtyStr === totalQtyStr;
    });

    let safeMaxAda = totalAda;

    // NẾU ví có Token VÀ người dùng KHÔNG rút sạch sành sanh số Token đó
    // THÌ ta phải bớt lại 2 ADA làm mồi cõng Token thừa trên L2.
    if (hasOtherTokens && !isWithdrawingAllTokens) {
        safeMaxAda = Math.max(0, totalAda - 2); // Giữ lại 2 ADA
        toast({ 
            title: "Đã tự động điều chỉnh ADA", 
            description: "Hệ thống đã giữ lại 2 ADA trên L2 để đảm bảo các Token khác của bạn không bị kẹt." 
        });
    }

    setAdaAmount(safeMaxAda.toString());
  };
  
  const handleMaxToken = (unit: string) => {
    const tok = availableTokens.find(t => t.unit === unit);
    if (tok) setTokenAmounts(prev => ({ ...prev, [unit]: (Number(tok.rawBalance) / Math.pow(10, tok.decimals)).toString() }));
  };

  // 5. RÚT TIỀN: CÂN BẰNG THỦ CÔNG ĐẦU VÀO = ĐẦU RA
const decommit = async () => {
    if (!connected || !address) return;
    
    const hasAmount = (Number(adaAmount) > 0) || Object.values(tokenAmounts).some(v => Number(v) > 0);
    if (!hasAmount) {
        toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số lượng tài sản cần rút." });
        return;
    }

    toast({ title: "Đang xử lý", description: "Vui lòng ký 2 giao dịch liên tiếp trên ví của bạn..." });
    
    try {
      const withdrawLovelace = Math.floor(Number(adaAmount || 0) * 1_000_000);
      const withdrawTokens: {unit: string, quantity: string}[] = [];
      
      Object.entries(tokenAmounts).forEach(([unit, amountStr]) => {
        const asset = assets.find(a => a.unit === unit);
        const qty = Math.floor(Number(amountStr) * Math.pow(10, asset?.decimals || 0));
        if (qty > 0) withdrawTokens.push({ unit, quantity: qty.toString() });
      });

      // 1. Gọi BE xin Blueprint
      const blueprintRes = await axios.post(`${API_URL}/users/${address}/decommit/build-tx`, {
          withdrawLovelace,
          withdrawTokens
      });

      const { splitTxHex, decommitTxHex } = blueprintRes.data;

      // 2. Ký 2 Giao Dịch Liên Tiếp
      toast({ title: "Bước 1/2", description: "Đang tách tài sản trên ví L2..." });
      const signedSplitTx = await wallet.signTx(splitTxHex, true); 
      
      toast({ title: "Bước 2/2", description: "Đang rút tài sản về ví chính L1..." });
      const signedDecommitTx = await wallet.signTx(decommitTxHex, true);

      // 3. Submit lên Backend
      toast({ title: "Đang xử lý", description: "Đang gửi yêu cầu lên mạng lưới..." });
      await axios.post(`${API_URL}/users/${address}/decommit/submit`, { 
        signedTxs: {
            splitTx: signedSplitTx,
            decommitTx: signedDecommitTx
        }
      });

      toast({ title: "Thành công!", description: "Tài sản đã được rút. Đang chờ L1 xác nhận." });
      setAdaAmount(""); setTokenAmounts({}); setSelectedUnits([]);
      setTimeout(fetchL2Data, 5000); 

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      toast({ variant: "destructive", title: "Rút tiền thất bại", description: msg });
    }
  };

  return { 
      connected, adaAmount, setAdaAmount, selectedUnits, setSelectedUnits, tokenAmounts, setTokenAmounts, 
      activeHead, adaBalance, availableTokens, selectedTokens, isLoading, handleMaxAda, handleMaxToken, decommit 
  };
};