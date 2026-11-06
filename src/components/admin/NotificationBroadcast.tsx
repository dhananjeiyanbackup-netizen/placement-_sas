import React, { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Building2,
  Calendar,
  Award,
  BookOpen,
  Mic,
} from 'lucide-react';
import { store } from '../../services/store';
import { AppNotification } from '../../types';

export const NotificationBroadcast: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotification['type']>('announcement');
  const [targetType, setTargetType] = useState<AppNotification['targetType']>('all');
  const [targetValue, setTargetValue] = useState('All');
  const [sentSuccess, setSentSuccess] = useState(false);

  const notifications = store.notifications;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message.');
      return;
    }

    store.addNotification({
      title,
      message,
      type,
      targetType,
      targetValue: targetType === 'all' ? undefined : targetValue,
      senderName: store.currentUser?.name || 'College Administration',
    });

    setTitle('');
    setMessage('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Campus Notification Dispatch &amp; Broadcast</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Live Messaging
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Send real-time alerts regarding scheduled exams, certified result releases, study material
            uploads, and placement notices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Send className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Compose Notice</h3>
          </div>

          {sentSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Broadcast dispatched instantly to targeted students.</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notice Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="announcement">Important Announcement</option>
                <option value="exam">New Examination Notice</option>
                <option value="result">Results Published</option>
                <option value="communication">Communication Lab Task</option>
                <option value="note">Study Material Uploaded</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all">All Students</option>
                  <option value="department">By Department</option>
                  <option value="year">By Academic Year</option>
                  <option value="section">By Section</option>
                </select>
              </div>

              {targetType !== 'all' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Value</label>
                  {targetType === 'department' && (
                    <select
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                      <option value="AI & Data Science">AI &amp; Data Science</option>
                    </select>
                  )}
                  {targetType === 'year' && (
                    <select
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="I">I Year</option>
                      <option value="II">II Year</option>
                      <option value="III">III Year</option>
                      <option value="IV">IV Year</option>
                    </select>
                  )}
                  {targetType === 'section' && (
                    <select
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. CIA-1 Hall Ticket and Seating Instructions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Provide clear instructions or information for students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Dispatch Notification
            </button>
          </form>
        </div>

        {/* Sent History Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Broadcast Dispatch History</h3>
            <span className="text-slate-400 font-medium">{notifications.length} Notices Logged</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                      {n.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                </div>

                <p className="text-slate-700 mt-2 leading-relaxed">{n.message}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sender: {n.senderName}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Target:{' '}
                    {n.targetType === 'all'
                      ? 'All Students'
                      : `${n.targetType}: ${n.targetValue || ''}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
