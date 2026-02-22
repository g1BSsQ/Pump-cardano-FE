export interface BridgeAsset {
  unit: string;
  ticker: string;
  name?: string; // Thêm tên đầy đủ
  logoUrl?: string; // Thêm trường ảnh
  decimals: number;
  balance: string;
  rawBalance: string;
}

export interface HydraHead {
  port: number;
  status: 'Idle' | 'Initializing' | 'Open' | 'Closed' | 'FanoutPossible';
}

export interface DepositHook {
  connected: boolean;
  adaAmount: string;
  setAdaAmount: (val: string) => void;

  // tokens selected for bridging
  selectedUnits: string[];
  setSelectedUnits: (vals: string[]) => void;
  tokenAmounts: { [unit: string]: string };
  setTokenAmounts: (obj: { [unit: string]: string }) => void;

  adaBalance: string;
  availableTokens: BridgeAsset[];
  selectedTokens: BridgeAsset[]; // resolved assets for convenience
  isLoading: boolean;
  handleMaxAda: () => void;
  handleMaxToken: (unit: string) => void;
  deposit: () => Promise<void>;
}

export interface DecommitHook {
  connected: boolean;
  adaAmount: string;
  setAdaAmount: (val: string) => void;

  selectedUnits: string[];
  setSelectedUnits: (vals: string[]) => void;
  tokenAmounts: { [unit: string]: string };
  setTokenAmounts: (obj: { [unit: string]: string }) => void;

  activeHead: HydraHead | null;
  adaBalance: string;
  availableTokens: BridgeAsset[];
  selectedTokens: BridgeAsset[];
  isLoading: boolean;
  handleMaxAda: () => void;
  handleMaxToken: (unit: string) => void;
  decommit: () => Promise<void>;
}