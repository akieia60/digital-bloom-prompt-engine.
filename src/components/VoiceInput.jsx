import { useState, useRef } from 'react';
import { Mic, Square, Save, Crown, Star, Sparkles, Cross, Wand2, Copy, Check, ChevronDown } from 'lucide-react';

// Prompt enhancement styles from Manus's PromptEnhancer
const ENHANCEMENT_STYLES = {
  cinematic: {
    label: '🎬 Cinematic',
    prefix: 'Cinematic, dramatic lighting, shallow depth of field, film grain, ',
    suffix: '. Shot on 35mm film, golden hour lighting, bokeh background, professional color grading.',
  },
  luxury: {
    label: '💎 Luxury',
    prefix: 'Ultra-luxurious, opulent, ',
    suffix: '. Rich velvet textures, gold leaf accents, crystal reflections, premium quality, 8K resolution.',
  },
  ethereal: {
    label: '✨ Ethereal',
    prefix: 'Dreamy, ethereal, soft-focus, ',
    suffix: '. Gentle particle effects, iridescent light, pastel color palette, floating petals, magical atmosphere.',
  },
  bold: {
    label: '🔥 Bold & Viral',
    prefix: 'Eye-catching, vibrant, high-contrast, ',
    suffix: '. Dynamic camera movement, saturated colors, trending aesthetic, social media optimized, attention-grabbing.',
  },
  romantic: {
    label: '💕 Romantic',
    prefix: 'Romantic, warm, intimate, ',
    suffix: '. Soft candlelight, rose petals, warm amber tones, gentle motion, heartfelt atmosphere.',
  },
};

// All categories from Manus's prompt-library.md + spiritual categories
const CATEGORIES = [
  { value: 'Custom', label: 'Custom / General', icon: '✏️' },
  { value: 'Hero', label: 'Hero Collection', icon: '👑' },
  { value: "Mother's Day", label: "Mother's Day", icon: '💐' },
  { value: 'Birthday', label: 'Birthday', icon: '🎂' },
  { value: 'Love', label: 'Love', icon: '❤️' },
  { value: 'Celebration', label: 'Celebration', icon: '🎉' },
  { value: 'Friendship', label: 'Friendship', icon: '🤝' },
  { value: 'Thinking of You', label: 'Thinking of You', icon: '💭' },
  { value: 'Anniversary', label: 'Anniversary', icon: '💍' },
  { value: 'Sympathy', label: 'Sympathy', icon: '🕊️' },
  { value: 'Thank You', label: 'Thank You', icon: '🙏' },
  { value: 'Graduation', label: 'Graduation', icon: '🎓' },
  { value: 'Wedding', label: 'Wedding', icon: '💒' },
  { value: 'Get Well', label: 'Get Well', icon: '🌻' },
  { value: 'Just Because', label: 'Just Because', icon: '🌹' },
  { value: 'Grief', label: 'Grief & Remembrance', icon: '🕯️' },
  { value: 'Luxury', label: 'Luxury Collection', icon: '✨' },
  { value: 'Zodiac', label: 'Zodiac', icon: '♈' },
  { value: 'Narrative', label: 'Narrative Gift Bloom', icon: '📖' },
  { value: 'Photo Bloom', label: 'Photo Bloom Experience', icon: '📸' },
  { value: 'Dearly Departed', label: '✟ Dearly Departed', icon: '✟', spiritual: true },
  { value: 'Heavenly Birthday', label: '✟ Heavenly Birthday', icon: '✟', spiritual: true },
  { value: 'Prayer & Blessing', label: '🙏 Prayer & Blessing', icon: '🙏', spiritual: true },
];

