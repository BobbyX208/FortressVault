import React, { useState } from 'react';
import { PasswordEntry } from '../types';
import { Icons } from '../constants';

interface EntryListProps {
  entries: PasswordEntry[];
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Track which specific item and field is copied to show feedback
  const [copiedState, setCopiedState] = useState<{id: string, field: 'username' | 'password'} | null>(null);

  const filtered = entries.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string, id: string, field: 'username' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedState({ id, field });
    setTimeout(() => setCopiedState(null), 2000);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Icons.Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search vault..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No entries found.
          </div>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-3">
                 <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-100 text-lg truncate mb-1">{entry.title}</h3>
                    {entry.url && (
                      <a 
                        href={entry.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-emerald-400 hover:underline block truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {new URL(entry.url).hostname}
                      </a>
                    )}
                 </div>
                 <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                      title="Edit"
                    >
                      <Icons.Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this entry?')) onDelete(entry.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                      title="Delete"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Credentials Grid */}
              <div className="bg-slate-900/50 rounded p-3 space-y-2">
                {/* Username Row */}
                <div className="flex items-center justify-between group/row">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs text-slate-500 uppercase font-semibold w-16 flex-shrink-0">User</span>
                    <span className="text-slate-300 truncate text-sm select-all font-mono">{entry.username}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(entry.username, entry.id, 'username')}
                    className="text-slate-500 hover:text-white transition-colors flex-shrink-0 ml-2"
                    title="Copy Username"
                  >
                     {copiedState?.id === entry.id && copiedState?.field === 'username' ? (
                        <span className="text-xs font-bold text-emerald-500">Copied</span>
                     ) : (
                        <Icons.Copy className="w-4 h-4" />
                     )}
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between group/row">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs text-slate-500 uppercase font-semibold w-16 flex-shrink-0">Pass</span>
                    <span className="text-slate-500 text-sm font-mono tracking-widest">••••••••••••</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(entry.password, entry.id, 'password')}
                    className="text-slate-500 hover:text-white transition-colors flex-shrink-0 ml-2"
                    title="Copy Password"
                  >
                     {copiedState?.id === entry.id && copiedState?.field === 'password' ? (
                        <span className="text-xs font-bold text-emerald-500">Copied</span>
                     ) : (
                        <Icons.Copy className="w-4 h-4" />
                     )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntryList;