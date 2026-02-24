export interface UserProfile {
  walletAddress: string;
  username: string;
  bio: string;
  avatar?: string;
  createdAt: string;
}

export interface TokenHolding {
  assetId: string;
  amount: string;
}

export interface TokenInfo {
  assetId: string;
  tokenName: string;
  ticker: string;
  logoUrl?: string;
  currentPrice: string;
  decimals: number;
}
