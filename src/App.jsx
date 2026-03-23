import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import CategorySelection from './components/CategorySelection';
import Customization from './components/Customization';
import SubscriptionDashboard from './components/SubscriptionDashboard';
import DateReminders from './components/DateReminders';
import ChurchPartnership from './components/ChurchPartnership';
import VideoGenerationDashboard from './components/VideoGenerationDashboard';
import MoniqueChat from './components/MoniqueChat';
import VideoLibrary from './components/VideoLibrary';
import { usePrompts } from './hooks/usePrompts';

import { RECORDED_VAULT_ASSETS } from './data/videoVaultAssets';
import { Copy, Check, Download, Crown, Star, Sparkles, Cross } from 'lucide-react';
import CommandCenter from './components/CommandCenter';
import TaskBoard from './components/TaskBoard';
import PromptSplitter from './components/PromptSplitter';

function VideoVault() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (asset) => {
    try {
      await navigator.clipboard.writeText(asset.prompt);
      setCopiedId(asset.id);
      
      const utterance = new SpeechSynthesisUtterance("Luxury Prompt Copied with Elegance");
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (asset) => {
    const link = document.createElement('a');
    link.href = asset.imagePath;
    link.download = `DigitalBloom_Premium_${asset.category}_${asset.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Premium feedback
    const utterance = new SpeechSynthesisUtterance("Premium asset downloaded");
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const categories = [...new Set(RECORDED_VAULT_ASSETS.map(a => a.category))];
  
  // Check if category is spiritual
  const getSpiritualIcon = (category) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('dearly departed') || lowerCategory.includes('memorial')) {
      return '✟';
    }
    if (lowerCategory.includes('heavenly birthday') || lowerCategory.includes('heaven')) {
      return '✟ ✨';
    }
    return null;
  };

  return (
    <div className="pb-24 pt-6 px-4 animate-slide-in min-h-full">
      {/* Luxury header */}
      <div className="text-left mb-8">
        <div className="luxury-glass rounded-3xl p-6 diamond-sparkle">
          <h2 className="luxury-serif text-3xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Premium Video Vault
            <Crown className="inline-block ml-3 text-gold-500 w-7 h-7" />
          </h2>
          <p className="luxury-sans text-gray-700 font-medium">
            Your curated collection of luxury reference images & premium animation prompts
            <Star className="inline-block ml-2 text-gold-400 w-5 h-5" />
          </p>
        </div>
      </div>
      
      <div className="space-y-12">
        {categories.map(category => {
          const spiritualIcon = getSpiritualIcon(category);
          
          return (
            <div key={category} className="space-y-6">
              <div className="luxury-glass rounded-2xl p-4">
                <h3 className="luxury-serif text-2xl font-semibold text-gray-900 ml-2 flex items-center">
                  {category}
                  {spiritualIcon && (
                    <span className="cross-symbol ml-3 text-2xl">{spiritualIcon}</span>
                  )}
                  <Sparkles className="ml-3 text-gold-500 w-6 h-6" />
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {RECORDED_VAULT_ASSETS.filter(a => a.category === category).map(asset => (
                  <div key={asset.id} className="luxury-glass rounded-3xl overflow-hidden flex flex-col hover:shadow-luxury hover:scale-[1.02] transition-all duration-500 diamond-sparkle gold-trim">
                    <div className="aspect-square w-full relative group">
                      <img 
                        src={asset.imagePath} 
                        alt={asset.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                        <button
                          onClick={() => handleDownload(asset)}
                          className="luxury-button p-4 rounded-full backdrop-blur-md transition-all transform hover:scale-110 shadow-gold-glow"
                          title="Download Premium Asset"
                        >
                          <Download size={24} />
                        </button>
                      </div>
                      
                      {/* Premium quality indicator */}
                      <div className="absolute top-4 left-4 luxury-glass rounded-full p-2">
                        <Crown className="w-5 h-5 text-gold-500" />
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="luxury-serif font-bold text-xl text-gray-900 mb-3 leading-tight">{asset.title}</h4>
                      <div className="luxury-glass-util rounded-2xl p-4 mb-6 flex-1">
                        <p className="luxury-sans text-gray-700 text-sm leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all cursor-pointer">
                          {asset.prompt}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleCopy(asset)}
                        className={`luxury-button w-full flex items-center justify-center space-x-3 py-4 font-bold transition-all transform active:scale-95 ${
                          copiedId === asset.id 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200' 
                            : 'hover:shadow-gold-glow'
                        }`}
                        disabled={copiedId === asset.id}
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check size={20} />
                            <span>Copied with Elegance!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={20} />
                            <span>Copy Premium Prompt</span>
                            <Crown size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Premium floating particles */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${12 + Math.random() * 10}s`,
              background: 'var(--gold-accent)',
              opacity: 0.2,
            }}
          />
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
    // Enhanced prompt generation with luxury context
    let promptText;
    
    if (customizations.categoryId.includes('dearly-departed')) {
      promptText = `Create a reverent 7-scene memorial ${customizations.categoryId} sequence. Sacred flower: ${customizations.flowerType}. Memorial colors: ${customizations.balloonColor}. The tribute should read: "${customizations.cardMessage}". Incorporate gentle cross symbolism and ethereal lighting for spiritual comfort.`;
    } else if (customizations.categoryId.includes('heavenly-birthday')) {
      promptText = `Generate a celestial 7-scene heavenly birthday celebration. Divine flowers: ${customizations.flowerType}. Heavenly hues: ${customizations.balloonColor}. The blessed message: "${customizations.cardMessage}". Include soft cross imagery and angelic light rays for spiritual celebration.`;
    } else {
      promptText = `Create a luxury 7-scene premium ${customizations.categoryId} sequence. Elite flower: ${customizations.flowerType}. Opulent colors: ${customizations.balloonColor}. The elegant message reads: "${customizations.cardMessage}". Use premium gold accents and marble textures throughout.`;
    }
    
    addPrompt({
      title: `Premium ${customizations.categoryId.charAt(0).toUpperCase() + customizations.categoryId.slice(1)} Bloom`,
      category: customizations.categoryId,
      text: promptText,
    });
    
    // Premium feedback
    const utterance = new SpeechSynthesisUtterance("Luxury prompt created with elegance");
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    
    // Go back to dashboard to see the new prompt
    setCurrentView('dashboard');
    setSelectedCategory(null);
  };

  // Add loading state and luxury transitions
  useEffect(() => {
    // Premium app initialization
    document.title = 'Digital Bloom - Luxury Digital Experiences';
    
    // Add premium meta tags
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = '#d4af37';
    }
    
    // Luxury startup sound (optional)
    const welcomeSound = () => {
      const utterance = new SpeechSynthesisUtterance("Welcome to Digital Bloom Luxury");
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      utterance.volume = 0.3;
      window.speechSynthesis.speak(utterance);
    };
    
    // Delay to avoid immediate audio on load
    const timer = setTimeout(welcomeSound, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-gold-200">
      {/* Luxury background particles - global */}
      <div className="particles-container fixed inset-0 pointer-events-none z-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
              background: i % 5 === 0 ? 'var(--gold-accent)' : 
                         i % 5 === 1 ? 'var(--gold-primary)' : 
                         i % 5 === 2 ? 'var(--memorial-purple)' : 
                         i % 5 === 3 ? 'var(--heavenly-blue)' : 
                         'rgba(255, 255, 255, 0.6)',
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      <main className="pt-6 relative z-10">
        {currentView === 'dashboard' && <Dashboard prompts={prompts} deletePrompt={deletePrompt} />}
        {currentView === 'voice' && <VoiceInput addPrompt={addPrompt} onSaved={() => setCurrentView('dashboard')} />}
        {currentView === 'vault' && <VideoVault />}
        {currentView === 'command' && <TaskBoard />}
        {currentView === 'command-center' && <CommandCenter />}
        {currentView === 'generation' && <VideoGenerationDashboard />}
        {currentView === 'monique' && <MoniqueChat />}
        {currentView === 'library' && <VideoLibrary />}
        {currentView === 'subscription' && <SubscriptionDashboard />}
        {currentView === 'reminders' && <DateReminders />}
        {currentView === 'church' && <ChurchPartnership />}
        {currentView === 'splitter' && <PromptSplitter />}
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
