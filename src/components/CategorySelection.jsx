import React from 'react';
import { Crown, Heart, Cross, Star, Sparkles } from 'lucide-react';

export default function CategorySelection({ onSelectCategory }) {
  const categories = [
    { 
      id: 'mothers-day', 
      name: "Mother's Day", 
      emoji: '🌸', 
      color: 'from-pink-400 to-rose-400',
      description: 'Celebrate Mom with elegant blooms',
      isLuxury: true
    },
    { 
      id: 'birthday', 
      name: 'Birthday', 
      emoji: '🎈', 
      color: 'from-amber-400 to-orange-400',
      description: 'Premium birthday celebrations',
      isLuxury: true
    },
    { 
      id: 'love', 
      name: 'Love & Romance', 
      emoji: '❤️', 
      color: 'from-red-500 to-rose-600',
      description: 'Luxurious romantic expressions',
      isLuxury: true
    },
    { 
      id: 'celebration', 
      name: 'Celebration', 
      emoji: '✨', 
      color: 'from-yellow-400 to-amber-500',
      description: 'Opulent celebration moments',
      isLuxury: true
    }
  ];

  const spiritualCategories = [
    { 
      id: 'dearly-departed', 
      name: 'Dearly Departed', 
      emoji: '✟', 
      color: 'from-purple-400 to-purple-600',
      description: 'Memorial & remembrance blooms',
      isSpiritual: true,
      crossSymbol: true
    },
    { 
      id: 'heavenly-birthday', 
      name: 'Heavenly Birthday', 
      emoji: '✟', 
      color: 'from-blue-400 to-blue-600',
      description: 'Celebrating life in paradise',
      isSpiritual: true,
      crossSymbol: true,
      extraIcon: '✨'
    },
    { 
      id: 'sympathy-comfort', 
      name: 'Sympathy & Comfort', 
      emoji: '🕊️', 
      color: 'from-green-400 to-green-600',
      description: 'Words of peace and solace',
      isSpiritual: true
    },
    { 
      id: 'prayer-blessing', 
      name: 'Prayer & Blessing', 
      emoji: '🙏', 
      color: 'from-gold-400 to-gold-600',
      description: 'Divine grace and blessings',
      isSpiritual: true
    }
  ];

  return (
    <div className="space-y-8 px-4 animate-slide-in pb-24">
      {/* Luxury Header */}
      <div className="text-left mb-8">
        <div className="luxury-glass rounded-3xl p-6 diamond-sparkle">
          <h2 className="luxury-serif text-3xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Choose Your Occasion
            <Crown className="inline-block ml-3 text-gold-500 w-7 h-7" />
          </h2>
          <p className="luxury-sans text-gray-700 font-medium">
            Select the type of luxury bloom experience to create
          </p>
        </div>
      </div>

      {/* Premium Occasions */}
      <div className="space-y-4">
        <h3 className="luxury-serif text-xl font-semibold text-gray-900 ml-2">Premium Occasions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="luxury-glass rounded-3xl p-6 hover:scale-[1.02] transition-all duration-500 text-left group diamond-sparkle gold-trim hover:shadow-gold-glow"
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                  {cat.emoji}
                  {cat.isLuxury && <Crown className="absolute -top-1 -right-1 w-4 h-4 text-gold-500" />}
                </div>
                <div className="flex-1">
                  <span className="luxury-serif font-bold text-gray-900 text-lg">{cat.name}</span>
                  <Star className="inline-block ml-2 text-gold-400 w-4 h-4" />
                </div>
              </div>
              <p className="luxury-sans text-gray-600 text-sm leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 flex justify-end">
                <div className="luxury-button px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Create
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spiritual Collections */}
      <div className="space-y-4">
        <div className="luxury-glass rounded-2xl p-4">
          <h3 className="luxury-serif text-xl font-semibold text-gray-900 ml-2 flex items-center">
            Sacred Collections
            <Cross className="cross-symbol ml-3 text-gold-500 w-6 h-6" />
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spiritualCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`luxury-glass rounded-3xl p-6 hover:scale-[1.02] transition-all duration-500 text-left group diamond-sparkle ${
                cat.isSpiritual ? 'memorial-card border-2 border-purple-200/30' : ''
              }`}
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-lg relative`}>
                  <span className={cat.crossSymbol ? 'cross-symbol' : ''}>{cat.emoji}</span>
                  {cat.extraIcon && <span className="absolute -top-1 -right-1 text-sm">{cat.extraIcon}</span>}
                </div>
                <div className="flex-1">
                  <span className="luxury-serif font-bold text-gray-900 text-lg">{cat.name}</span>
                  <Heart className="inline-block ml-2 text-purple-400 w-4 h-4" />
                </div>
              </div>
              <p className="luxury-sans text-gray-600 text-sm leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 flex justify-end">
                <div className="luxury-button px-4 py-2 text-sm bg-gradient-to-r from-purple-400 to-purple-600">
                  <Cross className="w-4 h-4 mr-1" />
                  Create Sacred
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Premium floating particles */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${10 + Math.random() * 8}s`,
              background: i % 4 === 0 ? 'var(--gold-accent)' : 
                         i % 4 === 1 ? 'var(--memorial-purple)' : 
                         i % 4 === 2 ? 'var(--heavenly-blue)' : 
                         'var(--gold-primary)',
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
