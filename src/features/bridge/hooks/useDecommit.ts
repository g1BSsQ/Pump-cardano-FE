import { useState, useEffect } from "react";
import { useWallet, useAddress } from "@meshsdk/react";
import axios from "axios";
import { BridgeAsset, DecommitHook, HydraHead } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useDecommit = (): DecommitHook => {
  const { connected } = useWallet();
  const address = useAddress();
  const [activeHead, setActiveHead] = useState<HydraHead | null>(null);
  const [adaAmount, setAdaAmount] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [tokenAmounts, setTokenAmounts] = useState<{ [unit: string]: string }>({});
  const [assets, setAssets] = useState<BridgeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  interface ApiHead { status: string; port: number; }
  interface ApiToken { assetId: string; ticker: string; logoUrl?: string; imageUrl?: string; decimals?: number; }

  useEffect(() => {
    const fetchL2Data = async () => {
      if (!connected || !address) return;
      setIsLoading(true);
      try {
        const [headsRes, tokensRes] = await Promise.all([
          axios.get<ApiHead[]>(`${API_URL}/heads`),
          axios.get<{ data: ApiToken[] }>(`${API_URL}/pools?limit=100`)
        ]);

        const heads = headsRes.data;
        const head = heads.find(h => h.status === 'Open') || heads[0];
        setActiveHead(head);
        
        let dbTokens: ApiToken[] = tokensRes.data.data || [];
        const enriched = await Promise.all(dbTokens.map(async (t) => {
          if (!t.logoUrl) {
            try {
              const res = await axios.get(`${API_URL}/tokens/${t.assetId}`);
              return { ...t, logoUrl: res.data.logoUrl || res.data.imageUrl };
            } catch {
              return t;
            }
          }
          return t;
        }));
        dbTokens = enriched;

        if (head) {
          const balRes = await axios.get(`${API_URL}/users/${address}/balance?headPort=${head.port}`);
          
          // SỬA LỖI Ở ĐÂY: Phải trỏ vào object "balance" của Backend trả về
          const l2Balance: { lovelace?: string; assets?: Record<string,string> } = balRes.data.balance || { lovelace: "0", assets: {} };

          const mapped: BridgeAsset[] = [
            { 
              unit: "lovelace", 
              ticker: "ADA", 
              logoUrl: "/ada-logo.png", 
              decimals: 6, 
              // Lấy lovelace từ l2Balance
              rawBalance: l2Balance.lovelace?.toString() || "0", 
              balance: "" 
            },
            ...dbTokens.map((t) => ({
              unit: t.assetId,
              ticker: t.ticker,
              logoUrl: t.logoUrl || t.imageUrl || undefined,
              decimals: t.decimals || 0,
              // Lấy token từ l2Balance.assets
              rawBalance: l2Balance.assets?.[t.assetId]?.toString() || "0",
              balance: ""
            })).filter((t) => Number(t.rawBalance) > 0)
          ].map(a => ({ 
            ...a, 
            balance: (Number(a.rawBalance) / Math.pow(10, a.decimals)).toLocaleString() 
          }));

          setAssets(mapped);
        }
      } catch (e) {
        console.error("L2 Fetch Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchL2Data();
  }, [connected, address]);

  const adaBalance = assets.find(a => a.unit === "lovelace")?.balance || "0";
  const availableTokens = assets.filter(a => a.unit !== "lovelace");
  const selectedTokens = availableTokens.filter(t => selectedUnits.includes(t.unit));

  const handleMaxAda = () => {
    const rawAda = assets.find(a => a.unit === "lovelace")?.rawBalance || "0";
    setAdaAmount((Number(rawAda) / 1000000).toString());
  };
  
  const handleMaxToken = (unit: string) => {
    const tok = availableTokens.find(t => t.unit === unit);
    if (tok) {
      setTokenAmounts(prev => ({
        ...prev,
        [unit]: (Number(tok.rawBalance) / Math.pow(10, tok.decimals)).toString()
      }));
    }
  };

  const decommit = async () => {
    console.log("Decommitting from L2", { adaAmount, tokenAmounts });
    // TODO: Tích hợp logic gọi API Decommit ở đây
    setAdaAmount("");
    setTokenAmounts({});
    setSelectedUnits([]);
  };

  return { connected, adaAmount, setAdaAmount, selectedUnits, setSelectedUnits, tokenAmounts, setTokenAmounts, activeHead, adaBalance, availableTokens, selectedTokens, isLoading, handleMaxAda, handleMaxToken, decommit };
};