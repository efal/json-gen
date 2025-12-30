import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Trash2, X, Check, Bookmark, ChevronDown, ChevronUp, ZapOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { generateJsonFromPrompt, isAiConfigured } from '../services/geminiService';
import { Button } from './Button';

interface AiGeneratorProps {
  onJsonGenerated: (json: string) => void;
}

interface PromptTemplate {
  id: string;
  label: string;
  prompt: string;
  staticSnippet?: string; // Fallback for offline mode
  isCustom?: boolean;
}

export const AiGenerator: React.FC<AiGeneratorProps> = ({ onJsonGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Controls whether we are using AI or simple Snippets
  const [useAiMode, setUseAiMode] = useState(isAiConfigured);
  
  // Custom Templates State
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Static snippets for offline usage
  const defaultTemplates: PromptTemplate[] = [
    { 
      id: 't1', 
      label: 'User Profile', 
      prompt: 'Generate a user profile object with name, email, address, and preferences.',
      staticSnippet: JSON.stringify({
        "id": "u_12345",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "isActive": true,
        "address": {
          "street": "123 Tech Lane",
          "city": "Innovation City",
          "zip": "90210"
        },
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      }, null, 2)
    },
    { 
      id: 't2', 
      label: 'Product List', 
      prompt: 'A list of 5 products with id, title, price, description, and category.',
      staticSnippet: JSON.stringify([
        { "id": 1, "title": "Wireless Headphones", "price": 99.99, "category": "Audio" },
        { "id": 2, "title": "Mechanical Keyboard", "price": 149.50, "category": "Peripherals" },
        { "id": 3, "title": "USB-C Hub", "price": 45.00, "category": "Accessories" }
      ], null, 2)
    },
    { 
      id: 't3', 
      label: 'Todo Array', 
      prompt: 'An array of 4 todo items with id, task, and isCompleted status.',
      staticSnippet: JSON.stringify([
        { "id": 1, "task": "Review PRs", "isCompleted": false },
        { "id": 2, "task": "Update documentation", "isCompleted": true },
        { "id": 3, "task": "Deploy to staging", "isCompleted": false }
      ], null, 2)
    },
    { 
      id: 't4', 
      label: 'App Config', 
      prompt: 'A configuration object for an app with theme, features, and apiSettings.',
      staticSnippet: JSON.stringify({
        "appName": "MyApp",
        "version": "1.0.0",
        "features": {
          "beta": false,
          "darkMode": true
        },
        "api": {
          "endpoint": "https://api.example.com",
          "retries": 3,
          "timeout": 5000
        }
      }, null, 2)
    },
    { 
      id: 't5', 
      label: 'HA Sensor', 
      prompt: 'Generate a Home Assistant MQTT sensor configuration JSON.',
      staticSnippet: JSON.stringify({
        "name": "Living Room Temperature",
        "state_topic": "home/sensors/living/state",
        "value_template": "{{ value_json.temperature }}",
        "device_class": "temperature",
        "unit_of_measurement": "°C",
        "unique_id": "living_room_temp_sensor"
      }, null, 2)
    },
    { 
      id: 't6', 
      label: 'HA Button', 
      prompt: 'Generate a Home Assistant MQTT button configuration JSON.',
      staticSnippet: JSON.stringify({
        "name": "Garage Door",
        "command_topic": "home/garage/door/set",
        "payload_press": "TOGGLE",
        "device_class": "garage",
        "unique_id": "garage_door_btn",
        "icon": "mdi:garage"
      }, null, 2)
    }
  ];

  // Load custom templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('jsg_custom_prompts');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prompts", e);
      }
    }
  }, []);

  const toggleAiMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAiConfigured) return; // Cannot enable if no key
    setUseAiMode(!useAiMode);
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    if (useAiMode && isAiConfigured) {
      setPrompt(template.prompt);
    } else if (template.staticSnippet) {
      // Offline/Manual mode: Insert snippet immediately
      onJsonGenerated(template.staticSnippet);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const jsonString = await generateJsonFromPrompt(prompt);
      onJsonGenerated(jsonString);
    } catch (err: any) {
      setError("Failed to generate JSON. Check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInit = () => {
    if (!prompt.trim()) return;
    setIsSaving(true);
    setNewTemplateName('');
  };

  const handleSaveConfirm = () => {
    if (!newTemplateName.trim()) return;
    
    const newTemplate: PromptTemplate = {
      id: Date.now().toString(),
      label: newTemplateName,
      prompt: prompt,
      isCustom: true
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem('jsg_custom_prompts', JSON.stringify(updated));
    
    setIsSaving(false);
    setNewTemplateName('');
  };

  const handleSaveCancel = () => {
    setIsSaving(false);
    setNewTemplateName('');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('jsg_custom_prompts', JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  const handleSaveInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveConfirm();
    } else if (e.key === 'Escape') {
      handleSaveCancel();
    }
  };

  return (
    <div className={`mb-6 rounded-xl border shadow-sm overflow-hidden transition-all ${
      useAiMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/30 border-gray-700/50'
    }`}>
      {/* Header / Toggle */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${useAiMode ? 'bg-indigo-500/10' : 'bg-gray-700/50'}`}>
              {useAiMode ? <Sparkles className="text-indigo-400" size={20} /> : <ZapOff className="text-gray-400" size={20} />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                {useAiMode ? 'Generate with AI' : 'Snippet Library'}
              </h3>
              <p className="text-xs text-gray-400">
                {useAiMode
                  ? 'Describe structure and Gemini will create it.' 
                  : 'Select a template to insert a standard JSON structure.'}
              </p>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
             {/* AI Toggle Switch */}
             <div 
                onClick={toggleAiMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    !isAiConfigured ? 'opacity-50 cursor-not-allowed border-gray-700' : 'cursor-pointer hover:bg-gray-700 border-gray-600'
                }`}
                title={!isAiConfigured ? "API Key missing" : "Toggle AI Mode"}
             >
                <span className="text-xs font-medium text-gray-300">AI Mode</span>
                {useAiMode ? (
                    <div className="relative w-8 h-4 bg-indigo-600 rounded-full transition-colors">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform" />
                    </div>
                ) : (
                    <div className="relative w-8 h-4 bg-gray-600 rounded-full transition-colors">
                        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-gray-300 rounded-full shadow-sm transition-transform" />
                    </div>
                )}
             </div>

             <button className="text-gray-500 hover:text-gray-300">
               {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
             </button>
         </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          {/* Default Templates */}
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {defaultTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                  useAiMode 
                   ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border-gray-600'
                   : 'bg-green-900/20 text-green-300 hover:bg-green-900/40 border-green-900/50'
                }`}
                type="button"
                title={useAiMode ? "Load prompt" : "Insert JSON Snippet"}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* AI Input Section - Only visible if AI is Enabled */}
          {useAiMode ? (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Custom Templates Section */}
              {customTemplates.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-3 pt-3 border-t border-gray-700/50">
                    <div className="w-full flex items-center gap-1.5 text-xs text-indigo-400 font-medium mb-1">
                      <Bookmark size={12} />
                      <span>Your Presets</span>
                    </div>
                    {customTemplates.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setPrompt(t.prompt)}
                        className="group flex items-center pl-2.5 pr-1 py-1 text-xs font-medium bg-indigo-900/20 text-indigo-200 rounded-md hover:bg-indigo-900/40 transition-colors border border-indigo-900/50 hover:border-indigo-500/50 cursor-pointer"
                      >
                        <span>{t.label}</span>
                        <button 
                          onClick={(e) => handleDeleteTemplate(t.id, e)}
                          className="ml-1.5 p-0.5 text-indigo-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-900/30 rounded transition-all"
                          title="Delete preset"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                 </div>
              )}

              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. A list of 5 users with name, email, and active status..."
                  className="w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-3 pb-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none min-h-[100px] resize-y"
                />
                
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                   {isSaving ? (
                     <div className="flex items-center bg-gray-800 rounded-md border border-gray-600 shadow-lg p-1 animate-in fade-in zoom-in-95 duration-200">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Preset name..." 
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          onKeyDown={handleSaveInputKeyDown}
                          className="bg-transparent text-xs text-white px-2 py-1 outline-none w-32 placeholder-gray-500"
                        />
                        <button 
                          onClick={handleSaveConfirm}
                          disabled={!newTemplateName.trim()}
                          className="p-1 hover:bg-green-900/50 text-green-400 rounded disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={handleSaveCancel}
                          className="p-1 hover:bg-red-900/50 text-red-400 rounded"
                        >
                          <X size={14} />
                        </button>
                     </div>
                   ) : (
                      <button 
                        onClick={handleSaveInit}
                        disabled={!prompt.trim()}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:text-gray-500 px-2 py-1 rounded hover:bg-gray-800"
                        title="Save current prompt as preset"
                      >
                        <Save size={14} />
                        <span>Save Preset</span>
                      </button>
                   )}
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <span className="text-xs text-gray-500 hidden sm:inline">Ctrl + Enter</span>
                  <Button 
                    onClick={handleGenerate} 
                    isLoading={isGenerating} 
                    disabled={!prompt.trim()}
                    size="sm"
                    className="py-1 px-3 text-xs"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>
          ) : (
             // Offline Helper Text
             <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-700 rounded bg-gray-900/30 flex items-center gap-2">
                <Check size={16} className="text-green-500"/>
                Click any button above to insert the JSON template into the editor.
             </div>
          )}
        </div>
      )}
    </div>
  );
};