import { Crown, Sparkles, Star, Diamond, Heart } from 'lucide-react';

export default function LuxuryLoadingScreen() {
  return (
    <div className="fixed inset-0 luxury-glass flex items-center justify-center z-50 marble-texture">
      {/* Premium loading animation */}
      <div className="text-center space-y-8">
        {/* Brand with luxury styling */}
        <div className="luxury-glass rounded-3xl p-8 diamond-sparkle gold-trim">
          <h1 className="luxury-serif text-4xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-4">
            Digital Bloom
            <Crown className="inline-block ml-4 text-gold-500 w-10 h-10 animate-bounce" />
          </h1>
          <p className="luxury-script text-xl text-gray-700 mb-6">
            Luxury Digital Experiences
          </p>
          
          {/* Premium loading spinner */}
          <div className="luxury-loading mx-auto mb-6"></div>
          
          <p className="luxury-sans text-gray-600 font-medium">
            Initializing Premium Experience...
          </p>
        </div>
        
        {/* Luxury feature highlights */}
        <div className="luxury-glass rounded-2xl p-6 max-w-md">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <Star className="w-8 h-8 text-gold-500 mx-auto animate-sparkle" />
              <p className="luxury-sans text-sm text-gray-700 font-medium">Premium Quality</p>
            </div>
            <div className="space-y-2">
              <Sparkles className="w-8 h-8 text-gold-500 mx-auto animate-sparkle" />
              <p className="luxury-sans text-sm text-gray-700 font-medium">Luxury Design</p>
            </div>
            <div className="space-y-2">
              <Diamond className="w-8 h-8 text-gold-500 mx-auto animate-sparkle" />
              <p className="luxury-sans text-sm text-gray-700 font-medium">Elite Experience</p>
            </div>
            <div className="space-y-2">
              <Heart className="w-8 h-8 text-gold-500 mx-auto animate-sparkle cross-symbol" />
              <p className="luxury-sans text-sm text-gray-700 font-medium">Sacred Collections</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium background particles */}
      <div className="particles-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              background: i % 4 === 0 ? 'var(--gold-accent)' : 
                         i % 4 === 1 ? 'var(--gold-primary)' : 
                         i % 4 === 2 ? 'var(--memorial-purple)' : 
                         'var(--heavenly-blue)',
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}