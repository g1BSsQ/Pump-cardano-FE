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
}

// Status types for token creation process
export type CreationStatus = "idle" | "uploading" | "minting" | "success" | "error";

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
  actions: {
    createToken: (formData: TokenFormData) => Promise<void>;
    handleFileSelect: (selectedFile: File) => void;
    setFile: (file: File | undefined) => void;
  };
}