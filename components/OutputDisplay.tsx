import React, { useState } from 'react';
import { Copy, Check, FileJson, FileCode, AlignLeft, Minimize2, Layers, Home, Type, Tag, Cpu, Fingerprint } from 'lucide-react';
import { TabOption } from '../types';

interface OutputDisplayProps {
  jsonContent: string;
  isValid: boolean;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ jsonContent, isValid }) => {
  const [activeTab, setActiveTab] = useState<TabOption>('escaped');
  const [copied, setCopied] = useState(false);
  const [haName, setHaName] = useState('');
  const [haUniqueId, setHaUniqueId] = useState('');
  const [haDeviceClass, setHaDeviceClass] = useState('');

  const commonDeviceClasses = [
    'temperature', 'humidity', 'power', 'battery', 'voltage', 
    'current', 'energy', 'illuminance', 'motion', 'door', 
    'window', 'garage', 'safety', 'problem', 'connectivity'
  ];

  // Derived states
  const getFormatted = () => {
    try {
      if (!jsonContent) return '';
      return JSON.stringify(JSON.parse(jsonContent), null, 2);
    } catch {
      return jsonContent; // Fallback
    }
  };

  const getMinified = () => {
    try {
      if (!jsonContent) return '';
      return JSON.stringify(JSON.parse(jsonContent));
    } catch {
      return '';
    }
  };

  const getEscaped = () => {
    const minified = getMinified();
    if (!minified) return '';
    // JSON.stringify a string will escape it
    return JSON.stringify(minified);
  };
  
  const getCodeSnippet = () => {
     const escaped = getEscaped();
     if (!escaped) return '';
     // Simple example for JS/TS
     return `const jsonString = ${escaped};`;
  };

  const getFlattened = () => {
    try {
      if (!jsonContent) return '';
      const source = JSON.parse(jsonContent);
      
      const flatten = (obj: any, prefix = '', res: any = {}) => {
        if (obj === null || typeof obj !== 'object') {
           res[prefix] = obj;
           return res;
        }

        if (Array.isArray(obj)) {
           if (obj.length === 0) {
               res[prefix] = [];
           } else {
               obj.forEach((v, i) => {
                   flatten(v, prefix ? `${prefix}.${i}` : `${i}`, res);
               });
           }
           return res;
        }

        const keys = Object.keys(obj);
        if (keys.length === 0) {
            res[prefix] = {};
            return res;
        }

        keys.forEach(key => {
            const newKey = prefix ? `${prefix}.${key}` : key;
            flatten(obj[key], newKey, res);
        });

        return res;
      };

      // Handle primitive root specifically if needed, though usually JSON input is object/array
      if (source !== null && typeof source !== 'object') {
         return JSON.stringify({ "value": source }, null, 2);
      }

      const flattened = flatten(source);
      return JSON.stringify(flattened, null, 2);
    } catch (e) {
      return '';
    }
  };

  const getHaDiscovery = () => {
    try {
      if (!jsonContent) return '';
      const source = JSON.parse(jsonContent);
      
      if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
           const overrides: any = {};
           if (haName.trim()) overrides.name = haName.trim();
           if (haUniqueId.trim()) overrides.unique_id = haUniqueId.trim();
           if (haDeviceClass.trim()) overrides.device_class = haDeviceClass.trim();

           if (Object.keys(overrides).length > 0) {
             return JSON.stringify({ ...source, ...overrides });
           }
      }
      return JSON.stringify(source);
    } catch {
      return '';
    }
  };

  const getContent = () => {
    if (!isValid && jsonContent) return "Invalid JSON. Please fix errors in the editor to see output.";
    if (!jsonContent) return "Waiting for input...";

    switch (activeTab) {
      case 'pretty': return getFormatted();
      case 'minified': return getMinified();
      case 'escaped': return getEscaped();
      case 'code': return getCodeSnippet();
      case 'flattened': return getFlattened();
      case 'ha_autodetect': return getHaDiscovery();
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: TabOption; label: string; icon: React.ReactNode }[] = [
    { id: 'escaped', label: 'Escaped String', icon: <FileCode size={16} /> },
    { id: 'pretty', label: 'Pretty Print', icon: <AlignLeft size={16} /> },
    { id: 'minified', label: 'Minified', icon: <Minimize2 size={16} /> },
    { id: 'code', label: 'Code Snippet', icon: <FileJson size={16} /> },
    { id: 'flattened', label: 'Flattened', icon: <Layers size={16} /> },
    { id: 'ha_autodetect', label: 'HA Discovery', icon: <Home size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-2 pt-2 bg-gray-850 border-b border-gray-700">
         <div className="flex space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-indigo-400 border-t border-x border-gray-700'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="px-2 pb-1">
          <button
            onClick={handleCopy}
            disabled={!isValid || !jsonContent}
            className={`p-2 rounded-md transition-all ${
              copied 
                ? 'bg-green-900/50 text-green-400' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Copy to clipboard"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 bg-gray-900 overflow-hidden relative">
        {activeTab === 'ha_autodetect' && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-6 flex flex-col sm:flex-row gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
             
             {/* Friendly Name */}
             <div className="flex-1 relative group">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">Friendly Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                        <Type size={14} />
                    </div>
                    <input 
                        type="text" 
                        value={haName}
                        onChange={(e) => setHaName(e.target.value)}
                        placeholder="e.g. Living Room Temp"
                        className="w-full bg-gray-900 text-gray-100 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder-gray-600 transition-all font-mono shadow-sm"
                    />
                </div>
             </div>

             {/* Unique ID */}
             <div className="flex-1 relative group">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">Unique ID</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                        <Fingerprint size={14} />
                    </div>
                    <input 
                        type="text" 
                        value={haUniqueId}
                        onChange={(e) => setHaUniqueId(e.target.value)}
                        placeholder="e.g. lr_temp_sensor_01"
                        className="w-full bg-gray-900 text-gray-100 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder-gray-600 transition-all font-mono shadow-sm"
                    />
                </div>
             </div>

             {/* Device Class */}
             <div className="flex-1 relative group">
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">Device Class</label>
                   <select 
                      className="bg-transparent text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 focus:outline-none cursor-pointer text-right appearance-none"
                      onChange={(e) => setHaDeviceClass(e.target.value)}
                      value="" 
                   >
                      <option value="" disabled>PRESETS ▾</option>
                      {commonDeviceClasses.map(t => (
                        <option key={t} value={t} className="bg-gray-800 text-gray-300 font-medium">{t}</option>
                      ))}
                   </select>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                        <Cpu size={14} />
                    </div>
                    <input 
                        type="text" 
                        value={haDeviceClass}
                        onChange={(e) => setHaDeviceClass(e.target.value)}
                        placeholder="e.g. temperature"
                        className="w-full bg-gray-900 text-gray-100 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder-gray-600 transition-all font-mono shadow-sm"
                    />
                </div>
             </div>
          </div>
        )}

        <textarea 
          readOnly 
          value={getContent()}
          className="w-full flex-1 p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none"
        />
        
        {/* Contextual Tips based on active tab */}
        {isValid && jsonContent && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded border border-gray-800 pointer-events-none">
             {activeTab === 'escaped' && "Ready to paste into a string variable"}
             {activeTab === 'ha_autodetect' && "Compact payload for MQTT Discovery"}
             {activeTab === 'flattened' && "Dot-notation keys for easier parsing"}
             {activeTab === 'code' && "JS/TS Variable Declaration"}
          </div>
        )}
      </div>
    </div>
  );
};