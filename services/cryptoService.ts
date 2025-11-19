import { VaultData } from '../types';

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits for GCM is standard

// Helper to encode/decode
const enc = new TextEncoder();
const dec = new TextDecoder();

// Base64 helpers
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random salt
function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

// Derive a key from password and salt
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVault(data: VaultData, password: string): Promise<string> {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedData = enc.encode(JSON.stringify(data));

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedData
  );

  // Combine Salt + IV + Ciphertext for storage
  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  return bufferToBase64(combined.buffer);
}

export async function decryptVault(base64Data: string, password: string): Promise<VaultData> {
  const buffer = base64ToBuffer(base64Data);
  const bytes = new Uint8Array(buffer);

  if (bytes.length < SALT_LENGTH + IV_LENGTH) {
    throw new Error("Invalid data length");
  }

  const salt = bytes.slice(0, SALT_LENGTH);
  const iv = bytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const data = bytes.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      data
    );

    return JSON.parse(dec.decode(decrypted));
  } catch (e) {
    throw new Error("Incorrect password or corrupted data");
  }
}
