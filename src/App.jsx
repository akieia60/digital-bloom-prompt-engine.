import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import CategorySelection from './components/CategorySelection';
import Customization from './components/Customization';
import { usePrompts } from './hooks/usePrompts';

import { RECORDED_VAULT_ASSETS } from './data/videoVaultAssets';
import { Copy, Check, Download } from 'lucide-react';

function VideoVault() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (asset) => {
    try {
      await navigator.clipboard.writeText(asset.prompt);
      setCopiedId(asset.id);
      
      const utterance = new SpeechSynthesisUtterance("Prompt Copied");
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (asset) => {
    const link = document.createElement('a');
    link.href = asset.imagePath;
    link.download = `${asset.category}_${asset.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [...new Set(RECORDED_VAULT_ASSETS.map(a => a.category))];

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300 min-h-full">
      <div className="text-left mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">Video Vault</h2>
        <p className="text-gray-600 font-medium">Your generated reference images & animation prompts</p>
      </div>
      
      <div className="space-y-10">
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 ml-1 border-b border-gray-200 pb-2">{category}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RECORDED_VAULT_ASSETS.filter(a => a.category === category).map(asset => (
                <div key={asset.id} className="glass rounded-3xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow border border-white/40">
                  <div className="aspect-square w-full relative group">
                    <img 
                      src={asset.imagePath} 
                      alt={asset.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        onClick={() => handleDownload(asset)}
                        className="bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-md transition-all transform hover:scale-110"
                        title="Download Image"
                      >
                        <Download size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-bold text-xl text-gray-900 mb-2">{asset.title}</h4>
                    <div className="bg-white/50 rounded-xl p-3 mb-4 flex-1">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                        {asset.prompt}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleCopy(asset)}
                      className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                        copiedId === asset.id 
                          ? 'bg-green-500 shadow-green-200' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200'
                      }`}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check size={20} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          <span>Copy Animation Prompt</span>
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

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { prompts, addPrompt, deletePrompt } = usePrompts();

  const handleGenerate = (customizations) => {
    // Generate the prompt based on customizations
    const promptText = `Generate a 7-scene cinematic ${customizations.categoryId} sequence. Main flower: ${customizations.flowerType}. Balloons: ${customizations.balloonColor}. The card should read: "${customizations.cardMessage}". Use the "Mimi_Birthday" narrative flow structure.`;
    
    addPrompt({
      title: `Custom ${customizations.categoryId} Bloom`,
      category: customizations.categoryId,
      text: promptText,
    });
    
    // Go back to dashboard to see the new prompt
    setCurrentView('dashboard');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-amber-200">
      <main className="pt-6">
        {currentView === 'dashboard' && <Dashboard prompts={prompts} deletePrompt={deletePrompt} />}
        {currentView === 'voice' && <VoiceInput addPrompt={addPrompt} onSaved={() => setCurrentView('dashboard')} />}
        {currentView === 'vault' && <VideoVault />}
        {currentView === 'create' && !selectedCategory && (
          <CategorySelection onSelectCategory={setSelectedCategory} />
        )}
        {currentView === 'create' && selectedCategory && (
          <Customization 
            categoryId={selectedCategory} 
            onGenerate={handleGenerate} 
            onBack={() => setSelectedCategory(null)} 
          />
        )}
      </main>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;
