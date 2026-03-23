import { useState, useEffect } from 'react';
import {
  Copy, Check, Star, Plus, Trash2, ChevronDown, ChevronUp,
  List, Database, Trophy, Tag
} from 'lucide-react';
import { COMMAND_CENTER_PROMPTS } from '../data/commandCenterPrompts';
import { supabase } from '../lib/supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TOOL_COLORS = {
  Sora:   'bg-blue-100 text-blue-700',
  Grok:   'bg-purple-100 text-purple-700',
  Runway: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-gray-100 text-gray-600',
};

const ALL_CATEGORIES = ['All', ...Array.from(new Set(COMMAND_CENTER_PROMPTS.map(p => p.category)))];

const INITIAL_QUEUE = [
  { id: 'q1', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Heart-Shaped Pulse'),            priority: 'High',   status: 'Not Started' },
  { id: 'q2', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Crystal Stiletto Bloom Unfurl'),  priority: 'High',   status: 'Not Started' },
  { id: 'q3', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Love Story Sequence'),            priority: 'High',   status: 'Not Started' },
  { id: 'q4', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Baseball Bat Explosion'),         priority: 'High',   status: 'Not Started' },
  { id: 'q5', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Wave Pop-Up'),                    priority: 'Medium', status: 'Not Started' },
  { id: 'q6', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Butterfly Delivery'),             priority: 'High',   status: 'Not Started' },
  { id: 'q7', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Woman Empowerment'),              priority: 'High',   status: 'Not Started' },
  { id: 'q8', ...COMMAND_CENTER_PROMPTS.find(p => p.name === 'Love Bloom Scene 1'),             priority: 'Medium', status: 'Not Started' },
].filter(q => q.name);

const INITIAL_PERFORMERS = [
  { id: 'p1', category: 'Animation',  name: 'Heart-Shaped Pulse',            reason: 'Heartbeat rhythm = viral',              upsell: 'High',   reusable: true  },
  { id: 'p2', category: 'Luxury',     name: 'Crystal Stiletto Bloom Unfurl', reason: 'Ultra-luxury = premium buyers',         upsell: 'High',   reusable: true  },
  { id: 'p3', category: 'Animation',  name: 'Love Story Sequence',           reason: 'Cinematic arc = shareable',             upsell: 'High',   reusable: true  },
  { id: 'p4', category: 'Sports',     name: 'Baseball Bat Explosion',        reason: 'Unexpected = viral',                    upsell: 'High',   reusable: false },
  { id: 'p5', category: 'Animation',  name: 'Wave Pop-Up',                   reason: 'Satisfying loop = repeat views',        upsell: 'Medium', reusable: true  },
  { id: 'p6', category: 'Packaging',  name: 'Butterfly Delivery',            reason: 'Fantasy angle = differentiated',        upsell: 'High',   reusable: true  },
  { id: 'p7', category: 'Silhouette', name: 'Woman Empowerment',             reason: "'Men deserve flowers' = viral hook",    upsell: 'High',   reusable: true  },
  { id: 'p8', category: 'Love',       name: 'Love Bloom',                    reason: '5-scene arc = engagement',              upsell: 'Medium', reusable: true  },
];

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy', size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-all active:scale-95
        ${copied ? 'bg-green-100 text-green-700' : 'bg-white/60 text-gray-700 hover:bg-amber-50 hover:text-amber-700'}
        ${size === 'xs' ? 'text-xs' : 'text-sm'}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function ToolBadge({ tool }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${TOOL_COLORS[tool] || 'bg-gray-100 text-gray-600'}`}>
      {tool}
    </span>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange && onChange(n)}
          className={`transition-colors ${n <= value ? 'text-amber-500' : 'text-gray-300'} ${onChange ? 'hover:text-amber-400' : ''}`}>
          <Star size={18} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

// ─── TAB 1: PROMPT VAULT ──────────────────────────────────────────────────────

function PromptVaultTab({ onAddToQueue, onAddToPerformers }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = activeCategory === 'All'
    ? COMMAND_CENTER_PROMPTS
    : COMMAND_CENTER_PROMPTS.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {ALL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md'
                  : 'bg-white/60 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Cards */}
      <div className="space-y-3">
        {filtered.map((prompt, idx) => {
          const cardId = `${prompt.category}-${prompt.name}-${idx}`;
          const isExpanded = expandedId === cardId;
          return (
            <div key={cardId} className="glass rounded-3xl border border-white/40 overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : cardId)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{prompt.category}</span>
                      {prompt.scene && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-bold">Scene {prompt.scene}</span>
                      )}
                      <ToolBadge tool={prompt.tool} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{prompt.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{prompt.style}</p>
                  </div>
                  <span className="shrink-0 mt-1 text-gray-400">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/40 pt-3">
                  <div className="bg-white/60 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Base Prompt</span>
                      <CopyButton text={prompt.basePrompt} label="Copy Base" size="xs" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{prompt.basePrompt}</p>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sora Prompt</span>
                      <CopyButton text={prompt.soraPrompt} label="Copy Sora" size="xs" />
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{prompt.soraPrompt}</pre>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => onAddToQueue(prompt)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all active:scale-95">
                      <Plus size={14} /> Add to Queue
                    </button>
                    <button onClick={() => onAddToPerformers(prompt)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-200 transition-all active:scale-95">
                      <Star size={14} /> Star
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 2: QUEUE ─────────────────────────────────────────────────────────────

function QueueTab({ queue, setQueue }) {
  const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];
  const [copiedId, setCopiedId] = useState(null);

  const updateStatus = (id, status) => setQueue(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  const removeItem = (id) => setQueue(prev => prev.filter(item => item.id !== id));
  const handleCopy = async (item) => {
    try { await navigator.clipboard.writeText(item.basePrompt || ''); setCopiedId(item.id); setTimeout(() => setCopiedId(null), 2000); } catch {}
  };

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'In Progress':  'bg-blue-100 text-blue-700',
    'Done':         'bg-green-100 text-green-700',
  };

  const grouped = {
    'Not Started': queue.filter(q => q.status === 'Not Started'),
    'In Progress':  queue.filter(q => q.status === 'In Progress'),
    'Done':         queue.filter(q => q.status === 'Done'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{queue.length} prompts in queue</p>
        <span className="text-xs text-gray-400">Tap to copy prompt</span>
      </div>

      {queue.length === 0 && (
        <div className="glass rounded-3xl p-8 border border-white/40 text-center">
          <List size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Queue is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add prompts from the Vault tab</p>
        </div>
      )}

      {STATUS_OPTIONS.map(statusGroup => {
        const items = grouped[statusGroup];
        if (!items || items.length === 0) return null;
        return (
          <div key={statusGroup} className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{statusGroup} ({items.length})</h3>
            {items.map(item => (
              <div key={item.id} className="glass rounded-3xl p-4 border border-white/40">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-lg">{item.category}</span>
                      <ToolBadge tool={item.tool} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[item.priority] || 'bg-gray-100 text-gray-600'}`}>{item.priority}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1.5 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 ${statusColors[item.status]}`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleCopy(item)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-white/60 text-gray-700 hover:bg-amber-50'}`}>
                    {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === item.id ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB 3: ASSET TRACKER ─────────────────────────────────────────────────────

const ASSET_CATEGORIES = [...new Set(COMMAND_CENTER_PROMPTS.map(p => p.category))];

function AssetTrackerTab() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: ASSET_CATEGORIES[0] || '', name: '', url: '', quality: 0, keep: true, notes: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('video_library').select('*').order('created_at', { ascending: false });
        if (!error && data) setAssets(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('video_library').insert([{
        category: form.category,
        style_name: form.name,
        storage_url: form.url,
        notes: `quality:${form.quality}|keep:${form.keep}|${form.notes}`,
        status: form.keep ? 'keep' : 'review',
        prompt_text: '',
      }]).select();
      if (!error && data) {
        setAssets(prev => [data[0], ...prev]);
        setForm({ category: ASSET_CATEGORIES[0] || '', name: '', url: '', quality: 0, keep: true, notes: '' });
      }
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try { await supabase.from('video_library').delete().eq('id', id); setAssets(prev => prev.filter(a => a.id !== id)); } catch {}
  };

  const parseAsset = (a) => {
    const notes = a.notes || '';
    const qualityMatch = notes.match(/quality:(\d)/);
    const keepMatch = notes.match(/keep:(true|false)/);
    const userNotes = notes.replace(/quality:\d\|keep:(true|false)\|?/, '').trim();
    return { quality: qualityMatch ? parseInt(qualityMatch[1]) : 0, keep: keepMatch ? keepMatch[1] === 'true' : true, userNotes };
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 border border-white/40 space-y-3">
        <h3 className="font-bold text-gray-800 text-base">Add Asset</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
              className="w-full bg-white/60 rounded-2xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Prompt Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              placeholder="e.g. Heart Pulse v2"
              className="w-full bg-white/60 rounded-2xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Video URL</label>
          <input type="text" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))}
            placeholder="https://..."
            className="w-full bg-white/60 rounded-2xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Quality</label>
            <StarRating value={form.quality} onChange={v => setForm(f => ({...f, quality: v}))} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Keep?</label>
            <button type="button" onClick={() => setForm(f => ({...f, keep: !f.keep}))}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.keep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {form.keep ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            placeholder="Any notes about this asset..." rows={2}
            className="w-full bg-white/60 rounded-2xl p-3 text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <button type="submit" disabled={submitting || !form.name.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 hover:shadow-lg active:scale-95">
          {submitting ? 'Saving...' : '+ Save Asset'}
        </button>
      </form>

      {loading ? (
        <div className="glass rounded-3xl p-6 border border-white/40 text-center text-gray-400 text-sm">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="glass rounded-3xl p-8 border border-white/40 text-center">
          <Database size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No assets yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first asset above</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{assets.length} Assets</h3>
          {assets.map(asset => {
            const { quality, keep, userNotes } = parseAsset(asset);
            return (
              <div key={asset.id} className="glass rounded-3xl p-4 border border-white/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-lg">{asset.category}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${keep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {keep ? 'Keep' : 'Review'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{asset.style_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <StarRating value={quality} />
                      {asset.storage_url && (
                        <a href={asset.storage_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline truncate max-w-[140px]">View Video</a>
                      )}
                    </div>
                    {userNotes && <p className="text-xs text-gray-500 mt-1">{userNotes}</p>}
                  </div>
                  <button onClick={() => handleDelete(asset.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: TOP PERFORMERS ────────────────────────────────────────────────────

function TopPerformersTab({ performers, setPerformers }) {
  const cycleUpsell = (id) => {
    const cycle = ['Low', 'Medium', 'High'];
    setPerformers(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, upsell: cycle[(cycle.indexOf(p.upsell) + 1) % cycle.length] };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{performers.length} top performers</p>
        <span className="text-xs text-gray-400">Tap reason to edit</span>
      </div>

      {performers.length === 0 && (
        <div className="glass rounded-3xl p-8 border border-white/40 text-center">
          <Trophy size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No top performers yet</p>
          <p className="text-sm text-gray-400 mt-1">Star prompts from the Vault to add them here</p>
        </div>
      )}

      <div className="space-y-3">
        {performers.map(p => (
          <div key={p.id} className="glass rounded-3xl p-4 border border-white/40">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <span className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-lg">{p.category}</span>
                  <span onClick={() => cycleUpsell(p.id)} title="Tap to cycle"
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg cursor-pointer select-none ${PRIORITY_COLORS[p.upsell] || 'bg-gray-100 text-gray-600'}`}>
                    {p.upsell} Upsell ↻
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-base">{p.name}</p>
              </div>
              <button onClick={() => setPerformers(prev => prev.filter(x => x.id !== p.id))}
                className="text-gray-300 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16} /></button>
            </div>
            <input type="text" value={p.reason}
              onChange={e => setPerformers(prev => prev.map(x => x.id === p.id ? {...x, reason: e.target.value} : x))}
              className="w-full bg-white/60 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
              placeholder="Why does this perform well?" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reusable</span>
              <button onClick={() => setPerformers(prev => prev.map(x => x.id === p.id ? {...x, reusable: !x.reusable} : x))}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${p.reusable ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.reusable ? '✓ Yes' : '✗ No'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMMAND CENTER ──────────────────────────────────────────────────────

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState(0);
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  const [performers, setPerformers] = useState(() => {
    try { const s = localStorage.getItem('cc_top_performers'); return s ? JSON.parse(s) : INITIAL_PERFORMERS; }
    catch { return INITIAL_PERFORMERS; }
  });

  useEffect(() => {
    try { localStorage.setItem('cc_top_performers', JSON.stringify(performers)); } catch {}
  }, [performers]);

  const handleAddToQueue = (prompt) => {
    setQueue(prev => [{ id: `q_${Date.now()}`, ...prompt, priority: 'Medium', status: 'Not Started' }, ...prev]);
    setActiveTab(1);
  };

  const handleAddToPerformers = (prompt) => {
    setPerformers(prev => [{
      id: `p_${Date.now()}`, category: prompt.category, name: prompt.name,
      reason: 'Add your reason here', upsell: 'Medium', reusable: true,
    }, ...prev]);
    setActiveTab(3);
  };

  const TABS = [
    { label: 'Vault',      icon: Tag      },
    { label: 'Queue',      icon: List     },
    { label: 'Assets',     icon: Database },
    { label: 'Performers', icon: Trophy   },
  ];

  return (
    <div className="pb-24 pt-4 px-4 min-h-full">
      <div className="mb-5">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Command Center
        </h2>
        <p className="text-gray-600 text-sm font-medium mt-0.5">Vault · Queue · Assets · Top Performers</p>
      </div>

      {/* Tab Bar */}
      <div className="glass rounded-2xl border border-white/40 p-1 flex gap-1 mb-5">
        {TABS.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all gap-1 ${
                activeTab === i
                  ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-amber-600'
              }`}>
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 0 && <PromptVaultTab onAddToQueue={handleAddToQueue} onAddToPerformers={handleAddToPerformers} />}
      {activeTab === 1 && <QueueTab queue={queue} setQueue={setQueue} />}
      {activeTab === 2 && <AssetTrackerTab />}
      {activeTab === 3 && <TopPerformersTab performers={performers} setPerformers={setPerformers} />}
    </div>
  );
}
