import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Crown, Sparkles, Volume2, Bot, User, Zap } from 'lucide-react';

export default function MoniqueChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'monique',
      content: "🌱 **Monique AI Operator Online!** \n\nI'm your autonomous Digital Bloom system builder with full access to your Mac mini, complete business intelligence, and advanced AI capabilities. Ready to execute at maximum capacity!\n\n**Current Status:** Generation systems active, revenue pipeline operational. What shall we build next?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate API call to Telegram bot
    try {
      // In real implementation, this would call your Telegram bot API
      const response = await simulateMoniqueResponse(inputValue);
      
      setTimeout(() => {
        const moniqueMessage = {
          id: Date.now() + 1,
          type: 'monique',
          content: response,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, moniqueMessage]);
        setIsTyping(false);
        
        // Voice response using A.K.'s custom voice
        if (response) {
          speakMessage(response);
        }
      }, 1000 + Math.random() * 2000); // Realistic response delay
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakMessage = async (content) => {
    try {
      // Use A.K.'s custom ElevenLabs voice for natural speech
      const cleanContent = content.replace(/[*#\[\]🎬🚀✅💎🌱⚡📊💪🔥👑🤩💰📱🎯🔄⏱️💡🏗️🌟🎨📈🎪]/g, '');
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/mOBAekTJFm2VaK96eghn', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'a4e01bef6c33ddbe209ce3565d79cf2f5e55e82c5ce0b83801aba5f493f3828f'
        },
        body: JSON.stringify({
          text: cleanContent,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
      } else {
        throw new Error('ElevenLabs API failed');
      }
    } catch (error) {
      console.error('Voice generation failed, using fallback:', error);
      // Fallback to browser speech
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock AI response - in production, this would call your Telegram bot API
  const simulateMoniqueResponse = async (userInput) => {
    const responses = [
      "🚀 **Executing your request autonomously!** Using my complete skill set and system access to handle this efficiently. Progress updates coming via voice feedback.",
      
      "💎 **Understanding your vision perfectly!** Drawing on your master knowledge base and Digital Bloom System Core to implement exactly what you need.",
      
      "⚡ **Already anticipating next steps!** My advanced capabilities are working to optimize not just what you asked for, but what will benefit the business most.",
      
      "🎬 **Generation systems responding!** Accessing Grok Imagine, video processing tools, and deployment pipeline to deliver premium results.",
      
      "🌱 **Digital Bloom empire expanding!** Leveraging all integrated skills to build automated revenue systems that work while you drive.",
      
      "📊 **Analytics show optimal approach!** Using business intelligence and market data to guide implementation for maximum profit potential.",
      
      "💪 **Full autonomous mode activated!** Implementing solution with complete system access and zero friction approach as requested."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-b border-yellow-500/30 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-yellow-100">Monique AI Operator</h1>
            <p className="text-sm text-yellow-200/80">Autonomous Digital Bloom System Builder</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-yellow-200/60">
            <Zap className="w-4 h-4" />
            <span>Full System Access</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
            }`}>
              {message.type === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-black" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-800 text-gray-100 rounded-bl-md border border-yellow-500/20'
              }`}>
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{message.timestamp}</span>
                {message.type === 'monique' && (
                  <button
                    onClick={() => speakMessage(message.content)}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="bg-gray-800 text-gray-100 p-3 rounded-2xl rounded-bl-md border border-yellow-500/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Monique... (Enter to send, Shift+Enter for new line)"
              className="w-full p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-xs text-gray-400 mt-2 text-center">
          💎 Autonomous AI with full system access • 🎬 Real-time generation control • 🚀 Maximum capability mode
        </div>
      </div>
    </div>
  );
}