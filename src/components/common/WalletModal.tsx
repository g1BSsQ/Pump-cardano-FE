"use client";

import { motion } from "framer-motion";
import { Wallet, ExternalLink, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet, useWalletList, useAddress, useLovelace } from "@meshsdk/react";
import Image from "next/image";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { connect, connecting, connected, disconnect } = useWallet();
  const walletList = useWalletList();
  const address = useAddress();
  const balance = useLovelace();

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";
    return `${fullAddress.slice(0, 8)}...${fullAddress.slice(-6)}`;
  };

  const formatBalance = (lovelace: string) => {
    if (!lovelace) return "0";
    return (Number(lovelace) / 1000000).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-panel border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {connected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Connected Successfully</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {getShortAddress(address || "")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance: {formatBalance(balance || "0")} ADA
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    disconnect();
                    onClose();
                  }}
                  className="flex-1 gap-2"
                >
                  <Power className="w-4 h-4" />
                  Disconnect
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Choose your Cardano wallet to connect
              </p>

              {walletList.length > 0 ? (
                walletList.map((wallet, index) => (
                  <motion.button
                    key={wallet.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleConnect(wallet.name)}
                    disabled={connecting}
                    className="w-full p-4 rounded-lg glass-panel hover:card-hover transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{wallet.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Version {wallet.version}
                        </p>
                      </div>
                      {connecting && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No wallets detected</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please install a Cardano wallet extension
                  </p>
                </div>
              )}

              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have a wallet?{" "}
                  <a
                    href="https://docs.cardano.org/new-to-cardano/getting-started-wallet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Learn more <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

