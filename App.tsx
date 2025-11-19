import React, { useState, useEffect, useCallback } from 'react';
import { VaultData, ViewState, PasswordEntry } from './types';
import { encryptVault, decryptVault } from './services/cryptoService';
import { Icons } from './constants';
import EntryList from './components/EntryList';
import EntryForm from './components/EntryForm';

const VAULT_STORAGE_KEY = 'fortress_vault_blob';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [vaultData, setVaultData] = useState<VaultData>({ entries: [] });
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<PasswordEntry | undefined>(undefined);

  // Check for existing vault on mount
  useEffect(() => {
    const existing = localStorage.getItem(VAULT_STORAGE_KEY);
    if (existing) {
      setViewState(ViewState.LOCKED);
    } else {
      setViewState(ViewState.ONBOARDING);
    }
  }, []);

  // Handle Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const blob = localStorage.getItem(VAULT_STORAGE_KEY);
    
    if (!blob) return;

    try {
      const data = await decryptVault(blob, masterPassword);
      setVaultData(data);
      setViewState(ViewState.UNLOCKED);
    } catch (err) {
      setError('Incorrect master password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create New Vault
  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.length < 8) {
      setError('Master password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const initialData: VaultData = { entries: [], lastExport: Date.now() };
      const blob = await encryptVault(initialData, masterPassword);
      localStorage.setItem(VAULT_STORAGE_KEY, blob);
      setVaultData(initialData);
      setViewState(ViewState.UNLOCKED);
    } catch (err) {
      setError('Failed to create vault.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Vault to Storage
  const saveVault = useCallback(async (newData: VaultData) => {
    try {
      const blob = await encryptVault(newData, masterPassword);
      localStorage.setItem(VAULT_STORAGE_KEY, blob);
      setVaultData(newData);
    } catch (err) {
      alert('Failed to encrypt and save vault.');
    }
  }, [masterPassword]);

  // CRUD
  const handleSaveEntry = (entry: PasswordEntry) => {
    const newEntries = currentEntry 
      ? vaultData.entries.map(e => e.id === entry.id ? entry : e)
      : [...vaultData.entries, entry];
    
    saveVault({ ...vaultData, entries: newEntries });
    setIsEditing(false);
    setCurrentEntry(undefined);
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = vaultData.entries.filter(e => e.id !== id);
    saveVault({ ...vaultData, entries: newEntries });
  };

  const handleExport = async () => {
    const blob = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!blob) return;
    const url = URL.createObjectURL(new Blob([blob], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortress-vault-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      // Verify we can decrypt it with current password
      await decryptVault(text, masterPassword);
      localStorage.setItem(VAULT_STORAGE_KEY, text);
      // Reload
      const data = await decryptVault(text, masterPassword);
      setVaultData(data);
      alert('Vault imported successfully!');
    } catch (err) {
      alert('Import failed: The imported vault is encrypted with a different password or is corrupted.');
    }
  };

  // Views
  if (viewState === ViewState.ONBOARDING || viewState === ViewState.LOCKED) {
    const isSetup = viewState === ViewState.ONBOARDING;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
              <Icons.Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            {isSetup ? 'Setup FortressVault' : 'Unlock Vault'}
          </h1>
          <p className="text-slate-400 text-center mb-8 text-sm">
            {isSetup 
              ? 'Create a strong master password. This encrypts your data locally. Do not forget it!' 
              : 'Enter your master password to access your secured entries.'}
          </p>

          <form onSubmit={isSetup ? handleCreateVault : handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Master Password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !masterPassword}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isSetup ? 'Create Vault' : 'Unlock')}
            </button>
          </form>
          {!isSetup && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  if (window.confirm('This will wipe existing data. Are you sure?')) {
                    localStorage.removeItem(VAULT_STORAGE_KEY);
                    setViewState(ViewState.ONBOARDING);
                    setMasterPassword('');
                    setError('');
                  }
                }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Reset / Wipe Vault
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unlocked View
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-slate-900">
              <Icons.Unlock className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">FortressVault</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors" title="Import Vault">
              <input type="file" className="hidden" onChange={handleImport} accept=".txt" />
              <Icons.Upload className="w-5 h-5" />
            </label>
            <button 
              onClick={handleExport}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Export Encrypted Vault"
            >
              <Icons.Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                setViewState(ViewState.LOCKED);
                setMasterPassword('');
                setVaultData({ entries: [] });
              }}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors ml-2"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {isEditing ? (
          <EntryForm 
            initialData={currentEntry} 
            onSave={handleSaveEntry} 
            onCancel={() => {
              setIsEditing(false);
              setCurrentEntry(undefined);
            }} 
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-200">My Passwords</h2>
              <button 
                onClick={() => {
                  setCurrentEntry(undefined);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                <Icons.Plus className="w-4 h-4" />
                New Entry
              </button>
            </div>
            <EntryList 
              entries={vaultData.entries} 
              onEdit={(entry) => {
                setCurrentEntry(entry);
                setIsEditing(true);
              }} 
              onDelete={handleDeleteEntry} 
            />
          </>
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-xs border-t border-slate-800 mt-8">
        <p>FortressVault uses client-side AES-256-GCM encryption.</p>
        <p>Your master password never leaves this browser.</p>
      </footer>
    </div>
  );
};

export default App;
