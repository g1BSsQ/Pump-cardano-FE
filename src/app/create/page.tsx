"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CreateCoin = () => {
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
  });
  const [image, setImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValid = formData.name && formData.ticker && formData.description && image;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold gradient-text">Launch Your Token</h1>
        <p className="text-muted-foreground">
          Create your meme coin on Cardano in seconds. No coding required.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 space-y-6"
      >
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Token Image *</label>
          <div className="flex items-start gap-4">
            <label className={cn(
              "w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50",
              image ? "border-primary bg-primary/5" : "border-border"
            )}>
              {image ? (
                <img src={image} alt="Token" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground text-center">
                    Click to upload<br />image
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <div className="flex-1 text-xs text-muted-foreground space-y-1">
              <p>Recommended: 400x400px, PNG or JPG</p>
              <p>Max file size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Token Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Moon Rocket"
              className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ticker Symbol *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleInputChange}
                placeholder="MOON"
                maxLength={10}
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors uppercase"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell the world about your meme coin..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Social Links (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="Twitter URL"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              placeholder="Telegram URL"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Website URL"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">How it works</p>
            <p className="text-muted-foreground">
              Your token will be created with a bonding curve. As people buy, the price increases.
              Once the bonding curve reaches 100%, your token graduates to DEX trading with full liquidity.
            </p>
          </div>
        </div>

        {/* Submit */}
        <Button
          variant="neon"
          size="xl"
          className="w-full"
          disabled={!isValid}
        >
          <Sparkles className="w-5 h-5" />
          Create Token (0.5 ADA)
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By creating a token, you agree to our Terms of Service and acknowledge the risks of meme coins.
        </p>
      </motion.div>
    </div>
  );
};

export default CreateCoin;