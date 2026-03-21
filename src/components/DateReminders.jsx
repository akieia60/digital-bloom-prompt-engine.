import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Plus, Bell, Trash2, Edit, Heart, Gift, Cake } from 'lucide-react';

const REMINDER_TYPES = [
  { id: 'birthday', label: 'Birthday', icon: <Cake className="w-5 h-5" />, color: 'from-pink-500 to-rose-400' },
  { id: 'anniversary', label: 'Anniversary', icon: <Heart className="w-5 h-5" />, color: 'from-red-500 to-pink-400' },
  { id: 'holiday', label: 'Holiday', icon: <Gift className="w-5 h-5" />, color: 'from-green-500 to-emerald-400' },
  { id: 'memorial', label: 'Memorial', icon: <Heart className="w-5 h-5" />, color: 'from-purple-500 to-indigo-400' },
  { id: 'custom', label: 'Custom', icon: <Calendar className="w-5 h-5" />, color: 'from-blue-500 to-cyan-400' }
];

export default function DateReminders() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'birthday',
    recipient_name: '',
    recipient_email: '',
    auto_send: false,
    message_template: '',
    days_before: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reminderData = {
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      if (editingReminder) {
        const { error } = await supabase
          .from('user_reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_reminders')
          .insert([reminderData]);
        if (error) throw error;
      }

      await fetchReminders();
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const handleDelete = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('user_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      date: reminder.date,
      type: reminder.type,
      recipient_name: reminder.recipient_name || '',
      recipient_email: reminder.recipient_email || '',
      auto_send: reminder.auto_send || false,
      message_template: reminder.message_template || '',
      days_before: reminder.days_before || 1
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      type: 'birthday',
      recipient_name: '',
      recipient_email: '',
      auto_send: false,
      message_template: '',
      days_before: 1
    });
    setEditingReminder(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getTypeConfig = (type) => {
    return REMINDER_TYPES.find(t => t.id === type) || REMINDER_TYPES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
            Date Reminders
          </h2>
          <p className="text-gray-600 font-medium">Never forget important dates</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-2xl hover:shadow-lg transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Mom's Birthday"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {REMINDER_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Mom"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="mom@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Remind me</label>
                <select
                  value={formData.days_before}
                  onChange={(e) => setFormData({...formData, days_before: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                  <option value={14}>2 weeks before</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_send"
                  checked={formData.auto_send}
                  onChange={(e) => setFormData({...formData, auto_send: e.target.checked})}
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="auto_send" className="text-sm font-bold text-gray-700">
                  Auto-send Digital Bloom
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg"
                >
                  {editingReminder ? 'Update' : 'Add'} Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">No reminders yet</h3>
          <p className="text-gray-400 mb-6">Add your first date reminder to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg"
          >
            Add First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const typeConfig = getTypeConfig(reminder.type);
            return (
              <div key={reminder.id} className="glass rounded-2xl p-4 border border-white/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${typeConfig.color} text-white`}>
                      {typeConfig.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reminder.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(reminder.date).toLocaleDateString()} • {formatDate(reminder.date)}
                      </p>
                      {reminder.recipient_name && (
                        <p className="text-sm text-gray-500">For: {reminder.recipient_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {reminder.auto_send && (
                      <Bell className="w-5 h-5 text-green-500" title="Auto-send enabled" />
                    )}
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}