import React, { useState } from 'react';
import { diffLines, Change } from 'diff';
import { JsonEditor } from './JsonEditor';
import { Button } from './Button';
import { Split, ArrowRightLeft, FileDiff } from 'lucide-react';

export const JsonDiff: React.FC = () => {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [diffResult, setDiffResult] = useState<Change[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = () => {
    setError(null);
    setDiffResult(null);

    if (!leftJson.trim() || !rightJson.trim()) {
      setError("Please provide both JSON strings to compare.");
      return;
    }

    try {
      const leftObj = JSON.parse(leftJson);
      const rightObj = JSON.parse(rightJson);

      // Normalize formatting for comparison
      const leftPretty = JSON.stringify(leftObj, null, 2);
      const rightPretty = JSON.stringify(rightObj, null, 2);

      const changes = diffLines(leftPretty, rightPretty);
      setDiffResult(changes);
    } catch (e) {
      setError("Invalid JSON detected. Please ensure both inputs are valid JSON.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
       <div className="flex items-center gap-2 mb-2">
         <div className="p-2 bg-indigo-500/10 rounded-lg">
           <FileDiff className="text-indigo-400" size={24} />
         </div>
         <div>
            <h3 className="text-lg font-semibold text-white">JSON Comparator</h3>
            <p className="text-sm text-gray-400">Compare two JSON objects to find differences.</p>
         </div>
       </div>

       {/* Inputs */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          <JsonEditor 
            value={leftJson} 
            onChange={setLeftJson} 
            label="Original JSON"
            placeholder="Paste original JSON..."
          />
          <JsonEditor 
            value={rightJson} 
            onChange={setRightJson} 
            label="Modified JSON"
            placeholder="Paste modified JSON..."
          />
       </div>

       {/* Actions */}
       <div className="flex justify-center">
          <Button onClick={handleCompare} icon={<ArrowRightLeft size={16} />}>
            Compare JSON
          </Button>
       </div>

       {/* Result */}
       {error && (
         <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-center text-sm">
           {error}
         </div>
       )}

       {diffResult && (
         <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-850 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <Split size={16} className="text-indigo-400"/>
              <span className="text-sm font-medium text-gray-300">Comparison Result</span>
            </div>
            <div className="p-4 overflow-x-auto bg-[#0d1117] min-h-[200px] max-h-[600px]">
              <pre className="font-mono text-sm leading-6">
                {diffResult.map((part, index) => {
                  const colorClass = part.added 
                    ? 'bg-green-900/20 text-green-300 border-l-2 border-green-500' 
                    : part.removed 
                      ? 'bg-red-900/20 text-red-300 border-l-2 border-red-500' 
                      : 'text-gray-500 border-l-2 border-transparent';
                  
                  return (
                    <span key={index} className={`${colorClass} block px-3 -mx-2 rounded-r-sm`}>
                       {part.value.replace(/\n$/, '')}
                    </span>
                  );
                })}
              </pre>
            </div>
         </div>
       )}
    </div>
  );
};