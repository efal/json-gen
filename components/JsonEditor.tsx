import React, { useRef } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  errorLine?: number | null;
  label?: string;
  placeholder?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ 
  value, 
  onChange, 
  error,
  errorLine,
  label = "Input / Editor",
  placeholder = 'Paste JSON here or generate it using AI...'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Generate lines for the background (line numbers + error highlight)
  const lines = value.split('\n');
  // Ensure at least one line exists visually even if empty
  const lineCount = lines.length || 1; 

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {error && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 truncate max-w-[60%]">
            <span className="font-bold">Error {errorLine ? `(Line ${errorLine})` : ''}:</span>
            <span className="truncate" title={error}>{error}</span>
          </span>
        )}
        {!error && value.trim().length > 0 && (
          <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">
            Valid JSON
          </span>
        )}
      </div>

      <div className="flex-1 relative rounded-lg border overflow-hidden bg-gray-800 group focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all focus-within:border-indigo-500/50 border-gray-700">
        
        {/* Backdrop: Handles Line Numbers and Row Highlights */}
        {/* We use pointer-events-none so clicks pass through to the textarea */}
        <div 
           ref={backdropRef}
           className="absolute inset-0 overflow-hidden pointer-events-none bg-gray-900/50"
           aria-hidden="true"
        >
           <div className="flex min-h-full">
              {/* Line Numbers Column */}
              <div className="flex-shrink-0 w-10 bg-gray-900 text-right pr-2 pt-4 border-r border-gray-700 select-none">
                {Array.from({ length: lineCount }).map((_, i) => {
                  const lineNum = i + 1;
                  const isError = errorLine === lineNum;
                  return (
                    <div 
                      key={i} 
                      className={`h-6 text-xs font-mono leading-6 transition-colors ${
                        isError ? 'text-red-400 font-bold bg-red-900/30 pr-1.5 -mr-2 border-r-2 border-red-500' : 'text-gray-600'
                      }`}
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>

              {/* Content Backdrop for full-width highlights */}
              <div className="flex-1 pt-4 relative">
                {Array.from({ length: lineCount }).map((_, i) => {
                   const lineNum = i + 1;
                   if (errorLine === lineNum) {
                     return (
                       <div key={i} className="h-6 w-full bg-red-500/10 absolute left-0 right-0 pointer-events-none" style={{ top: `${i * 1.5 + 1}rem` }} />
                     );
                   }
                   return null;
                })}
              </div>
           </div>
        </div>

        {/* Foreground: The editable textarea */}
        {/* Padding-left matches the line number column width + padding */}
        {/* whitespace-pre ensures no wrapping so lines match exactly */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder={placeholder}
          className="absolute inset-0 w-full h-full bg-transparent text-gray-100 font-mono text-sm leading-6 p-0 pt-4 pl-12 resize-none outline-none whitespace-pre overflow-auto z-10"
          style={{ lineHeight: '1.5rem' }} 
        />
        
      </div>
    </div>
  );
};