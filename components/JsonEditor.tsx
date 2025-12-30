import React from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  label?: string;
  placeholder?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ 
  value, 
  onChange, 
  error, 
  label = "Input / Editor",
  placeholder = 'Paste JSON here or generate it using AI...'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {error && (
          <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 truncate max-w-[50%]">
            {error}
          </span>
        )}
        {!error && value.trim().length > 0 && (
          <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">
            Valid JSON
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        spellCheck={false}
        placeholder={placeholder}
        className={`flex-1 w-full bg-gray-800 text-gray-100 font-mono text-sm p-4 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-indigo-500'
        }`}
      />
    </div>
  );
};