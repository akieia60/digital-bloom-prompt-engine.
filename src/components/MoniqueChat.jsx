import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Crown,
  Volume2,
  VolumeX,
  Bot,
  User,
  Zap,
  Loader2,
  Play,
  Pause,
} from 'lucide-react';

const INITIAL_MESSAGE = {
  id: 1,
  type: 'monique',
  content:
    "Monique is online. I know Digital Bloom, your prompt library, and the command-center workflow. Talk to me normally — I’ll keep it short, useful, and voice-ready.",
  timestamp: new Date().toLocaleTimeString(),
};

const FALLBACK_RESPONSES = [
  'Monique chat is connected, but the live response failed. I need the command-center AI route checked so I can answer here properly.',
  'The Monique command-center reply failed upstream. I can fix it, but this screen should not be trusted for final answers until that route is healthy.',
  'The live Monique reply did not come through. This is a fallback notice, not a real assistant answer.',
];

function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' code omitted ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#$*_~>\[\]()/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function requestChatReply(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const response = await fetch('/api/monique-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const details = payload?.details ? ` ${payload.details}` : '';
      throw new Error((payload?.error || 'Chat request failed') + details);
    }

    const payload = await response.json();
    return payload?.reply?.trim() || null;
  } catch (error) {
    console.error('Monique chat fallback triggered:', error);
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}

export default function MoniqueChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [audioStatus, setAudioStatus] = useState('idle');
  const [audioMessageId, setAudioMessageId] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setRecognitionSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setInputValue((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const lastMoniqueMessage = useMemo(
    () => [...messages].reverse().find((message) => message.type === 'monique'),
    [messages]
  );

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    window.speechSynthesis?.cancel();
    setAudioStatus('idle');
    setAudioMessageId(null);
  }

  async function speakWithBrowser(text, messageId = null) {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser speech is not supported on this device');
    }

    stopAudio();
    setAudioStatus('playing');
    setAudioMessageId(messageId);

    await new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setAudioStatus('idle');
        setAudioMessageId(null);
        resolve();
      };
      utterance.onerror = () => {
        setAudioStatus('idle');
        setAudioMessageId(null);
        reject(new Error('Browser speech failed'));
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  async function speakMessage(content, messageId = null) {
    const text = cleanForSpeech(content);
    if (!text) return;

    setVoiceError('');

    try {
      stopAudio();
      setAudioStatus('loading');
      setAudioMessageId(messageId);

      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Voice request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;

      audio.onended = () => {
        stopAudio();
      };

      audio.onerror = async () => {
        stopAudio();
        try {
          await speakWithBrowser(text, messageId);
        } catch (error) {
          setVoiceError(error.message);
        }
      };

      setAudioStatus('playing');
      await audio.play();
    } catch (error) {
      console.error('Voice playback failed:', error);
      try {
        await speakWithBrowser(text, messageId);
      } catch (fallbackError) {
        console.error('Browser speech fallback failed:', fallbackError);
        stopAudio();
        setVoiceError(error.message || fallbackError.message || 'Voice playback failed');
      }
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await requestChatReply(userMessage.content);
      const moniqueMessage = {
        id: Date.now() + 1,
        type: 'monique',
        content: reply || 'I heard you. Try that again and I’ll keep going.',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, moniqueMessage]);
      setIsTyping(false);

      if (autoPlay && audioEnabled && moniqueMessage.content) {
        await speakMessage(moniqueMessage.content, moniqueMessage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  const toggleAudio = async () => {
    if (audioStatus === 'playing' || audioStatus === 'loading') {
      stopAudio();
      return;
    }

    if (lastMoniqueMessage) {
      await speakMessage(lastMoniqueMessage.content, lastMoniqueMessage.id);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-gradient-to-br from-black via-gray-900 to-black rounded-t-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-b border-yellow-500/30 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-yellow-100">Monique</h1>
            <p className="text-sm text-yellow-200/80">Road-ready operator chat with voice playback</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-yellow-200/70">
            <Zap className="w-4 h-4" />
            <span>{audioEnabled ? 'Voice on' : 'Voice muted'}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={toggleAudio}
            className="px-3 py-2 rounded-xl bg-yellow-500 text-black text-sm font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
          >
            {audioStatus === 'playing' || audioStatus === 'loading' ? (
              <>
                <Pause className="w-4 h-4" /> Stop audio
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Listen
              </>
            )}
          </button>

          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
              autoPlay ? 'bg-white/15 text-yellow-100 border border-yellow-500/30' : 'bg-white/5 text-gray-300 border border-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Auto-play {autoPlay ? 'on' : 'off'}
          </button>

          <button
            onClick={() => {
              setAudioEnabled((prev) => !prev);
              stopAudio();
            }}
            className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
              audioEnabled ? 'bg-white/15 text-yellow-100 border border-yellow-500/30' : 'bg-white/5 text-gray-300 border border-white/10'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'Voice enabled' : 'Voice muted'}
          </button>
        </div>

        {voiceError && <p className="mt-2 text-xs text-red-300">Voice note: {voiceError}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.map((message) => {
          const isMonique = message.type === 'monique';
          const isCurrentAudio = audioMessageId === message.id && (audioStatus === 'loading' || audioStatus === 'playing');

          return (
            <div key={message.id} className={`flex gap-3 ${isMonique ? 'flex-row' : 'flex-row-reverse'}`}>
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isMonique ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-blue-600'
                }`}
              >
                {isMonique ? <Bot className="w-5 h-5 text-black" /> : <User className="w-5 h-5 text-white" />}
              </div>

              <div className={`max-w-[85%] ${isMonique ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                <div
                  className={`p-3 rounded-2xl ${
                    isMonique
                      ? 'bg-gray-800 text-gray-100 rounded-bl-md border border-yellow-500/20'
                      : 'bg-blue-600 text-white rounded-br-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                  {isMonique && (
                    <button
                      onClick={() => speakMessage(message.content, message.id)}
                      className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 text-xs"
                    >
                      {isCurrentAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                      Listen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="bg-gray-800 text-gray-100 p-3 rounded-2xl rounded-bl-md border border-yellow-500/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4 bg-black/30">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Talk to Monique…"
              className="w-full p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleVoiceToggle}
            disabled={!recognitionSupported}
            className={`p-3 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-600 text-white'
                : recognitionSupported
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            title={recognitionSupported ? 'Tap to dictate' : 'Speech input not supported in this browser'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-gray-400 mt-2 text-center">
          Mobile-friendly chat • ElevenLabs voice playback • Browser dictation when supported
        </div>
      </div>
    </div>
  );
}
