"use client";

import { useState } from "react";
import { useCreateToken } from "../hooks/useCreateToken";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const CreateTokenForm = () => {
  // Form state (UI-specific)
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetQuantity, setAssetQuantity] = useState(1);
  const [ticker, setTicker] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  // Business logic from hook
  const { walletState, formState, status, txHash, error, actions } = useCreateToken();

  const handleCreateToken = () => {
    actions.createToken({
      name: assetName,
      ticker,
      description: assetDescription,
      amount: assetQuantity
    });
  };

  const isValid = walletState.connected && formState.file && assetName.trim() && assetDescription.trim();

  // Show success screen
  if (status === "success") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-success">Token Created Successfully!</h1>
          <p className="text-muted-foreground">Your bonding curve pool is now live on Cardano</p>
        </motion.div>

        <Card className="glass-panel max-w-2xl mx-auto">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Transaction Hash</p>
              <p className="font-mono text-xs bg-secondary p-3 rounded break-all">{txHash}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Token Name</p>
                <p className="font-medium">{assetName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Supply</p>
                <p className="font-medium">{assetQuantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bonding Curve</p>
                <p className="font-medium">Price = Supply × 1 ADA</p>
              </div>
              <div>
                <p className="text-muted-foreground">Initial Price</p>
                <p className="font-medium">0 ADA</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your token is now live with a bonding curve! As people buy, the price increases automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {/* Image Upload Section */}
            <ImageUpload
              file={formState.file}
              previewUrl={formState.previewUrl}
              onFileSelect={actions.handleFileSelect}
              onRemoveFile={() => actions.setFile(undefined)}
            />
            {/* Form Fields */}
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

            {/* Social Links */}
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

            {/* Create Button */}
            <Button
              onClick={handleCreateToken}
              disabled={status === "uploading" || status === "minting" || !isValid}
              className="w-full"
              size="lg"
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : status === "minting" ? (
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

            {/* Error Messages */}
            {!walletState.connected && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                Please connect your wallet first
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};


