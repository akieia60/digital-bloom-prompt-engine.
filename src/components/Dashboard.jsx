import { useState } from 'react';
import { Copy, Check, Volume2, Trash2 } from 'lucide-react';

export default function Dashboard({ prompts, deletePrompt }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopiedId(prompt.id);
      
      // Audio feedback
      const utterance = new SpeechSynthesisUtterance("Copied");
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRead = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const categories = [...new Set(prompts.map(p => p.category))];

  return (
    <div className="pb-24 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-left px-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Digital Bloom
        </h1>
        <p className="text-gray-600 font-medium">Prompt Engine</p>
      </div>

      <div className="space-y-6 px-4">
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-left text-gray-800 ml-1">{category}</h2>
            <div className="space-y-4">
              {prompts.filter(p => p.category === category).map(prompt => (
                <div key={prompt.id} className="glass rounded-2xl p-5 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 pr-8">{prompt.title}</h3>
                    <button 
                      onClick={() => handleRead(prompt.text)}
                      className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                      aria-label="Read prompt aloud"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                    {prompt.text}
                  </p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="text-red-400 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleCopy(prompt)}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-full font-semibold text-white shadow-lg transition-all transform active:scale-95 ${
                        copiedId === prompt.id 
                          ? 'bg-green-500 shadow-green-200' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200'
                      }`}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check size={18} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Use Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
