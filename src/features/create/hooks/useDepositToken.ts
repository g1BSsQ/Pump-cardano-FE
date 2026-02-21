import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { BlockfrostProvider } from "@meshsdk/core";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface DepositParams {
  policyId: string;
  assetNameHex: string;
  poolTxHash: string; // TxHash của giao dịch Mint L1
  headPort?: number | null; 
}

export const useDepositToken = () => {
  const [status, setStatus] = useState<"idle" | "depositing" | "success" | "error">("idle");
  const [depositTxHash, setDepositTxHash] = useState("");
  const [error, setError] = useState("");
  
  const { wallet, connected } = useWallet();

  const depositToHead = async (params: DepositParams) => {
    if (!connected || !wallet) {
      setError("Vui lòng kết nối ví trước");
      return;
    }

    try {
      setStatus("depositing");
      setError("");

      const walletAddress = await wallet.getChangeAddress();

      // 1. GỌI BACKEND XIN GIAO DỊCH BLUEPRINT (Đã kết hợp với Hydra)
      const buildRes = await axios.post(`${API_URL}/tokens/build-deposit-tx`, {
        walletAddress,
        poolTxHash: params.poolTxHash,
        policyId: params.policyId,
        assetNameHex: params.assetNameHex,
        headPort: params.headPort, 
      });

      const txHex = buildRes.data.txHex;
      if (!txHex) throw new Error("Backend không trả về giao dịch hợp lệ.");

      // 2. KÝ GIAO DỊCH BẰNG VÍ NGƯỜI DÙNG (partialSign = true)
      // Lý do: Backend (alice-node) có thể đã ký trước, ta chỉ ký thêm phần của user
      const signedTx = await wallet.signTx(txHex, true);
      
      // 3. PUSH GIAO DỊCH LÊN CARDANO L1
      const txHashResult = await wallet.submitTx(signedTx);
      setDepositTxHash(txHashResult);

      // 4. CHỜ GIAO DỊCH ĐƯỢC XÁC NHẬN ON-CHAIN
      const blockchainProvider = new BlockfrostProvider(
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || 'preprodx5cQKfPVxM066Svrll0DLWjl1Zh4IBeE'
      );
      
      await new Promise<void>((resolve) => {
        blockchainProvider.onTxConfirmed(txHashResult, () => resolve());
      });

      // 5. BÁO LẠI CHO BACKEND LÀ ĐÃ DEPOSIT THÀNH CÔNG ĐỂ GÁN HEAD
      const assetId = params.policyId + params.assetNameHex;
      await axios.patch(`${API_URL}/tokens/${assetId}/head`, {
        headPort: params.headPort
      });

      setStatus("success");

    } catch (e: unknown) {
      setStatus("error");
      let errorMessage = "Lỗi không xác định";
      if (e instanceof Error) errorMessage = e.message;
      if (axios.isAxiosError(e)) errorMessage = e.response?.data?.message || errorMessage;
      setError(`L2 Deposit Failed: ${errorMessage}`);
    }
  };

  return {
    status,
    depositTxHash,
    error,
    depositToHead
  };
};