export default function VoiceInput({ addPrompt, onSaved }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom');
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [enhanceStyle, setEnhanceStyle] = useState('cinematic');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const utterance = new SpeechSynthesisUtterance("Your browser does not support Voice Dictation. Please try Chrome or Safari for the premium experience.");
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      
      const utterance = new SpeechSynthesisUtterance("Premium Voice Dictation Active - Listening with Elegance");
      utterance.rate = 1.1;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Prompt Enhancer logic (from Manus)
  const handleEnhance = () => {
    if (!transcript.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      const config = ENHANCEMENT_STYLES[enhanceStyle];
      const enhanced = config.prefix + transcript.trim() + config.suffix;
      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);
    }, 800);
  };

  const handleUseEnhanced = () => {
    if (enhancedPrompt) {
      setTranscript(enhancedPrompt);
      setShowEnhancer(false);
      setEnhancedPrompt('');
    }
  };

  const handleCopyEnhanced = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silently fail */ }
  };

  const handleSave = () => {
    if (!transcript.trim()) return;
    
    // Enhance prompt with context based on category
    let enhancedText = transcript;
    if (category.toLowerCase().includes('dearly departed') || category.toLowerCase().includes('memorial')) {
      enhancedText = `[Memorial] ${transcript}`;
    } else if (category.toLowerCase().includes('heavenly birthday')) {
      enhancedText = `[Heavenly Birthday] ${transcript}`;
    } else {
      enhancedText = `[Premium] ${transcript}`;
    }
    
    addPrompt({
      title: title || 'Voice Note ' + new Date().toLocaleTimeString(),
      text: enhancedText,
      category
    });
    
    const utterance = new SpeechSynthesisUtterance("Luxury prompt saved with elegance");
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
    
    setTranscript('');
    setTitle('');
    setEnhancedPrompt('');
    onSaved();
  };

  // Check if current category is spiritual
  const selectedCat = CATEGORIES.find(c => c.value === category);
  const isSpiritual = selectedCat?.spiritual || false;

  return (
    <div className="pb-24 pt-6 px-4 space-y-8 animate-slide-in">
      {/* Luxury header */}
      <div className="text-left">
        <div className="luxury-glass rounded-3xl p-6 diamond-sparkle">
          <h2 className="luxury-serif text-3xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Premium Dictation
            <Crown className="inline-block ml-3 text-gold-500 w-7 h-7" />
          </h2>
          <p className="luxury-sans text-gray-700 font-medium">
            Capture luxury ideas on the road with elegance
            <Star className="inline-block ml-2 text-gold-400 w-5 h-5" />
          </p>
        </div>
      </div>

      <div className="luxury-glass rounded-3xl p-8 space-y-8 diamond-sparkle gold-trim">
        {/* Premium voice control */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <button
            onClick={toggleListening}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-luxury transition-all transform active:scale-95 relative ${
              isListening 
                ? 'bg-gradient-to-r from-red-400 to-red-600 animate-gold-pulse ring-4 ring-red-300/50' 
                : 'luxury-button hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <Square size={50} className="text-white fill-current z-10" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-red-600 animate-pulse"></div>
              </>
            ) : (
              <>
                <Mic size={50} className="text-gray-900 z-10" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 animate-shimmer"></div>
              </>
            )}
            <Crown className="absolute -top-2 -right-2 w-8 h-8 text-gold-500 animate-bounce" />
          </button>
          
          <div className="text-center">
            <p className="luxury-sans text-gray-700 font-bold text-lg">
              {isListening ? 'Recording with Premium Quality' : 'Touch to Begin Luxury Dictation'}
            </p>
            <p className="luxury-script text-gray-600 text-sm mt-1">
              {isListening ? 'Tap to complete your masterpiece' : 'Your voice, elevated to artistry'}
            </p>
          </div>
        </div>

        {/* Premium form controls */}
        <div className="space-y-6 pt-6">
          <div className="luxury-glass-util rounded-2xl p-1">
            <input
              type="text"
              placeholder="Premium Prompt Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl px-6 py-4 focus:outline-none luxury-sans font-medium text-gray-900 placeholder-gray-500"
            />
          </div>
          
          {/* Expanded Category Selector */}
          <div className="luxury-glass-util rounded-2xl p-1 relative">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl px-6 py-4 focus:outline-none luxury-sans font-medium text-gray-900 appearance-none cursor-pointer"
            >
              <optgroup label="🌟 Occasions">
                {CATEGORIES.filter(c => !c.spiritual && !['Hero', 'Luxury', 'Zodiac', 'Narrative', 'Photo Bloom', 'Custom'].includes(c.value)).map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </optgroup>
              <optgroup label="👑 Premium Collections">
                {CATEGORIES.filter(c => ['Custom', 'Hero', 'Luxury', 'Zodiac', 'Narrative', 'Photo Bloom'].includes(c.value)).map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </optgroup>
              <optgroup label="✟ Spiritual">
                {CATEGORIES.filter(c => c.spiritual).map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </optgroup>
            </select>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {isSpiritual ? (
                <Cross className="w-5 h-5 text-gold-500 cross-symbol" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gold-500" />
              )}
            </div>
          </div>

          {/* Prompt text area */}
          <div className="luxury-glass-util rounded-2xl p-4">
            <textarea
              rows={6}
              placeholder="Your luxury transcription will appear here with premium accuracy..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-transparent border-0 focus:outline-none luxury-sans leading-relaxed text-gray-900 placeholder-gray-500 resize-none"
            ></textarea>
          </div>
        </div>

        {/* ✨ Prompt Enhancer Button */}
        {transcript.trim() && !showEnhancer && (
          <button
            onClick={() => setShowEnhancer(true)}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed border-purple-400/30 text-purple-500 hover:bg-purple-50/50 transition-all"
          >
            <Wand2 size={20} />
            <span className="luxury-sans font-bold">✨ Enhance My Prompt</span>
          </button>
        )}

        {/* ✨ Prompt Enhancer Panel */}
        {showEnhancer && (
          <div className="luxury-glass-util rounded-2xl p-5 space-y-4 border border-purple-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wand2 size={18} className="text-purple-500" />
                <h3 className="luxury-sans font-bold text-gray-800">Prompt Enhancer</h3>
              </div>
              <button 
                onClick={() => { setShowEnhancer(false); setEnhancedPrompt(''); }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>

            {/* Style picker */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(ENHANCEMENT_STYLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setEnhanceStyle(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold luxury-sans transition-all ${
                    enhanceStyle === key
                      ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-sm'
                      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>

            {/* Enhance button */}
            <button
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold luxury-sans transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isEnhancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Enhance Now</span>
                </>
              )}
            </button>

            {/* Enhanced result */}
            {enhancedPrompt && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm text-gray-800 leading-relaxed">
                  {enhancedPrompt}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyEnhanced}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-xs hover:bg-gray-200 transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleUseEnhanced}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-purple-100 text-purple-700 font-medium text-xs hover:bg-purple-200 transition-all"
                  >
                    <Check size={14} />
                    <span>Use This Prompt</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium save button */}
        <button
          onClick={handleSave}
          disabled={!transcript.trim()}
          className={`luxury-button w-full py-6 flex items-center justify-center space-x-3 font-bold disabled:opacity-50 transition-all ${
            !transcript.trim() ? 'cursor-not-allowed' : 'hover:shadow-gold-glow'
          }`}
        >
          <Save size={24} />
          <span>Save Luxury Prompt</span>
          <Sparkles size={20} />
        </button>
      </div>

      {/* Premium floating particles */}
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
              background: isSpiritual 
                ? (i % 3 === 0 ? 'var(--memorial-purple)' : i % 3 === 1 ? 'var(--heavenly-blue)' : 'var(--cross-gold)')
                : 'var(--gold-accent)',
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
