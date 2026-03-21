import { useState, useRef } from 'react';
import { Mic, Square, Save, Crown, Star, Sparkles, Cross } from 'lucide-react';

export default function VoiceInput({ addPrompt, onSaved }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom');
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

  const handleSave = () => {
    if (!transcript.trim()) return;
    
    // Enhance prompt with luxury context based on category
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
    onSaved();
  };

  // Check if current category is spiritual
  const isSpiritual = category.toLowerCase().includes('dearly departed') || 
                     category.toLowerCase().includes('heavenly birthday') || 
                     category.toLowerCase().includes('memorial') || 
                     category.toLowerCase().includes('prayer');

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
            {/* Luxury microphone visualization */}
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
            
            {/* Premium crown indicator */}
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
          
          <div className="luxury-glass-util rounded-2xl p-1 relative">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl px-6 py-4 focus:outline-none luxury-sans font-medium text-gray-900 appearance-none cursor-pointer"
            >
              <option value="Custom">Custom / General</option>
              <option value="Hero">Hero Collection</option>
              <option value="Celebration">Premium Celebrations</option>
              <option value="Narrative">Luxury Narratives</option>
              <option value="Dearly Departed">✟ Dearly Departed</option>
              <option value="Heavenly Birthday">✟ Heavenly Birthday</option>
              <option value="Prayer & Blessing">🙏 Prayer & Blessing</option>
            </select>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {isSpiritual ? (
                <Cross className="w-5 h-5 text-gold-500 cross-symbol" />
              ) : (
                <Star className="w-5 h-5 text-gold-500" />
              )}
            </div>
          </div>

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
