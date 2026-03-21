import { Heart, Star, Cross, Sparkles } from 'lucide-react';

const SPIRITUAL_CATEGORIES = [
  {
    id: 'dearly-departed',
    title: 'Dearly Departed',
    subtitle: 'Memorial & Remembrance',
    icon: '✟',
    description: 'Honor their memory with beautiful digital blooms',
    gradient: 'from-purple-400 to-purple-600',
    glowColor: 'purple'
  },
  {
    id: 'heavenly-birthday',
    title: 'Heavenly Birthday',
    subtitle: 'Celebrating in Paradise',
    icon: '✟ ✨',
    description: 'Commemorate their special day with heavenly blooms',
    gradient: 'from-blue-400 to-blue-600',
    glowColor: 'blue'
  },
  {
    id: 'sympathy-comfort',
    title: 'Sympathy & Comfort',
    subtitle: 'Words of Solace',
    icon: '🕊️',
    description: 'Gentle messages of peace and comfort',
    gradient: 'from-green-400 to-green-600',
    glowColor: 'green'
  },
  {
    id: 'prayer-blessing',
    title: 'Prayer & Blessing',
    subtitle: 'Divine Grace',
    icon: '🙏',
    description: 'Spiritual blessings and prayer blooms',
    gradient: 'from-gold-400 to-gold-600',
    glowColor: 'gold'
  }
];

export default function SpiritualCategories({ onSelectCategory }) {
  return (
    <div className="pb-24 pt-6 px-4 animate-slide-in">
      <div className="text-center mb-8">
        <div className="luxury-glass rounded-3xl p-6 diamond-sparkle mb-6">
          <h1 className="luxury-serif text-3xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Spiritual Collections
            <Cross className="inline-block ml-3 text-gold-500 w-7 h-7 cross-symbol" />
          </h1>
          <p className="luxury-sans text-gray-700 font-medium">
            Sacred digital blooms for meaningful moments
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {SPIRITUAL_CATEGORIES.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`luxury-glass rounded-3xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-500 gold-trim diamond-sparkle memorial-card hover:shadow-${category.glowColor}-300/20`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full luxury-glass flex items-center justify-center text-2xl cross-symbol">
                {category.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="luxury-serif text-xl font-bold text-gray-900 mb-1">
                  {category.title}
                </h3>
                <p className="luxury-script text-gray-600 text-sm">
                  {category.subtitle}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${category.gradient} flex items-center justify-center`}>
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="luxury-glass-util rounded-2xl p-4">
              <p className="luxury-sans text-gray-700 text-sm leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="mt-4 flex justify-center">
              <button className="luxury-button px-8 py-3 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Sacred Bloom
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spiritual ambient particles */}
      <div className="particles-container">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
              background: i % 3 === 0 ? 'var(--gold-accent)' : i % 3 === 1 ? 'var(--memorial-purple)' : 'var(--heavenly-blue)',
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}