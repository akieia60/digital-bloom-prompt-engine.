import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Scissors, Copy, Check, Trash2, ClipboardPaste,
  Volume2, Save, LayoutGrid, ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import { splitScenes, hasMultipleScenes } from '../utils/splitScenes';

// ─── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_KEY = 'db_saved_splits';
const ACTIVE_KEY  = 'db_active_split';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveSaved(splits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(splits));
}
function loadActive() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); } catch { return null; }
}
function saveActive(data) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(data));
}

// ─── Speech ─────────────────────────────────────────────────────────────────
function speak(text) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1; u.pitch = 1.1; u.volume = 0.9;
    window.speechSynthesis.speak(u);
  } catch {}
}

// ─── SceneCard — shared by both views ───────────────────────────────────────
function SceneCard({ scene, index, compact = false }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scene.text);
      setCopied(true);
      speak(`${scene.label} copied`);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <button
      onClick={copy}
      className={`w-full text-left rounded-2xl border transition-all active:scale-[0.97] ${
        copied
          ? 'bg-green-50 border-green-400 shadow-md shadow-green-100'
          : 'glass border-white/40 hover:border-amber-300'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className={`flex items-center gap-2 mb-2 ${compact ? 'mb-1' : ''}`}>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-white text-xs ${
          copied
            ? 'bg-green-500'
            : 'bg-gradient-to-r from-amber-400 to-orange-400'
        }`}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : scene.label}
        </span>
        {copied && <Volume2 size={14} className="text-green-500" />}
      </div>
      <p className={`text-gray-700 leading-snug ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
        {scene.text}
      </p>
    </button>
  );
}

// ─── Board view — 2 columns side by side ────────────────────────────────────
function BoardView({ saved, onBack }) {
  const [leftIdx, setLeftIdx]   = useState(0);
  const [rightIdx, setRightIdx] = useState(Math.min(1, saved.length - 1));

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
        <Scissors size={40} className="opacity-40" />
        <p className="text-base font-medium">No saved splits yet</p>
        <p className="text-sm text-center">Paste a Grok sequence and save it first</p>
        <button onClick={onBack} className="mt-4 flex items-center gap-2 px-5 py-3 rounded-2xl glass border border-white/40 text-amber-600 font-bold">
          <ArrowLeft size={18} /> Back to Splitter
        </button>
      </div>
    );
  }

  const left  = saved[leftIdx];
  const right = saved[rightIdx];

  return (
    <div className="pb-28 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <button onClick={onBack} className="p-2 rounded-xl glass border border-white/40 text-gray-500 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Board Mode</h2>
          <p className="text-xs text-gray-500">Tap any scene card to copy it</p>
        </div>
      </div>

      {/* Column pickers — compact dropdowns */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { idx: leftIdx,  setIdx: setLeftIdx,  label: 'Left column' },
          { idx: rightIdx, setIdx: setRightIdx, label: 'Right column' },
        ].map(({ idx, setIdx, label }, col) => (
          <div key={col}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
            <select
              value={idx}
              onChange={e => setIdx(Number(e.target.value))}
              className="w-full bg-white/70 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/40"
            >
              {saved.map((s, i) => (
                <option key={s.id} value={i}>{s.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* 2-column scene grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Column headers */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-xs truncate">{left?.name || '—'}</p>
          <p className="text-white/80 text-xs">{left?.scenes.length} scenes</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-xs truncate">{right?.name || '—'}</p>
          <p className="text-white/80 text-xs">{right?.scenes.length} scenes</p>
        </div>

        {/* Scene rows — interleaved so Scene 1 L / Scene 1 R are next to each other */}
        {Array.from({
          length: Math.max(left?.scenes.length || 0, right?.scenes.length || 0)
        }).map((_, i) => (
          <>
            <div key={`l${i}`}>
              {left?.scenes[i]
                ? <SceneCard scene={left.scenes[i]} index={i} compact />
                : <div className="h-full min-h-[60px] rounded-2xl border border-dashed border-gray-200" />
              }
            </div>
            <div key={`r${i}`}>
              {right?.scenes[i]
                ? <SceneCard scene={right.scenes[i]} index={i} compact />
                : <div className="h-full min-h-[60px] rounded-2xl border border-dashed border-gray-200" />
              }
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

// ─── Main PromptSplitter ─────────────────────────────────────────────────────
export default function PromptSplitter() {
  const [rawText,    setRawText]    = useState('');
  const [scenes,     setScenes]     = useState([]);
  const [saved,      setSaved]      = useState(loadSaved);
  const [copiedIdx,  setCopiedIdx]  = useState(null);
  const [allCopied,  setAllCopied]  = useState(false);
  const [boardMode,  setBoardMode]  = useState(false);
  const [savedOpen,  setSavedOpen]  = useState(true);
  const textareaRef = useRef(null);

  // Restore active split on mount (survives app switches)
  useEffect(() => {
    const active = loadActive();
    if (active?.rawText) {
      setRawText(active.rawText);
      setScenes(active.scenes || []);
    }
  }, []);

  const handleTextChange = useCallback((value) => {
    setRawText(value);
    const parsed = hasMultipleScenes(value) ? splitScenes(value) : [];
    setScenes(parsed);
    setCopiedIdx(null);
    setAllCopied(false);
    // Auto-persist so switching to Grok doesn't wipe it
    saveActive({ rawText: value, scenes: parsed });
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleTextChange(text);
      speak('Pasted. Splitting scenes.');
    } catch { textareaRef.current?.focus(); }
  }, [handleTextChange]);

  const copyAll = useCallback(async () => {
    try {
      const combined = scenes.map(s => `${s.label}:\n${s.text}`).join('\n\n---\n\n');
      await navigator.clipboard.writeText(combined);
      setAllCopied(true);
      speak('All scenes copied');
      setTimeout(() => setAllCopied(false), 2500);
    } catch {}
  }, [scenes]);

  const clearActive = useCallback(() => {
    setRawText(''); setScenes([]); setCopiedIdx(null); setAllCopied(false);
    saveActive(null);
    speak('Cleared');
  }, []);

  const saveSplit = useCallback(() => {
    if (!scenes.length) return;
    const now = new Date();
    const name = `Split ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    const entry = { id: Date.now(), name, savedAt: now.toISOString(), scenes };
    const updated = [entry, ...saved].slice(0, 20); // keep last 20
    setSaved(updated);
    saveSaved(updated);
    speak('Split saved');
  }, [scenes, saved]);

  const deleteSave = useCallback((id) => {
    const updated = saved.filter(s => s.id !== id);
    setSaved(updated);
    saveSaved(updated);
  }, [saved]);

  const loadSplit = useCallback((split) => {
    setRawText('');
    setScenes(split.scenes);
    setCopiedIdx(null);
    setAllCopied(false);
    saveActive({ rawText: '', scenes: split.scenes });
    speak(`Loaded ${split.name}`);
  }, []);

  const hasScenes = scenes.length > 0;

  if (boardMode) {
    return (
      <div className="pb-28 pt-6 px-3 min-h-full">
        <BoardView saved={saved} onBack={() => setBoardMode(false)} />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-6 px-4 min-h-full">

      {/* ── Header ── */}
      <div className="mb-5">
        <div className="glass rounded-3xl p-4 border border-white/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="text-amber-500 w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
                  Scene Splitter
                </h2>
                <p className="text-gray-500 text-xs">Paste Grok output → tap to copy each scene</p>
              </div>
            </div>
            {saved.length >= 1 && (
              <button
                onClick={() => setBoardMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm active:scale-95 transition-all shadow-md"
              >
                <LayoutGrid size={16} />
                Board
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Paste area ── */}
      <div className="glass rounded-3xl p-4 border border-white/40 mb-5">
        <button
          onClick={handlePaste}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg active:scale-95 transition-all mb-3"
        >
          <ClipboardPaste size={22} />
          Paste Grok Output
        </button>

        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={'Or type/paste manually…\n\nScene 1/7: …\nScene 2/7: …'}
          className="w-full bg-white/60 rounded-2xl p-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          rows={4}
        />

        {rawText.length > 0 && !hasScenes && (
          <p className="text-center text-gray-400 text-xs mt-2">
            No scenes detected yet — Grok should label them "Scene 1/7:", "Scene 2:", etc.
          </p>
        )}
      </div>

      {/* ── Active split ── */}
      {hasScenes && (
        <div className="mb-6">
          {/* Action row */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={saveSplit}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg active:scale-95 transition-all"
            >
              <Save size={18} />
              Save Split
            </button>
            <button
              onClick={copyAll}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                allCopied ? 'bg-green-500 text-white' : 'glass border border-white/40 text-amber-600'
              }`}
            >
              {allCopied ? <Check size={18} /> : <Copy size={18} />}
              {allCopied ? 'All Copied!' : 'Copy All'}
            </button>
            <button
              onClick={clearActive}
              className="p-4 rounded-2xl glass border border-white/40 text-gray-400 hover:text-red-400 active:scale-95 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {scenes.length} scenes — tap any card to copy
          </p>

          <div className="space-y-3">
            {scenes.map((scene, i) => (
              <SceneCard key={i} scene={scene} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Saved splits ── */}
      {saved.length > 0 && (
        <div className="glass rounded-3xl border border-white/40 overflow-hidden">
          <button
            onClick={() => setSavedOpen(o => !o)}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-bold text-gray-700">
              Saved Splits ({saved.length})
            </span>
            {savedOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {savedOpen && (
            <div className="px-4 pb-4 space-y-2">
              {saved.map((split) => (
                <div key={split.id} className="flex items-center gap-2">
                  <button
                    onClick={() => loadSplit(split)}
                    className="flex-1 text-left py-3 px-4 rounded-2xl bg-white/60 border border-white/40 hover:border-amber-300 active:scale-[0.98] transition-all"
                  >
                    <p className="font-semibold text-gray-800 text-sm truncate">{split.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{split.scenes.length} scenes</p>
                  </button>
                  <button
                    onClick={() => deleteSave(split.id)}
                    className="p-3 rounded-2xl text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {saved.length >= 2 && (
                <button
                  onClick={() => setBoardMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl mt-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-sm active:scale-95 transition-all"
                >
                  <LayoutGrid size={16} />
                  Open Board Mode (2 splits side by side)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
