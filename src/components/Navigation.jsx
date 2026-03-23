import { Home, Mic, Video, Sparkles, Terminal, Crown, Calendar, Church, PlayCircle, Bot, Library } from 'lucide-react';

export default function Navigation({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Prompts' },
    { id: 'library', icon: Library, label: 'My Videos' },
    { id: 'create', icon: Sparkles, label: 'Create' },
    { id: 'generation', icon: PlayCircle, label: 'Live Gen' },
    { id: 'monique', icon: Bot, label: 'Monique' },
    { id: 'subscription', icon: Crown, label: 'Plans' },
    { id: 'voice', icon: Mic, label: 'Dictate' },
    { id: 'vault', icon: Video, label: 'Vault' },
    { id: 'church', icon: Church, label: 'Church' },
    { id: 'command', icon: Terminal, label: 'Tasks' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/40 z-50 backdrop-blur-2xl overflow-x-auto">
      <div className="flex justify-between items-center h-16 px-2 min-w-max">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-[60px] space-y-1 transition-all duration-300 hover:scale-105 relative ${
                isActive 
                  ? 'text-amber-600 transform scale-110' 
                  : 'text-gray-600 hover:text-amber-500'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
              )}
              
              <Icon size={20} className="transition-all duration-300" />
              
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

    </nav>
  );
}
