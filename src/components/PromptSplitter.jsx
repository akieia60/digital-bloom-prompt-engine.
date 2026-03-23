import { useMemo, useState } from 'react';
import { Copy, Check, Scissors, Trash2 } from 'lucide-react';
import { splitScenes } from '../utils/splitScenes';

export default function PromptSplitter() {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const scenes = useMemo(() => splitScenes(input), [input]);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);

      const utterance = new SpeechSynthesisUtterance('Prompt copied');
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);

      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleCopyAll = async () => {
    try {
      const combined = scenes.map((scene) => scene.text).join('\n\n');
      await navigator.clipboard.writeText(combined);
      setCopiedId('all');

      const utterance = new SpeechSynthesisUtterance('All scenes copied');
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);

      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy all failed:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setCopiedId(null);
  };

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300 min-h-full">
      <div className="text-left mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Prompt Splitter
        </h2>
        <p className="text-gray-600 font-medium">
          Paste a multi-scene prompt and get clean copy boxes for Grok Imagine
        </p>
      </div>

      <div className="glass rounded-3xl p-5 mb-6 border border-white/40 space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your full 3-scene, 5-scene, or 7-scene prompt here..."
          className="w-full bg-white/60 rounded-2xl p-4 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
          rows={10}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={scenes.length === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copiedId === 'all' ? <Check size={18} /> : <Copy size={18} />}
            <span>{copiedId === 'all' ? 'Copied All' : 'Copy All'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-gray-700 bg-white/70 border border-white/50 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-gray-700 font-semibold">
        <Scissors size={18} className="text-amber-500" />
        <span>
          {scenes.length} {scenes.length === 1 ? 'prompt box' : 'prompt boxes'}
        </span>
      </div>

      <div className="space-y-4">
        {scenes.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center border border-white/40">
            <p className="text-gray-400 text-lg">No scenes detected yet</p>
            <p className="text-gray-300 text-sm mt-1">
              Paste a multi-scene sequence above and the boxes will appear here
            </p>
          </div>
        )}

        {scenes.map((scene) => (
          <div key={scene.id} className="glass rounded-3xl p-5 border border-white/40 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-gray-800">{scene.label}</h3>

              <button
                type="button"
                onClick={() => handleCopy(scene.text, scene.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all ${
                  copiedId === scene.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                {copiedId === scene.id ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedId === scene.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={scene.text}
              className="w-full bg-white/60 rounded-2xl p-4 text-gray-800 resize-none focus:outline-none min-h-[140px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
