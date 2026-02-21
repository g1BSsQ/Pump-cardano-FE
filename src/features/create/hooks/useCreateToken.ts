import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { pinata } from "@/lib/config";
import axios from "axios"; 
import {
  MeshTxBuilder,
  BlockfrostProvider,
  applyParamsToScript,
  mConStr0,
  resolveScriptHash,
  PlutusScript,
  serializePlutusScript,
  deserializeAddress,
} from "@meshsdk/core";
import blueprintData from "@/../plutus.json";
import type {
  Asset,
  PlutusBlueprint,
  TokenFormData,
  CreationStatus, // Nhớ thêm "awaiting_confirmation" vào type này nhé
  UseCreateTokenReturn,
  MintedTokenInfo
} from "../types";

const blueprint = blueprintData as PlutusBlueprint;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useCreateToken = (): UseCreateTokenReturn => {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [status, setStatus] = useState<CreationStatus | "awaiting_confirmation">("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [mintedToken, setMintedToken] = useState<MintedTokenInfo | null>(null);

  const { wallet, connected } = useWallet();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [file]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // ====================================================================
  // BƯỚC 2: MINT TOKEN VÀ CHỜ ON-CHAIN XÁC NHẬN
  // ====================================================================
  const createToken = async (formData: TokenFormData) => {
    if (!connected || !wallet) { setError("Connect wallet first"); return; }
    if (!file) { setError("Please select an image file"); return; }
    if (!formData.name.trim()) { setError("Enter asset name"); return; }
    if (!formData.ticker?.trim()) { setError("Enter ticker symbol"); return; }
    if (!formData.description.trim()) { setError("Enter token description"); return; }

    const utxos = await wallet.getUtxos();
    const totalLovelace = utxos.reduce((sum, utxo) => {
      const lovelace = utxo.output.amount.find((a: Asset) => a.unit === 'lovelace');
      return sum + Number(lovelace?.quantity || 0);
    }, 0);
    
    if (totalLovelace < 15000000) {
      setError("Insufficient balance. Need at least 15 ADA.");
      return;
    }

    try {
      setStatus("uploading");
      setError("");

      const urlRes = await fetch("/api/upload");
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { url } = await urlRes.json();
      const uploadRes = await pinata.upload.public.file(file).url(url);
      const cid = uploadRes.cid || "";

      setStatus("minting");

      const blockchainProvider = new BlockfrostProvider(
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || 'preprodx5cQKfPVxM066Svrll0DLWjl1Zh4IBeE'
      );

      const walletAddress = await wallet.getChangeAddress();
      const freshUtxos = await wallet.getUtxos();
      if (freshUtxos.length === 0) throw new Error('No UTxOs available.');

      const referenceUtxo = freshUtxos[0];
      const validator = blueprint.validators.find((v) => v.title === 'pump.pump.mint');
      if (!validator) throw new Error('Validator not found');

      const params = [referenceUtxo.input.txHash, referenceUtxo.input.outputIndex];
      const scriptCbor = applyParamsToScript(validator.compiledCode, params);
      const policyId = resolveScriptHash(scriptCbor, 'V3');
      
      const script: PlutusScript = { code: scriptCbor, version: "V3" };
      const { address: scriptAddress } = serializePlutusScript(script, undefined, 0);

      const tokenName = formData.name.replace(/\s+/g, "");
      const tokenQuantity = formData.amount.toString();
      const assetNameHex = Buffer.from(tokenName).toString('hex');

      const ownerPubKeyHash = deserializeAddress(walletAddress).pubKeyHash;
      const initialSupply = 0;
      const poolDatum = mConStr0([
        policyId,           
        assetNameHex,          
        initialSupply,      
        ownerPubKeyHash,    
      ]);

      const cip25Metadata = {
        [policyId]: {
          [tokenName]: {
            name: formData.name,
            image: `${cid}`,
            mediaType: file.type || "image/jpg",
            description: formData.description,
            ticker: formData.ticker, 
            ...(formData.twitter && { twitter: formData.twitter }),
            ...(formData.telegram && { telegram: formData.telegram }),
            ...(formData.website && { website: formData.website }),
          },
        },
      };

      const txBuilder = new MeshTxBuilder({ fetcher: blockchainProvider, submitter: blockchainProvider });
      
      const collateralUtxo = freshUtxos.find(u => {
        const lovelace = u.output.amount.find((a: Asset) => a.unit === 'lovelace');
        const hasOnlyAda = u.output.amount.length === 1 && lovelace;
        return hasOnlyAda && Number(lovelace.quantity) >= 5000000;
      });
      
      if (!collateralUtxo) throw new Error('No suitable collateral found');

      await txBuilder
        .selectUtxosFrom(freshUtxos)
        .txIn(referenceUtxo.input.txHash, referenceUtxo.input.outputIndex, referenceUtxo.output.amount, referenceUtxo.output.address)
        .mintPlutusScriptV3()
        .mint(tokenQuantity, policyId, assetNameHex)
        .mintingScript(scriptCbor)
        .mintRedeemerValue(mConStr0([]))
        .txInCollateral(collateralUtxo.input.txHash, collateralUtxo.input.outputIndex, collateralUtxo.output.amount, collateralUtxo.output.address)
        .metadataValue(721, cip25Metadata)
        .txOut(scriptAddress, [
          { unit: 'lovelace', quantity: '12000000' },
          { unit: policyId + assetNameHex, quantity: tokenQuantity } 
        ])
        .txOutInlineDatumValue(poolDatum)
        .changeAddress(walletAddress)
        .complete();

      const signedTx = await wallet.signTx(txBuilder.txHex);
      const txHashResult = await wallet.submitTx(signedTx);
      setTxHash(txHashResult);
      
      // 1. Treo UI hiển thị đang chờ xác nhận
      setStatus("awaiting_confirmation");

      // 2. Tạm dừng code chờ Blockfrost báo có tx trên block
      await new Promise<void>((resolve) => {
        blockchainProvider.onTxConfirmed(txHashResult, () => resolve());
      });

      // 3. Gọi Backend (truyền thẳng txHashResult)
      try {
        await axios.post(`${API_URL}/tokens/register`, { txHash: txHashResult });
      } catch (err) {
        console.error("Backend register error:", err);
        throw new Error("Lỗi lưu DB, nhưng Token đã được mint trên chain.");
      }

      // 4. Lưu info và chuyển sang bước 3
      setMintedToken({ policyId, tokenName, assetNameHex, txHash: txHashResult });
      setStatus("minted");

    } catch (e: unknown) {
      setStatus("error");
      let errorMessage = "Unknown error";
      if (e instanceof Error) errorMessage = e.message;
      setError(errorMessage);
    }
  };

  // Deposit logic removed: this hook only handles upload + minting now.

  return {
    walletState: { connected },
    formState: { file, previewUrl },
    status: status as CreationStatus,
    txHash,
    error,
    mintedToken,
    actions: { createToken, handleFileSelect, setFile }
  };
};