import { useState, useEffect } from 'react';
import { Crown, CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    gradient: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  error: {
    icon: XCircle,
    gradient: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  warning: {
    icon: AlertCircle,
    gradient: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600'
  },
  info: {
    icon: Info,
    gradient: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  luxury: {
    icon: Crown,
    gradient: 'from-gold-400 to-gold-600',
    bgColor: 'bg-gold-50',
    iconColor: 'text-gold-600'
  }
};

export default function LuxuryToast({ message, type = 'info', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`luxury-toast fixed top-4 right-4 z-50 transition-all duration-300 ${
      isExiting ? 'opacity-0 transform translate-x-full scale-95' : 'opacity-100 transform translate-x-0 scale-100'
    }`}>
      <div className="luxury-glass rounded-2xl p-4 min-w-[320px] max-w-md shadow-luxury diamond-sparkle">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon size={16} className="text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="luxury-sans text-gray-900 font-medium leading-relaxed">
              {message}
            </p>
            
            {/* Premium accent line */}
            <div className={`w-full h-px bg-gradient-to-r ${config.gradient} mt-3 opacity-30`}></div>
          </div>
          
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Premium progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all ease-linear`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing toasts
export function useLuxuryToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Enhanced voice feedback for luxury experience
    const utteranceMap = {
      success: 'Success achieved with elegance',
      error: 'Error encountered - Premium support available',
      warning: 'Caution advised for optimal experience', 
      info: 'Information delivered with luxury service',
      luxury: 'Premium notification - Excellence assured'
    };
    
    const utterance = new SpeechSynthesisUtterance(utteranceMap[type] || 'Notification received');
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    utterance.volume = 0.7;
    window.speechSynthesis.speak(utterance);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <LuxuryToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    addToast,
    removeToast,
    clearAll,
    ToastContainer
  };
}

// Add the shrink animation to the CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);