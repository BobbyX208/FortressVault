import React, { useMemo } from 'react';

interface StrengthMeterProps {
  password: string;
}

const StrengthMeter: React.FC<StrengthMeterProps> = ({ password }) => {
  // Use zxcvbn from global scope (loaded via CDN)
  const result = useMemo(() => {
    if (!password) return { score: 0, feedback: { warning: '', suggestions: [] } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const z = (window as any).zxcvbn;
    return z ? z(password) : { score: 0, feedback: { warning: 'Loading library...', suggestions: [] } };
  }, [password]);

  const getColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-600';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-emerald-500';
      default: return 'bg-slate-700';
    }
  };

  const label = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][result.score];

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Strength: <span className="font-semibold text-slate-200">{label}</span></span>
        {result.crack_times_display && (
          <span>Crack time: {result.crack_times_display.offline_slow_hashing_1e4_per_second}</span>
        )}
      </div>
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
        <div 
          className={`h-full transition-all duration-300 ${getColor(result.score)}`} 
          style={{ width: `${((result.score + 1) / 5) * 100}%` }}
        />
      </div>
      {(result.feedback.warning || result.feedback.suggestions.length > 0) && (
        <div className="text-xs text-slate-400 mt-1">
          {result.feedback.warning && <p className="text-red-400">{result.feedback.warning}</p>}
          {result.feedback.suggestions.length > 0 && (
            <p>{result.feedback.suggestions[0]}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StrengthMeter;
