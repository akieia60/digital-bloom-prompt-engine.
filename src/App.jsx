import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import { usePrompts } from './hooks/usePrompts';

// Placeholder for Video Vault
function VideoVault() {
  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col pt-12">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Video Vault</h2>
        <p className="text-gray-600 font-medium">Your generated creations</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 h-[60vh]">
        <div className="glass p-8 rounded-3xl w-full flex flex-col items-center space-y-4">
          <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <p className="font-semibold text-lg text-center">Video linking coming soon!</p>
          <p className="text-sm text-center">You will be able to tag your generated files to the prompts that created them here.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { prompts, addPrompt, deletePrompt } = usePrompts();

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-amber-200">
      <main>
        {currentView === 'dashboard' && <Dashboard prompts={prompts} deletePrompt={deletePrompt} />}
        {currentView === 'voice' && <VoiceInput addPrompt={addPrompt} onSaved={() => setCurrentView('dashboard')} />}
        {currentView === 'vault' && <VideoVault />}
      </main>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;
