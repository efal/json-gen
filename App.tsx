import React, { useState, useEffect } from 'react';
import { JsonEditor } from './components/JsonEditor';
import { OutputDisplay } from './components/OutputDisplay';
import { AiGenerator } from './components/AiGenerator';
import { JsonDiff } from './components/JsonDiff';
import { Braces, Github, FileCode, FileDiff } from 'lucide-react';

type ViewMode = 'generator' | 'diff';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate JSON whenever content changes
  useEffect(() => {
    if (!jsonContent.trim()) {
      setJsonError(null);
      setIsValid(false);
      return;
    }

    try {
      JSON.parse(jsonContent);
      setJsonError(null);
      setIsValid(true);
    } catch (e: any) {
      setJsonError(e.message);
      setIsValid(false);
    }
  }, [jsonContent]);

  const handleJsonChange = (newJson: string) => {
    setJsonContent(newJson);
  };

  const handleAiGenerated = (newJson: string) => {
    // Attempt to pretty print the AI output immediately for better UX
    try {
      const parsed = JSON.parse(newJson);
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch {
      setJsonContent(newJson);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161b22] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/20">
              <Braces className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">JSON-String Gen</h1>
              <h1 className="text-xl font-bold tracking-tight text-white sm:hidden">JSG</h1>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-gray-800/50 rounded-lg border border-gray-700">
             <button
                onClick={() => setViewMode('generator')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'generator'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
             >
                <FileCode size={16} />
                <span>Generator</span>
             </button>
             <button
                onClick={() => setViewMode('diff')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'diff'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
             >
                <FileDiff size={16} />
                <span>Diff</span>
             </button>
          </div>

          <div className="flex items-center space-x-4">
             <a href="#" className="text-gray-400 hover:text-white transition-colors">
               <Github size={20} />
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {viewMode === 'generator' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AI Section */}
            <AiGenerator onJsonGenerated={handleAiGenerated} />

            {/* Workspace: Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)] min-h-[500px]">
              
              {/* Left: Input */}
              <div className="flex flex-col h-full bg-gray-800/30 rounded-xl border border-gray-800 p-4 shadow-sm">
                <JsonEditor 
                  value={jsonContent} 
                  onChange={handleJsonChange} 
                  error={jsonError} 
                />
              </div>

              {/* Right: Output */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-sm font-medium text-gray-300">Output / Formatter</label>
                  <span className="text-xs text-gray-500">
                    {isValid ? 'Ready to copy' : 'Waiting for valid input'}
                  </span>
                </div>
                <OutputDisplay 
                  jsonContent={jsonContent} 
                  isValid={isValid} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <JsonDiff />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-auto bg-[#161b22]">
         <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>Powered by Google Gemini. Data is processed safely.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;