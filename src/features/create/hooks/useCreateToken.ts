import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { pinata } from "@/lib/config";
import axios from "axios"; // <--- IMPORT AXIOS
import {
  MeshTxBuilder,
  BlockfrostProvider,
  PlutusScript,
  serializePlutusScript,
  applyParamsToScript,
  mConStr0,
  resolveScriptHash,
  deserializeAddress,
} from "@meshsdk/core";
import blueprintData from "@/../plutus.json";
import type {
  Asset,
  PlutusBlueprint,
  TokenFormData,
  CreationStatus,
  UseCreateTokenReturn
} from "../types";

// Cast JSON data to Interface
const blueprint = blueprintData as PlutusBlueprint;

// Cấu hình URL Backend (nếu chạy local thì là localhost:3000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useCreateToken = (): UseCreateTokenReturn => {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [status, setStatus] = useState<CreationStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

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

  const createToken = async (formData: TokenFormData) => {
    if (!connected || !wallet) {
      setError("Connect wallet first");
      return;
    }
    if (!file) {
      setError("Please select an image file");
      return;
    }
    if (!formData.name.trim()) {
      setError("Enter asset name");
      return;
    }
    if (!formData.description.trim()) {
      setError("Enter token description");
      return;
    }

    try {
      setStatus("uploading");
      setError("");

      // --- BƯỚC 1: UPLOAD IPFS (Giữ nguyên) ---
      const urlRes = await fetch("/api/upload");
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      
      const { url } = await urlRes.json();
      const uploadRes = await pinata.upload.public.file(file).url(url);
      const cid = uploadRes.cid || "";

      setStatus("minting");

      // --- BƯỚC 2: BUILD TRANSACTION ---
      const blockchainProvider = new BlockfrostProvider(
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || 'preprodx5cQKfPVxM066Svrll0DLWjl1Zh4IBeE'
      );

      const walletAddress = await wallet.getChangeAddress();
      const utxos = await wallet.getUtxos();
      if (utxos.length === 0) throw new Error('No UTxOs available.');

      const referenceUtxo = utxos[0];
      
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

      const cip25Metadata = {
        [policyId]: {
          [tokenName]: {
            name: formData.name,
            image: `${cid}`, // Lưu format ipfs:// chuẩn
            mediaType: file.type || "image/jpg",
            description: formData.description,
            ticker: formData.ticker, 
            ...(formData.twitter && { twitter: formData.twitter }),
            ...(formData.telegram && { telegram: formData.telegram }),
            ...(formData.website && { website: formData.website }),
          },
        },
      };

      const slope = 1_000_000;
      const initialSupply = 0;
      const poolDatum = mConStr0([
        policyId, assetNameHex, slope, initialSupply, ownerPubKeyHash,
      ]);

      const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
      });

      // Lấy Collateral
      const collateralUtxo = utxos.find(u => {
          const lovelace = u.output.amount.find((a: Asset) => a.unit === 'lovelace');
          return u.output.amount.length === 1 && lovelace && Number(lovelace.quantity) >= 5000000;
      });
      if (!collateralUtxo) throw new Error('No suitable collateral (5 ADA pure) found');

      await txBuilder
        .selectUtxosFrom(utxos)
        .txIn(
          referenceUtxo.input.txHash,
          referenceUtxo.input.outputIndex,
          referenceUtxo.output.amount,
          referenceUtxo.output.address
        )
        .mintPlutusScriptV3()
        .mint(tokenQuantity, policyId, assetNameHex)
        .mintingScript(scriptCbor)
        .mintRedeemerValue(mConStr0([]))
        .txInCollateral(
          collateralUtxo.input.txHash,
          collateralUtxo.input.outputIndex,
          collateralUtxo.output.amount,
          collateralUtxo.output.address
        )
        .txOut(scriptAddress, [
          { unit: 'lovelace', quantity: '3000000' }, // Min ADA cho Script
          { unit: policyId + assetNameHex, quantity: tokenQuantity }
        ])
        .txOutInlineDatumValue(poolDatum)
        .metadataValue(721, cip25Metadata)
        .changeAddress(walletAddress)
        .complete();

      const signedTx = await wallet.signTx(txBuilder.txHex);
      const txHashResult = await wallet.submitTx(signedTx);

      // --- BƯỚC 3: CHỜ TX CONFIRMED ---
      await new Promise<void>((resolve) => {
        blockchainProvider.onTxConfirmed(txHashResult, () => {
          resolve();
        });
      });

      // --- BƯỚC 4: GỌI BACKEND ĐỂ ĐĂNG KÝ ---
      try {
        await axios.post(`${API_URL}/tokens/register`, { txHash: txHashResult });
      } catch (beError) {
        // Backend error không làm gián đoạn TX on-chain thành công
      }
      // ---------------------------------------------------

      setTxHash(txHashResult);
      setStatus("success");

    } catch (e) {
      setStatus("error");
      
      let errorMessage = "Unknown error";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      
      // Map lỗi phổ biến
      if (errorMessage.includes("insufficient")) {
        errorMessage = "Insufficient funds. Please fund your wallet.";
      } else if (errorMessage.includes("balance")) {
        errorMessage = "Wallet balance too low.";
      } else if (errorMessage.includes("Rejected")) {
        errorMessage = "Transaction rejected by wallet.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Transaction confirmation timeout.";
      } else if (errorMessage.includes("No UTxOs")) {
        errorMessage = "No UTxOs available. Please fund your wallet.";
      } else if (errorMessage.includes("collateral")) {
        errorMessage = "No suitable collateral found. Need 5 ADA minimum.";
      }
      
      setError(errorMessage);
    }
  };

  return {
    walletState: { connected },
    formState: { file, previewUrl },
    status,
    txHash,
    error,
    actions: { createToken, handleFileSelect, setFile }
  };
};