import React, { useState, useEffect } from 'react';
import { PasswordEntry } from '../types';
import { Icons } from '../constants';
import { generatePassphrase } from '../services/generatorService';
import StrengthMeter from './StrengthMeter';

interface EntryFormProps {
  initialData?: PasswordEntry;
  onSave: (entry: PasswordEntry) => void;
  onCancel: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      title,
      username,
      password,
      url,
      notes,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now()
    });
  };

  const generateNew = () => {
    setPassword(generatePassphrase());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        {initialData ? 'Edit Password' : 'Add New Password'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
        <input 
          type="text" required 
          name="title" // Helpful for managers to identify the record
          autoComplete="off"
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="e.g. Google Account"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Username / Email</label>
        <input 
          type="text" required
          name="username"
          autoComplete="username" // Triggers browser username management
          value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="user@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
        <div className="relative flex items-center">
          <input 
            type={showPassword ? "text" : "password"} 
            required
            name="password"
            autoComplete="new-password" // Triggers browser 'save password' prompt
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-l px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Secret password"
          />
           <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2.5 border-y border-r border-slate-700"
            title="Toggle Visibility"
          >
            <Icons.Eye className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={generateNew}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 rounded-r font-medium flex items-center gap-1"
            title="Generate Passphrase"
          >
            <Icons.Wand className="w-5 h-5" />
          </button>
        </div>
        <StrengthMeter password={password} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Website URL (Optional)</label>
        <input 
          type="url"
          name="url"
          autoComplete="url"
          value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Notes (Optional)</label>
        <textarea 
          value={notes} onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="Additional security questions, pins, etc."
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          type="button" onClick={onCancel}
          className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors flex items-center gap-2"
        >
          <Icons.Save className="w-4 h-4" />
          Save Entry
        </button>
      </div>
    </form>
  );
};

export default EntryForm;