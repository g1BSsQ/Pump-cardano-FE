import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { pinata } from "@/lib/config";
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

      // Step 1: Upload file to IPFS
      const urlRes = await fetch("/api/upload");

      if (!urlRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { url } = await urlRes.json();
      const uploadRes = await pinata.upload.public.file(file).url(url);
      const cid = uploadRes.cid || "";

      setStatus("minting");

      // Step 2: Create bonding curve pool
      console.log('\n🚀 Creating Pump.fun Pool with Bonding Curve...\n');

      const blockchainProvider = new BlockfrostProvider(
        process.env.BLOCKFROST_API_KEY || 'preprodx5cQKfPVxM066Svrll0DLWjl1Zh4IBeE'
      );

      const walletAddress = await wallet.getChangeAddress();
      console.log('📍 Wallet Address:', walletAddress);

      const utxos = await wallet.getUtxos();
      if (utxos.length === 0) {
        throw new Error('❌ No UTxOs available. Please fund your wallet first.');
      }

      const referenceUtxo = utxos[0];

      const lovelaceAmount = referenceUtxo.output.amount.find(
        (a: Asset) => a.unit === 'lovelace'
      )?.quantity;

      console.log('🔐 Consuming UTxO:', {
        txHash: referenceUtxo.input.txHash,
        outputIndex: referenceUtxo.input.outputIndex,
        lovelace: lovelaceAmount
      });

      const validator = blueprint.validators.find(
        (v) => v.title === 'pump.pump.mint'
      );

      if (!validator) {
        throw new Error('pump.pump.mint validator not found in plutus.json');
      }

      const params = [
        referenceUtxo.input.txHash,
        referenceUtxo.input.outputIndex
      ];

      const scriptCbor = applyParamsToScript(validator.compiledCode, params);
      const policyId = resolveScriptHash(scriptCbor, 'V3');

      const script: PlutusScript = {
        code: scriptCbor,
        version: "V3",
      };
      const { address: scriptAddress } = serializePlutusScript(script, undefined, 0);

      console.log('🔑 Policy ID:', policyId);
      console.log('🏊 Pool Address (Script):', scriptAddress);

      const tokenName = formData.name.replace(/\s+/g, "");
      const tokenQuantity = formData.amount.toString();
      const assetNameHex = Buffer.from(tokenName).toString('hex');

      console.log(`🪙 Minting ${parseInt(tokenQuantity).toLocaleString()}x ${tokenName}...`);

      const ownerPubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const cip25Metadata = {
        [policyId]: {
          [tokenName]: {
            name: formData.name,
            image: `${cid}`,
            mediaType: file.type || "image/jpg",
            description: formData.description,
          },
        },
      };

      const slope = 1_000_000;
      const initialSupply = 0;

      const poolDatum = mConStr0([
        policyId,
        assetNameHex,
        slope,
        initialSupply,
        ownerPubKeyHash,
      ]);

      console.log('\n🔨 Building transaction...');

      const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
      });

      const mintRedeemer = mConStr0([]);

      const collateralUtxo = utxos.find(
        (u) => {
          const lovelace = u.output.amount.find((a: Asset) => a.unit === 'lovelace');
          const hasOnlyAda = u.output.amount.length === 1 && lovelace;
          const hasEnoughAda = lovelace && Number(lovelace.quantity) >= 5000000;
          return hasOnlyAda && hasEnoughAda;
        }
      );

      if (!collateralUtxo) {
        throw new Error('No suitable collateral UTxO found (need pure ADA UTxO with at least 5 ADA)');
      }

      const collateralLovelace = collateralUtxo.output.amount.find(
        (a: Asset) => a.unit === 'lovelace'
      )?.quantity;

      console.log('💰 Using collateral:', {
        txHash: collateralUtxo.input.txHash.substring(0, 16) + '...',
        lovelace: collateralLovelace
      });

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
        .mintRedeemerValue(mintRedeemer)
        .txInCollateral(
          collateralUtxo.input.txHash,
          collateralUtxo.input.outputIndex,
          collateralUtxo.output.amount,
          collateralUtxo.output.address
        )
        .txOut(scriptAddress, [
          { unit: 'lovelace', quantity: '5000000' },
          { unit: policyId + assetNameHex, quantity: tokenQuantity }
        ])
        .txOutInlineDatumValue(poolDatum)
        .metadataValue(721, cip25Metadata)
        .changeAddress(walletAddress)
        .complete();

      console.log('✅ Transaction built successfully');
      console.log('✍️  Signing transaction...');
      const signedTx = await wallet.signTx(txBuilder.txHex);

      console.log('📤 Submitting transaction...');
      const txHashResult = await wallet.submitTx(signedTx);

      setTxHash(txHashResult);
      setStatus("success");

    } catch (e) {
      console.log(e);
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
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