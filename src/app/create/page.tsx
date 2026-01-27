"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { pinata } from "@/utils/config";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Coins, Loader2, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

// --- 1. ĐỊNH NGHĨA TYPE CHO BLUEPRINT & ASSETS ---

// Định nghĩa cấu trúc cho Asset trong UTXO (Mesh SDK trả về)
interface Asset {
  unit: string;
  quantity: string;
}

// Định nghĩa cấu trúc cho Validator trong plutus.json
interface ValidatorParameter {
  title: string;
  schema: {
    $ref: string;
  };
}

interface PlutusValidator {
  title: string;
  compiledCode: string;
  hash: string;
  parameters?: ValidatorParameter[];
}

interface PlutusBlueprint {
  validators: PlutusValidator[];
}

// Ép kiểu dữ liệu JSON về Interface
const blueprint = blueprintData as PlutusBlueprint;

// ------------------------------------------------

export default function CreateTokenPage() {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetQuantity, setAssetQuantity] = useState(1);
  const [ticker, setTicker] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ipfsHash, setIpfsHash] = useState(""); // Giữ lại nếu cần dùng sau này

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

  const removeFile = () => {
    setFile(undefined);
    setPreviewUrl("");
  };

  const createToken = async () => {
    if (!connected || !wallet) return alert("Connect wallet first");
    if (!file) return alert("Please select an image file");
    if (!assetName.trim()) return alert("Enter asset name");
    if (!assetDescription.trim()) return alert("Enter token description");

    try {
      setMinting(true);

      // Step 1: Upload file to IPFS
      setUploading(true);
      const urlRes = await fetch("/api/upload");

      if (!urlRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { url } = await urlRes.json();
      const uploadRes = await pinata.upload.public.file(file).url(url);
      const cid = uploadRes.cid || "";
      setIpfsHash(cid);
      setUploading(false);

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
      
      // FIX: Định nghĩa kiểu cụ thể cho 'a' thay vì any
      const lovelaceAmount = referenceUtxo.output.amount.find(
        (a: Asset) => a.unit === 'lovelace'
      )?.quantity;

      console.log('🔐 Consuming UTxO:', {
        txHash: referenceUtxo.input.txHash,
        outputIndex: referenceUtxo.input.outputIndex,
        lovelace: lovelaceAmount
      });

      // FIX: blueprint.validators đã được định nghĩa kiểu ở trên, không cần any
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

      const tokenName = assetName.replace(/\s+/g, "");
      const tokenQuantity = assetQuantity.toString();
      const assetNameHex = Buffer.from(tokenName).toString('hex');

      console.log(`🪙 Minting ${parseInt(tokenQuantity).toLocaleString()}x ${tokenName}...`);

      const ownerPubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const cip25Metadata = {
        [policyId]: {
          [tokenName]: {
            name: assetName,
            image: `${cid}`,
            mediaType: file.type || "image/jpg",
            description: assetDescription,
            ...(ticker && { ticker }),
            ...(twitter && { twitter }),
            ...(telegram && { telegram }),
            ...(website && { website }),
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
          // FIX: Định nghĩa kiểu cụ thể cho 'a' thay vì any
          const lovelace = u.output.amount.find((a: Asset) => a.unit === 'lovelace');
          const hasOnlyAda = u.output.amount.length === 1 && lovelace;
          const hasEnoughAda = lovelace && Number(lovelace.quantity) >= 5000000;
          return hasOnlyAda && hasEnoughAda;
        }
      );

      if (!collateralUtxo) {
        throw new Error('No suitable collateral UTxO found (need pure ADA UTxO with at least 5 ADA)');
      }

      // FIX: Định nghĩa kiểu cụ thể cho 'a' thay vì any
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
      const txHash = await wallet.submitTx(signedTx);

      setTxHash(txHash);
      setMinting(false);

      alert("Pump pool created successfully!");
    } catch (e) {
      console.log(e);
      setUploading(false);
      setMinting(false);
      alert("Token creation failed: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const isValid = connected && file && assetName.trim() && assetDescription.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold gradient-text">Create Your Token</h1>
        <p className="text-xl text-muted-foreground">
          Launch your meme coin with a bonding curve on Cardano
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Create Bonding Curve Pool
            </CardTitle>
            <CardDescription>
              Fill in your token details and create a bonding curve pool for automatic price discovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Token Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {!previewUrl ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG, GIF up to 5MB
                      </p>
                      <p className="text-xs text-primary mt-1 font-medium">
                        Recommended: 256×256px or 512×512px PNG with transparent background
                      </p>
                    </label>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Token preview"
                        className="w-64 h-64 mx-auto rounded-lg object-cover border-2 shadow-xl"
                      />
                      <button
                        onClick={removeFile}
                        className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/80 transition-colors shadow-lg"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-primary">
                        Selected: {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file?.size && (file.size / 1024 / 1024).toFixed(2))} MB
                      </p>
                      <div className="flex gap-2 justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0])}
                          className="hidden"
                          id="file-reupload"
                        />
                        <label htmlFor="file-reupload">
                          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                            <span>Change Image</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Token Name *</Label>
                <Input
                  id="asset-name"
                  placeholder="e.g., My Awesome Token"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  placeholder="MOON"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-description">Description *</Label>
              <Textarea
                id="asset-description"
                placeholder="Describe your token..."
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-quantity">Quantity *</Label>
              <Input
                id="asset-quantity"
                type="number"
                min="1"
                placeholder="1"
                value={assetQuantity}
                onChange={(e) => setAssetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Social Links (Optional)</Label>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  placeholder="Twitter URL"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
                <Input
                  placeholder="Telegram URL"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
                <Input
                  placeholder="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={createToken}
              disabled={minting || uploading || !isValid}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : minting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting Token...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Bonding Curve Pool
                </>
              )}
            </Button>

            {!connected && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                Please connect your wallet first
              </div>
            )}

            {txHash && (
              <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  Pump Pool Created Successfully!
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-xs bg-secondary p-2 rounded break-all">
                    TX: {txHash}
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonding Curve:</span>
                      <span className="font-mono">Price = Supply × 1 ADA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Supply:</span>
                      <span>{assetQuantity.toLocaleString()} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Price:</span>
                      <span>0 ADA</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your token is now live with a bonding curve! As people buy, the price increases automatically.
                  </p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6"
      >
        <h3 className="font-semibold mb-4">How it works:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium">Fill Details</h4>
              <p className="text-muted-foreground">Enter token name, description, and upload image</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium">Create Pool</h4>
              <p className="text-muted-foreground">Smart contract creates bonding curve pool with your tokens</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium">Live Trading</h4>
              <p className="text-muted-foreground">Token goes live with automatic price discovery</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <h4 className="font-medium mb-2">Bonding Curve Explained</h4>
          <p className="text-sm text-muted-foreground">
            Your token starts with a bonding curve where price = current supply × 1 ADA.
            As more people buy, the price increases automatically. When the curve reaches maturity,
            your token graduates to full DEX liquidity.
          </p>
        </div>
        <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
          <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">💡 Image Tips for Meme Tokens</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Size:</strong> 256×256px or 512×512px (square aspect ratio)</li>
            <li>• <strong>Format:</strong> PNG with transparent background works best</li>
            <li>• <strong>Quality:</strong> High resolution, clear and recognizable from small sizes</li>
            <li>• <strong>Style:</strong> Simple, bold designs work great for meme tokens</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}