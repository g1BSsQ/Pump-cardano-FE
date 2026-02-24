import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { Transaction, resolveTxHash } from "@meshsdk/core";
import axios from "axios";
import { BridgeAsset, DepositHook } from "../types";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useDeposit = (): DepositHook => {
  const { connected, wallet } = useWallet();
  const { toast } = useToast();
  
  const [adaAmount, setAdaAmount] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [tokenAmounts, setTokenAmounts] = useState<{ [unit: string]: string }>({});
  const [allAssets, setAllAssets] = useState<BridgeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch data tài sản L1
  useEffect(() => {
    const fetchL1Data = async () => {
      if (!connected || !wallet) {
        setAllAssets([]);
        return;
      }
      setIsLoading(true);
      try {
        const [tokensRes, l1Balances] = await Promise.all([
          axios.get(`${API_URL}/tokens?limit=100`),
          wallet.getBalance()
        ]);

        let dbTokens = tokensRes.data.data || [];
        // if list entries lack logoUrl, fetch individual details
        const enriched = await Promise.all(dbTokens.map(async (t: any) => {
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
        
        const mapped: BridgeAsset[] = [
          {
            unit: "lovelace",
            ticker: "ADA",
            name: "Cardano",
            logoUrl: "/ada-logo.png",
            decimals: 6,
            rawBalance: l1Balances.find(b => b.unit === "lovelace")?.quantity || "0",
            balance: ""
          },
          ...dbTokens.map((t: any) => {
            const inWallet = l1Balances.find(b => b.unit === t.assetId);
            return {
              unit: t.assetId,
              ticker: t.ticker,
              name: t.tokenName,
              logoUrl: t.logoUrl || t.imageUrl || undefined,
              decimals: t.decimals || 0,
              rawBalance: inWallet?.quantity || "0",
              balance: ""
            };
          }).filter((t: any) => Number(t.rawBalance) > 0)
        ].map(asset => ({
          ...asset,
          balance: (Number(asset.rawBalance) / Math.pow(10, asset.decimals)).toLocaleString()
        }));
        setAllAssets(mapped);
      } catch (e) {
        console.error("L1 Fetch Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchL1Data();
  }, [connected, wallet]);

  // 2. KHAI BÁO CÁC BIẾN CẦN THIẾT
  const adaBalance = allAssets.find(a => a.unit === "lovelace")?.balance || "0";
  const availableTokens = allAssets.filter(a => a.unit !== "lovelace");
  const selectedTokens = availableTokens.filter(t => selectedUnits.includes(t.unit));

  // 3. Các hàm Helper xử lý nhập số dư Max
  const handleMaxAda = () => {
    const raw = allAssets.find(a => a.unit === "lovelace")?.rawBalance || "0";
    const max = Math.max(0, (Number(raw) / 1000000) - 2); // Trừ 2 ADA phí
    setAdaAmount(max.toString());
  };

  const handleMaxToken = (unit: string) => {
    const token = availableTokens.find(t => t.unit === unit);
    if (token) {
      const max = Number(token.rawBalance) / Math.pow(10, token.decimals);
      setTokenAmounts(prev => ({ ...prev, [unit]: max.toString() }));
    }
  };

// 4. Hàm Deposit 1 chạm (Gom đủ UTxO)
  const deposit = async () => {
    if (!connected || !wallet) return;
    setIsLoading(true);
    
    try {
      const address = await wallet.getChangeAddress();
      toast({ title: "Đang tính toán...", description: "Đang gom UTxO từ ví..." });

      let reqLovelace = 0;
      if (adaAmount && parseFloat(adaAmount) > 0) {
        reqLovelace = Math.floor(parseFloat(adaAmount) * 1_000_000);
      }

      if (selectedUnits.length > 0 && reqLovelace < 2_000_000) {
        reqLovelace = 2_000_000; // Auto bù minUTxO nếu nạp token
      }

      const commitTokens: { unit: string; quantity: string }[] = [];
      const reqTokens: Record<string, number> = {};
      
      selectedUnits.forEach(unit => {
        const amount = tokenAmounts[unit];
        const tokenInfo = availableTokens.find(t => t.unit === unit);
        if (amount && parseFloat(amount) > 0 && tokenInfo) {
          const rawQuantity = Math.floor(parseFloat(amount) * Math.pow(10, tokenInfo.decimals)).toString();
          commitTokens.push({ unit, quantity: rawQuantity });
          reqTokens[unit] = parseInt(rawQuantity);
        }
      });

      if (reqLovelace === 0 && commitTokens.length === 0) throw new Error("Vui lòng nhập số lượng nạp.");

      // THUẬT TOÁN GOM UTXO (COIN SELECTION)
      const utxos = await wallet.getUtxos();
      const selectedInputs: { txHash: string; outputIndex: number }[] = [];
      let collectedLovelace = 0;
      const collectedTokens: Record<string, number> = {};

      for (const u of utxos) {
        selectedInputs.push({ txHash: u.input.txHash, outputIndex: u.input.outputIndex });
        
        u.output.amount.forEach(a => {
          if (a.unit === 'lovelace') collectedLovelace += parseInt(a.quantity);
          else collectedTokens[a.unit] = (collectedTokens[a.unit] || 0) + parseInt(a.quantity);
        });

        // Kiểm tra xem đã gom đủ chưa
        let isSatisfied = collectedLovelace >= reqLovelace;
        for (const unit in reqTokens) {
          if ((collectedTokens[unit] || 0) < reqTokens[unit]) {
            isSatisfied = false;
            break;
          }
        }
        if (isSatisfied) break; // Đủ tiền rồi thì dừng gom
      }

      // Kiểm tra lại lần cuối xem ví có đủ tiền thật không
      let isFinalSatisfied = collectedLovelace >= reqLovelace;
      for (const unit in reqTokens) {
        if ((collectedTokens[unit] || 0) < reqTokens[unit]) isFinalSatisfied = false;
      }
      if (!isFinalSatisfied) throw new Error("Ví không đủ số dư hoặc UTxO bị phân mảnh. Hãy gửi thêm tài sản vào ví.");

      toast({ title: "Gửi yêu cầu", description: "Yêu cầu Hydra tính toán giao dịch..." });

      const payload = {
        inputs: selectedInputs, // Gửi MẢNG các inputs thay vì 1 cái
        commitLovelace: reqLovelace,
        commitTokens: commitTokens,
        headPort: 4001,
      };
      
      const res = await axios.post(`${API_URL}/users/${address}/deposit/build-tx`, payload);
      const { txHex } = res.data;

      toast({ title: "Ký giao dịch", description: "Vui lòng mở ví để xác nhận. Bạn sẽ thấy tiền thừa được trả lại." });
      const signedTx = await wallet.signTx(txHex, true); 
      const txHash = await wallet.submitTx(signedTx);
      
      toast({ title: "Thành công!", description: `Nạp 1-Chạm thành công. TxHash: ${txHash.substring(0, 10)}...` });
      
      setAdaAmount(""); setTokenAmounts({}); setSelectedUnits([]);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi nạp", description: error.response?.data?.message || error.message || "Đã xảy ra lỗi" });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    connected, 
    adaAmount, setAdaAmount, 
    selectedUnits, setSelectedUnits, 
    tokenAmounts, setTokenAmounts, 
    adaBalance, availableTokens, selectedTokens, 
    isLoading, handleMaxAda, handleMaxToken, deposit 
  };
};