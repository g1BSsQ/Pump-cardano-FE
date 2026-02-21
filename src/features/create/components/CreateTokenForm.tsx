"use client";

import { useState } from "react";
import { useCreateToken } from "../hooks/useCreateToken";
import { ImageUpload } from "./ImageUpload";
import { Stepper } from "./Stepper";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Loader2, CheckCircle, AlertCircle, Sparkles, ArrowLeft, ArrowRight, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDepositToken } from "../hooks/useDepositToken";

const STEPS = [
  { id: 1, title: "Token Info", description: "Basic details" },
  { id: 2, title: "Mint Token", description: "Mint token on L1" },
  { id: 3, title: "Deposit to Hydra", description: "Commit to L2 Head" },
];

export const CreateTokenForm = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetQuantity] = useState(1_000_000_000);
  const [ticker, setTicker] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const { walletState, formState, status, txHash, error, mintedToken, actions } = useCreateToken();
  const { status: depositStatus, depositTxHash, depositToHead } = useDepositToken();

const isStep1Valid = walletState.connected && formState.file && assetName.trim() && assetDescription.trim() && ticker.trim();
  const [prevStatus, setPrevStatus] = useState(status);

  // Nếu status thay đổi so với lần trước
  if (status !== prevStatus) {
    setPrevStatus(status); // Cập nhật lại prevStatus
    // Chuyển bước nếu thỏa mãn điều kiện
    if (status === "minted" && currentStep === 2) {
      setCurrentStep(3);
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    const isDepositing = depositStatus === "depositing";
    if (currentStep > 1 && status !== "minting" && !isDepositing && status !== "minted") {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMintToken = () => {
    actions.createToken({
      name: assetName,
      ticker,
      description: assetDescription,
      amount: assetQuantity,
      twitter: twitter.trim() || undefined,
      telegram: telegram.trim() || undefined,
      website: website.trim() || undefined
    });
  };

  // final success view
  if (depositStatus === "success") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* keep the stepper in a “step 4” state for the success screen */}
        <Stepper steps={STEPS} currentStep={STEPS.length + 1} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-4xl font-bold text-success">Success!</h1>
          <p className="text-xl text-muted-foreground">Your token is now live and trading on Hydra L2</p>
        </motion.div>

        <Card className="glass-panel max-w-2xl mx-auto">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">L1 Mint Transaction</p>
                <p className="font-mono text-xs bg-secondary p-3 rounded break-all">{txHash}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">L2 Hydra Deposit Transaction</p>
                <p className="font-mono text-xs bg-secondary p-3 rounded break-all">{depositTxHash}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1" size="lg">
                View All Tokens
              </Button>
              <Button onClick={() => (window.location.href = "/create")} className="flex-1" size="lg">
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const backDisabled =
    currentStep === 1 ||
    status === "minting" ||
    status === "awaiting_confirmation" ||
    depositStatus === "depositing" ||
    status === "minted";

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <h1 className="text-4xl font-bold gradient-text">Launch Token on L2</h1>
        <p className="text-lg text-muted-foreground">Mint on Cardano L1 and move liquidity to Hydra</p>
      </motion.div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              {currentStep === 1 && "Token Information"}
              {currentStep === 2 && "Review & Mint Token"}
              {currentStep === 3 && "Commit to Hydra L2"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Fill in your token details"}
              {currentStep === 2 && "Review your information and mint your token on Cardano L1"}
              {currentStep === 3 && "Deposit your L1 token into the Hydra Head for L2 trading"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <ImageUpload file={formState.file} previewUrl={formState.previewUrl} onFileSelect={actions.handleFileSelect} onRemoveFile={() => actions.setFile(undefined)} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Token Name *</Label>
                      <Input placeholder="e.g., My Awesome Token" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ticker Symbol *</Label>
                      <Input placeholder="MOON" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} maxLength={10} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea placeholder="Describe your token..." value={assetDescription} onChange={(e) => setAssetDescription(e.target.value)} rows={4} />
                  </div>
                  
                  {/* Social Links */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Social Links (Optional)
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        placeholder="https://twitter.com/yourtoken"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                      />
                      <Input
                        placeholder="https://t.me/yourtoken"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                      />
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>

                  {!walletState.connected && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm">Please connect your wallet first</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: MINT L1 */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Review Section */}
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {formState.previewUrl && (
                        <div className="flex justify-center">
                          <Image
                            src={formState.previewUrl}
                            alt="Token preview"
                            width={128}
                            height={128}
                            unoptimized
                            className="rounded-lg object-cover border-2"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Token Name</p>
                          <p className="font-semibold">{assetName}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Ticker</p>
                          <p className="font-semibold">{ticker || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Description</p>
                          <p className="text-sm">{assetDescription}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
                          <p className="font-semibold">{assetQuantity.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Initial ADA Deposit</p>
                          <p className="font-semibold">12 ADA (Min)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleMintToken}
                    disabled={
                      status === "uploading" ||
                      status === "minting" ||
                      status === "awaiting_confirmation" ||
                      status === "minted"
                    }
                    className="w-full"
                    size="lg"
                  >
                    {status === "uploading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading to IPFS...
                      </>
                    ) : status === "minting" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Minting on L1 (Please sign)...
                      </>
                    ) : status === "awaiting_confirmation" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Awaiting On-Chain Confirmation (Takes ~20s)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Mint Token on L1
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* STEP 3: COMMIT TO HYDRA L2 */}
              {currentStep === 3 && mintedToken && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Token Minted on L1 Successfully!</h3>
                    <p className="text-sm text-muted-foreground">Now commit your token into the Hydra Head</p>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Almost there!</h4>
                    <p className="text-sm text-muted-foreground">
                      Committing your token to the Hydra Head enables automatic price discovery with zero latency and low fees on L2.
                    </p>
                  </div>

                  <Button
                    onClick={() => depositToHead({ policyId: mintedToken.policyId, assetNameHex: mintedToken.assetNameHex, poolTxHash: mintedToken.txHash, headPort: 4001 })}
                    disabled={depositStatus === "depositing"}
                    className="w-full"
                    size="lg"
                  >
                    {depositStatus === "depositing" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Awaiting L1 Sync & Committing to L2...
                      </>
                    ) : (
                      <> 
                        <Server className="w-4 h-4 mr-2" /> Commit to Hydra L2
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleBack} disabled={backDisabled} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {currentStep === 1 && (
                <Button onClick={handleNext} disabled={!isStep1Valid} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};