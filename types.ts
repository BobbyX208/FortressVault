export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultData {
  entries: PasswordEntry[];
  lastExport?: number;
}

export interface EncryptedVault {
  data: string; // Base64 string containing salt + iv + ciphertext
  checksum: string; // Simple hash to verify integrity before full decrypt
}

export enum ViewState {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  ONBOARDING = 'ONBOARDING' // First time setup
}
