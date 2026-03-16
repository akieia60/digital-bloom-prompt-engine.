import { useState } from 'react';
import { useCommandCenter } from '../hooks/useCommandCenter';
import { Send, CheckCircle, Clock, AlertTriangle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const AGENTS = ['either', 'deuce', 'aubree'];
const PRIORITIES = ['low', 'normal', 'urgent'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-gray-400' },
  normal: { label: 'Normal', color: 'text-amber-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
};

export default function CommandCenter() {
  const { tasks, addTask, updateTaskStatus, deleteTask, loading } = useCommandCenter();
  const [taskText, setTaskText] = useState('');
  const [assignedTo, setAssignedTo] = useState('either');
  const [priority, setPriority] = useState('normal');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    addTask({
      task: taskText.trim(),
      assigned_to: assignedTo,
      priority,
      status: 'pending',
    });

    setTaskText('');
    setPriority('normal');
    setAssignedTo('either');

    const utterance = new SpeechSynthesisUtterance("Task submitted");
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300 min-h-full">
      <div className="text-left mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Command Center
        </h2>
        <p className="text-gray-600 font-medium">Drop tasks for Deuce & Aubree from anywhere</p>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 mb-8 border border-white/40 space-y-4">
        <textarea
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="What do you need done? (e.g., 'Deuce: Generate 5 birthday blooms')"
          className="w-full bg-white/60 rounded-2xl p-4 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg"
          rows={3}
          id="command-center-input"
        />

        <div className="flex gap-3">
          {/* Assign To */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-white/60 rounded-xl p-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 capitalize"
              id="command-center-assign"
            >
              {AGENTS.map(a => (
                <option key={a} value={a} className="capitalize">{a === 'either' ? '🤝 Either' : a === 'deuce' ? '💻 Deuce' : '🖥️ Aubree'}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-white/60 rounded-xl p-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              id="command-center-priority"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p === 'urgent' ? '🔴 Urgent' : p === 'normal' ? '🟡 Normal' : '⚪ Low'}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!taskText.trim()}
          className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200 disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          id="command-center-submit"
        >
          <Send size={22} />
          <span>Send Task</span>
        </button>
      </form>

      {/* Active Tasks */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock size={20} className="text-amber-500" />
          Active Tasks ({pendingTasks.length})
        </h3>

        {loading && <p className="text-gray-400 text-center py-8">Loading tasks...</p>}

        {!loading && pendingTasks.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center border border-white/40">
            <p className="text-gray-400 text-lg">No active tasks</p>
            <p className="text-gray-300 text-sm mt-1">Drop a task above and your agents will pick it up</p>
          </div>
        )}

        {pendingTasks.map(task => {
          const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
          const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
          const StatusIcon = statusCfg.icon;

          return (
            <div key={task.id} className="glass rounded-2xl p-4 border border-white/40 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-gray-800 font-medium text-base flex-1">{task.task}</p>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">→ {task.assigned_to}</span>
                  {task.priority === 'urgent' && (
                    <AlertTriangle size={14} className="text-red-500" />
                  )}
                </div>

                <div className="flex gap-1">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200 transition"
                    >
                      Start
                    </button>
                  )}
                  {(task.status === 'pending' || task.status === 'in-progress') && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-200 transition"
                    >
                      Done ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Tasks (Collapsible) */}
      {completedTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-500 font-bold mb-3 hover:text-gray-700 transition"
          >
            <CheckCircle size={20} className="text-green-400" />
            Completed ({completedTasks.length})
            {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="glass rounded-2xl p-3 border border-white/20 opacity-60">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm line-through flex-1">{task.task}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">→ {task.assigned_to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
