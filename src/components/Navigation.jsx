import { Home, Mic, Video, Sparkles, Terminal } from 'lucide-react';

export default function Navigation({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Prompts' },
    { id: 'create', icon: Sparkles, label: 'Create' },
    { id: 'voice', icon: Mic, label: 'Dictate' },
    { id: 'vault', icon: Video, label: 'Vault' },
    { id: 'command', icon: Terminal, label: 'Tasks' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === id ? 'text-amber-500' : 'text-gray-500'
            }`}
          >
            <Icon size={24} className={currentView === id ? 'animate-bounce' : ''} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
