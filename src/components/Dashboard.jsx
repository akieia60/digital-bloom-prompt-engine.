import { useState } from 'react';
import { Copy, Check, Volume2, Trash2, Star, Crown } from 'lucide-react';

export default function Dashboard({ prompts, deletePrompt }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopiedId(prompt.id);
      
      // Enhanced audio feedback with luxury feel
      const utterance = new SpeechSynthesisUtterance("Prompt Copied with Elegance");
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRead = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const categories = [...new Set(prompts.map(p => p.category))];
  
  // Determine if category is spiritual/memorial
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

  const getCategoryClasses = (category) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('dearly departed') || lowerCategory.includes('memorial')) {
      return 'category-dearly-departed';
    }
    if (lowerCategory.includes('heavenly birthday') || lowerCategory.includes('heaven')) {
      return 'category-heavenly-birthday';
    }
    return '';
  };

  return (
    <div className="pb-24 pt-6 space-y-8 animate-slide-in">
      {/* Luxury header with enhanced styling */}
      <div className="text-left px-4 relative">
        <div className="luxury-glass rounded-3xl p-6 diamond-sparkle">
          <h1 className="luxury-serif text-4xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Digital Bloom
            <Crown className="inline-block ml-3 text-gold-500 w-8 h-8" />
          </h1>
          <p className="luxury-sans text-gray-700 font-medium text-lg">
            Premium Prompt Engine
            <Star className="inline-block ml-2 text-gold-400 w-5 h-5" />
          </p>
        </div>
      </div>

      <div className="space-y-8 px-4">
        {categories.map(category => {
          const spiritualIcon = getSpiritualIcon(category);
          const categoryClasses = getCategoryClasses(category);
          
          return (
            <div key={category} className="space-y-6">
              <div className="luxury-glass rounded-2xl p-4">
                <h2 className="luxury-serif text-2xl font-semibold text-left text-gray-900 ml-2 flex items-center">
                  {category}
                  {spiritualIcon && (
                    <span className="cross-symbol ml-3 text-2xl">{spiritualIcon}</span>
                  )}
                </h2>
              </div>
              
              <div className="space-y-6">
                {prompts.filter(p => p.category === category).map(prompt => (
                  <div 
                    key={prompt.id} 
                    className={`luxury-glass rounded-3xl p-6 text-left relative overflow-visible group diamond-sparkle gold-trim hover:scale-[1.02] transition-all duration-300 ${categoryClasses}`}
                  >
                    {/* Premium gold accent bar */}
                    <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-gold-400 via-gold-500 to-gold-400 rounded-r-3xl"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="luxury-serif font-bold text-xl text-gray-900 pr-8 leading-tight">
                        {prompt.title}
                      </h3>
                      <button 
                        onClick={() => handleRead(prompt.text)}
                        className="p-3 text-gold-500 hover:text-gold-600 hover:bg-gold-50 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Read prompt aloud with luxury voice"
                      >
                        <Volume2 size={22} />
                      </button>
                    </div>
                    
                    <div className="luxury-glass-util rounded-2xl p-4 mb-6">
                      <p className="luxury-sans text-gray-700 text-sm leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all cursor-pointer">
                        {prompt.text}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3">
                      <button
                        onClick={() => deletePrompt(prompt.id)}
                        className="text-red-400 hover:text-red-600 p-3 rounded-2xl hover:bg-red-50 transition-all duration-300 hover:scale-105"
                        title="Remove prompt"
                      >
                        <Trash2 size={20} />
                      </button>
                      
                      <button
                        onClick={() => handleCopy(prompt)}
                        className={`luxury-button flex items-center space-x-3 font-semibold transition-all transform ${
                          copiedId === prompt.id 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200' 
                            : 'hover:shadow-gold-glow'
                        }`}
                        disabled={copiedId === prompt.id}
                      >
                        {copiedId === prompt.id ? (
                          <>
                            <Check size={20} />
                            <span>Copied with Elegance!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={20} />
                            <span>Use Premium Prompt</span>
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
      
      {/* Add some floating particles for premium feel */}
      <div className="particles-container">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
