import { useState, useRef } from 'react';
import { Mic, Square, Save } from 'lucide-react';

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
        alert("Your browser does not support Voice Dictation. Try Chrome or Safari.");
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
      
      const utterance = new SpeechSynthesisUtterance("Listening");
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    if (!transcript.trim()) return;
    addPrompt({
      title: title || 'Voice Note ' + new Date().toLocaleTimeString(),
      text: transcript,
      category
    });
    
    const utterance = new SpeechSynthesisUtterance("Prompt saved");
    window.speechSynthesis.speak(utterance);
    
    setTranscript('');
    setTitle('');
    onSaved();
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-gray-800">New Dictation</h2>
        <p className="text-gray-600 font-medium">Capture ideas on the road</p>
      </div>

      <div className="glass rounded-3xl p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isListening 
                ? 'bg-red-500 animate-pulse ring-4 ring-red-200' 
                : 'bg-gradient-to-tr from-amber-400 to-orange-500'
            }`}
          >
            {isListening ? (
              <Square size={40} className="text-white fill-current" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
          </button>
          <p className="text-gray-500 font-bold">
            {isListening ? 'Tap to stop' : 'Tap to speak'}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <input
            type="text"
            placeholder="Prompt Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
          />
          
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium appearance-none"
          >
            <option value="Custom">Custom / General</option>
            <option value="Hero">Hero</option>
            <option value="Celebration">Celebration</option>
            <option value="Narrative">Narrative</option>
          </select>

          <textarea
            rows={5}
            placeholder="Your transcribed prompt will appear here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed"
          ></textarea>
        </div>

        <button
          onClick={handleSave}
          disabled={!transcript.trim()}
          className="w-full bg-gray-900 text-white rounded-xl py-4 flex items-center justify-center space-x-2 font-bold disabled:opacity-50 transition-opacity"
        >
          <Save size={20} />
          <span>Save Prompt</span>
        </button>
      </div>
    </div>
  );
}
