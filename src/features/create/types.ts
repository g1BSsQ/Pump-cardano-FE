// src/features/create/types.ts

// Define structure for Asset in UTXO (returned by Mesh SDK)
export interface Asset {
  unit: string;
  quantity: string;
}

// Define structure for Validator in plutus.json
export interface ValidatorParameter {
  title: string;
  schema: {
    $ref: string;
  };
}

export interface PlutusValidator {
  title: string;
  compiledCode: string;
  hash: string;
  parameters?: ValidatorParameter[];
}

export interface PlutusBlueprint {
  validators: PlutusValidator[];
}

// Form data for token creation
export interface TokenFormData {
  name: string;
  ticker: string;
  description: string;
  amount: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

// Status types for token creation process
export type CreationStatus = 
  | "idle" 
  | "uploading" 
  | "minting"
  | "awaiting_confirmation" 
  | "minted" 
  | "depositing" 
  | "success" 
  | "error";

// Token info after minting
export interface MintedTokenInfo {
  policyId: string;
  tokenName: string;
  assetNameHex: string;
  txHash: string;
}

// Hook return type
export interface UseCreateTokenReturn {
  walletState: {
    connected: boolean;
  };
  formState: {
    file: File | undefined;
    previewUrl: string;
  };
  status: CreationStatus;
  txHash: string;
  error: string;
  mintedToken: MintedTokenInfo | null;
  actions: {
    createToken: (formData: TokenFormData) => Promise<void>;
    handleFileSelect: (selectedFile: File) => void;
    setFile: (file: File | undefined) => void;
  };
}

export interface Head {
  port: number;
  headId: string | null;
  status: 'Idle' | 'Initializing' | 'Open' | 'Closed' | 'FanoutPossible';
  lastUpdated: string;
}

export interface Token {
  assetId: string;
  policyId: string;
  tokenNameHex: string;
  tokenName: string;
  ticker: string;
  totalSupply: string;
  decimals: number;
  ownerAddress: string;
  txHash: string;
  logoUrl?: string;
  description?: string;
  socialLinks?: Record<string, string>;
  createdAt: string;
  
  // THÊM OBJECT POOL VÀO ĐÂY
  pool?: {
    currentPrice: string;
    marketCap: string;
    volume24h: string;
    priceChange24h: number;
    headPort: number | null;
    status: string;
  };
}

export interface TokensResponse {
  data: Token[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}