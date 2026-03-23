import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Video, Plus, Loader, CheckCircle, Copy } from 'lucide-react';

// ── All Digital Bloom categories ───────────────────────────────────────────────
const CATEGORIES = [
  'Birthday',
  "Mother's Day",
  "Father's Day",
  "Valentine's Day",
  'Anniversary',
  'Wedding',
  'Graduation',
  'Christmas / Holiday',
  'Sympathy / Memorial',
  'Heavenly Birthday',
  'Just Because',
  'Get Well',
  'New Baby',
  'Thinking of You',
];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Auto-generates a clean filename from the form fields ──────────────────────
// Format: DB_[Category]_[Style]_S[##]of[##]_[MonYYYY].mp4
// Example: DB_Birthday_GoldenRose_S01of07_Mar2026.mp4
function generateFilename(category, styleName, sceneNumber, totalScenes) {
  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();
  const cat = category.replace(/[^a-zA-Z0-9]/g, '');
  const style = (styleName || 'General').replace(/[^a-zA-Z0-9]/g, '') || 'General';
  const scene = String(sceneNumber).padStart(2, '0');
  const total = String(totalScenes).padStart(2, '0');
  return `DB_${cat}_${style}_S${scene}of${total}_${month}${year}.mp4`;
}

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:   { label: 'Draft',    color: 'bg-gray-100 text-gray-600',    icon: '📝', desc: 'Just logged' },
  ready:   { label: 'Ready',    color: 'bg-amber-100 text-amber-700',  icon: '✅', desc: 'Tell OpenClaw' },
  filed:   { label: 'Filed',    color: 'bg-blue-100 text-blue-700',    icon: '📁', desc: 'OpenClaw organized it' },
  on_site: { label: 'On Site',  color: 'bg-green-100 text-green-700',  icon: '🌸', desc: 'Live on digitabloom.com' },
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function VideoLibrary() {
  const [activeTab, setActiveTab] = useState('log');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const fileRef = useRef(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    category: '',
    styleName: '',
    sceneNumber: 1,
    totalScenes: 7,
    promptText: '',
    file: null,
    notes: '',
  });

  // Live filename preview
  const filename = form.category
    ? generateFilename(form.category, form.styleName, form.sceneNumber, form.totalScenes)
    : null;

  // ── Load library from Supabase ──────────────────────────────────────────────
  const loadVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('video_library')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setVideos(data);
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, []);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Log a new video ─────────────────────────────────────────────────────────
  const handleLog = async () => {
    if (!form.category) return showToast('Please pick a category first', 'error');
    if (!form.promptText.trim()) return showToast('Please enter the Grok prompt you used', 'error');

    setUploading(true);
    let storage_url = null;

    // Upload the video file if one was selected
    if (form.file) {
      const ext = form.file.name.split('.').pop() || 'mp4';
      const path = `videos/${filename.replace('.mp4', '')}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('video-library')
        .upload(path, form.file, { upsert: true });

      if (uploadErr) {
        setUploading(false);
        return showToast('Upload failed: ' + uploadErr.message, 'error');
      }

      const { data: urlData } = supabase.storage
        .from('video-library')
        .getPublicUrl(path);
      storage_url = urlData?.publicUrl || null;
    }

    // Save the record to the database
    const { error } = await supabase.from('video_library').insert({
      category: form.category,
      style_name: form.styleName || 'General',
      scene_number: form.sceneNumber,
      total_scenes: form.totalScenes,
      filename,
      storage_url,
      prompt_text: form.promptText.trim(),
      status: 'draft',
      notes: form.notes.trim() || null,
    });

    setUploading(false);

    if (error) return showToast('Could not save: ' + error.message, 'error');

    // Success — reset form, go to library
    showToast('Video logged! Switch to Library to mark it ready. ✨');
    setForm({ category: '', styleName: '', sceneNumber: 1, totalScenes: 7, promptText: '', file: null, notes: '' });
    if (fileRef.current) fileRef.current.value = '';
    await loadVideos();
    setActiveTab('library');
  };

  // ── Mark a video ready for OpenClaw ────────────────────────────────────────
  const markReady = async (id) => {
    await supabase
      .from('video_library')
      .update({ status: 'ready', updated_at: new Date().toISOString() })
      .eq('id', id);
    await loadVideos();
    showToast('Marked ready! Now message OpenClaw. ✅');
  };

  // ── Copy the OpenClaw message to clipboard ──────────────────────────────────
  const copyOpenClawMessage = async () => {
    const readyCount = videos.filter(v => v.status === 'ready').length;
    const msg = `Hey OpenClaw — I have ${readyCount} new video${readyCount !== 1 ? 's' : ''} logged in the Video Library marked as ready. Please check the video_library table in Supabase, file them using the naming convention, update their status to 'filed', and let me know when done.`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      showToast('Could not copy — try manually', 'error');
    }
  };

  // ── Group library by category ───────────────────────────────────────────────
  const grouped = videos.reduce((acc, v) => {
    const cat = v.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  const readyCount = videos.filter(v => v.status === 'ready').length;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-28 pt-4 px-4 min-h-full">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-4 shadow-xl text-center font-semibold text-sm transition-all ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <Video className="text-amber-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">Video Library</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Log every Grok video with its prompt. Mark ready, then tell OpenClaw to file it.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          ['log',     '+ Log New Video'],
          ['library', `Library (${videos.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'glass text-gray-600 hover:text-amber-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>


      {/* ═══════════════════ LOG TAB ═══════════════════ */}
      {activeTab === 'log' && (
        <div className="space-y-4">

          {/* Category picker */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-transparent text-gray-900 font-semibold text-base focus:outline-none"
            >
              <option value="">Pick an occasion...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Style / sub-name */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Style / Sub-Name
            </label>
            <input
              type="text"
              placeholder="e.g. Golden Rose, Garden, Luxury, Celestial..."
              value={form.styleName}
              onChange={e => setForm(f => ({ ...f, styleName: e.target.value }))}
              className="w-full bg-transparent text-gray-900 font-medium text-base focus:outline-none placeholder:text-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">This is the name for this specific video style, not required.</p>
          </div>

          {/* Scene number */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Scene Number
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">This scene #</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, sceneNumber: Math.max(1, f.sceneNumber - 1) }))}
                    className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center"
                  >−</button>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-center">{form.sceneNumber}</span>
                  <button
                    onClick={() => setForm(f => ({ ...f, sceneNumber: f.sceneNumber + 1 }))}
                    className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center"
                  >+</button>
                </div>
              </div>
              <div className="text-gray-300 text-xl font-light">of</div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Total scenes</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, totalScenes: Math.max(1, f.totalScenes - 1) }))}
                    className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center"
                  >−</button>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-center">{form.totalScenes}</span>
                  <button
                    onClick={() => setForm(f => ({ ...f, totalScenes: f.totalScenes + 1 }))}
                    className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt text */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Grok Prompt You Used <span className="text-red-400">*</span>
            </label>
            <textarea
              placeholder="Paste the exact prompt you typed into Grok for this scene. The more detail the better — this is your record."
              value={form.promptText}
              onChange={e => setForm(f => ({ ...f, promptText: e.target.value }))}
              rows={5}
              className="w-full bg-transparent text-gray-900 text-sm focus:outline-none placeholder:text-gray-300 resize-none leading-relaxed"
            />
          </div>

          {/* Video file picker — opens camera roll on iPhone */}
          <div
            className="glass rounded-2xl p-5 border-2 border-dashed border-amber-200 active:border-amber-400 cursor-pointer transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
            />
            {form.file ? (
              <div className="text-center">
                <div className="text-3xl mb-2">🎬</div>
                <p className="text-sm font-bold text-gray-800">{form.file.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(form.file.size / 1024 / 1024).toFixed(1)} MB · Tap to change
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm font-bold text-amber-600">Tap to pick video from camera roll</p>
                <p className="text-xs text-gray-400 mt-1">
                  Optional — you can log without uploading now and upload later
                </p>
              </div>
            )}
          </div>

          {/* Notes for OpenClaw */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Notes for OpenClaw (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Use for premium tier, needs color fix, save for Mother's Day launch..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-transparent text-gray-900 text-sm focus:outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Live filename preview */}
          {filename && (
            <div className="glass rounded-2xl p-4 bg-amber-50/40 border border-amber-100">
              <label className="block text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">
                Auto-Generated Filename
              </label>
              <p className="text-sm font-mono text-amber-800 break-all">{filename}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleLog}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg text-base flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 transition-transform"
          >
            {uploading ? (
              <><Loader size={18} className="animate-spin" /> Saving...</>
            ) : (
              <><Plus size={18} /> Log This Video</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pb-2">
            After logging, switch to Library → mark it Ready → message OpenClaw
          </p>
        </div>
      )}


      {/* ═══════════════════ LIBRARY TAB ═══════════════════ */}
      {activeTab === 'library' && (
        <div>
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <Loader size={24} className="animate-spin mx-auto mb-3" />
              Loading your library...
            </div>
          ) : videos.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-gray-700 font-semibold text-base">No videos logged yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Switch to "Log New Video" to start building your library.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Status summary strip */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                  <div key={status} className="glass rounded-2xl p-3 text-center">
                    <div className="text-xl">{cfg.icon}</div>
                    <div className="text-xl font-bold text-gray-800">
                      {videos.filter(v => v.status === status).length}
                    </div>
                    <div className="text-xs text-gray-500">{cfg.label}</div>
                  </div>
                ))}
              </div>

              {/* OpenClaw message box — shows when any videos are ready */}
              {readyCount > 0 && (
                <div className="glass rounded-2xl p-4 border border-amber-200 bg-amber-50/30">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
                    📨 {readyCount} video{readyCount > 1 ? 's' : ''} ready — send this to OpenClaw on Telegram:
                  </p>
                  <p className="text-sm text-gray-700 italic leading-relaxed mb-3">
                    "Hey OpenClaw — I have {readyCount} new video{readyCount !== 1 ? 's' : ''} logged in the Video Library marked as ready. Please check the video_library table in Supabase, file them using the naming convention, update their status to 'filed', and let me know when done."
                  </p>
                  <button
                    onClick={copyOpenClawMessage}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      copiedMsg
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700 active:bg-amber-200'
                    }`}
                  >
                    {copiedMsg ? (
                      <><CheckCircle size={16} /> Copied!</>
                    ) : (
                      <><Copy size={16} /> Copy Message</>
                    )}
                  </button>
                </div>
              )}

              {/* Videos grouped by category */}
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{category}</h3>
                    <span className="text-xs text-gray-400">· {items.length} video{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="space-y-3">
                    {items.map(video => {
                      const sc = STATUS_CONFIG[video.status] || STATUS_CONFIG.draft;
                      return (
                        <div key={video.id} className="glass rounded-2xl p-4">

                          {/* Top row: filename + status badge */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-gray-400 truncate">{video.filename}</p>
                              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                Scene {video.scene_number} of {video.total_scenes}
                                {video.style_name && video.style_name !== 'General' && (
                                  <span className="text-gray-400 font-normal"> · {video.style_name}</span>
                                )}
                              </p>
                            </div>
                            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>

                          {/* Prompt preview */}
                          {video.prompt_text && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-3">
                              <p className="text-xs font-bold text-gray-400 mb-1">Grok prompt:</p>
                              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                                {video.prompt_text}
                              </p>
                            </div>
                          )}

                          {/* Notes */}
                          {video.notes && (
                            <p className="text-xs text-amber-600 mb-2">📝 {video.notes}</p>
                          )}

                          {/* OpenClaw notes (written back by OpenClaw) */}
                          {video.openclaw_notes && (
                            <p className="text-xs text-blue-600 mb-2">🤖 {video.openclaw_notes}</p>
                          )}

                          {/* Action row */}
                          <div className="flex items-center gap-3 mt-2">
                            {video.storage_url && (
                              <a
                                href={video.storage_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-amber-600 font-semibold flex items-center gap-1"
                              >
                                <Video size={12} /> View Video
                              </a>
                            )}

                            {video.status === 'draft' && (
                              <button
                                onClick={() => markReady(video.id)}
                                className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-4 py-2 rounded-xl active:bg-amber-200 transition-colors"
                              >
                                Mark Ready →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
