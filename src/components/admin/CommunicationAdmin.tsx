import React, { useState } from 'react';
import {
  Mic,
  Plus,
  Award,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Volume2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { store } from '../../services/store';
import { SpeakingPassage, SpeakingAttempt, DifficultyLevel } from '../../types';

export const CommunicationAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passages' | 'attempts'>('passages');
  const [showAddPassageModal, setShowAddPassageModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<SpeakingAttempt | null>(null);

  const [newPassage, setNewPassage] = useState({
    title: '',
    category: 'Campus Placement' as const,
    difficulty: 'medium' as DifficultyLevel,
    passageText: '',
    targetYears: ['III', 'IV'] as ('I' | 'II' | 'III' | 'IV')[],
    estimatedReadTimeSec: 35,
    phoneticTips: '',
  });

  const passages = store.passages;
  const attempts = store.speakingAttempts;

  const handleAddPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassage.title.trim() || !newPassage.passageText.trim()) {
      alert('Title and Passage text are required.');
      return;
    }

    store.addSpeakingPassage({
      title: newPassage.title,
      category: newPassage.category,
      difficulty: newPassage.difficulty,
      passageText: newPassage.passageText,
      targetYears: newPassage.targetYears,
      estimatedReadTimeSec: Number(newPassage.estimatedReadTimeSec),
      phoneticTips: newPassage.phoneticTips
        ? newPassage.phoneticTips.split(',').map((t) => t.trim())
        : undefined,
    });

    setShowAddPassageModal(false);
    setNewPassage({
      title: '',
      category: 'Campus Placement',
      difficulty: 'medium',
      passageText: '',
      targetYears: ['III', 'IV'],
      estimatedReadTimeSec: 35,
      phoneticTips: '',
    });
  };

  const needingImprovement = attempts.filter((a) => a.overallRating === 'NEEDS IMPROVEMENT');
  const excellentCount = attempts.filter((a) => a.overallRating === 'EXCELLENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI Communication Lab Administration</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
              Voice &amp; Pronunciation Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure reading passages, campus interview speech tests, monitor cohort articulation WPM,
            and review AI pronunciation diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
            <button
              onClick={() => setActiveTab('passages')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'passages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Curated Passages ({passages.length})
            </button>
            <button
              onClick={() => setActiveTab('attempts')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'attempts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Student Attempts ({attempts.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddPassageModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Passage
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Passages</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{passages.length}</p>
          <span className="text-[11px] text-blue-600 font-medium">Placement &amp; Technical</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Completed Voice Tests</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{attempts.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Audio Analyzed</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Excellent Articulation</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{excellentCount}</p>
          <span className="text-[11px] text-indigo-600 font-medium">&gt; 90% Accuracy &amp; Fluency</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Requiring Improvement</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{needingImprovement.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Targeted for Remedial Lab</span>
        </div>
      </div>

      {activeTab === 'passages' ? (
        /* Passages Management */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passages.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {p.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      p.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : p.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  "{p.passageText}"
                </p>

                {p.phoneticTips && p.phoneticTips.length > 0 && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 block">Phonetic Focus:</span>
                    <span className="italic">{p.phoneticTips.join(' • ')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Target: Year {p.targetYears.join(', ')}</span>
                <span className="font-semibold text-slate-700">Est: {p.estimatedReadTimeSec}s</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Student Attempts Log */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                <th className="p-3.5">Student / Reg No</th>
                <th className="p-3.5">Passage Title</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Pronunciation</th>
                <th className="p-3.5">Fluency</th>
                <th className="p-3.5">Pace (WPM)</th>
                <th className="p-3.5">Overall Rating</th>
                <th className="p-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{att.studentName}</p>
                    <p className="font-mono text-[11px] text-slate-500">{att.registerNumber}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700 max-w-[200px] truncate">
                    {att.passageTitle}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600">{att.readingAccuracy}%</td>
                  <td className="p-3.5 font-bold text-blue-600">{att.pronunciationScore}%</td>
                  <td className="p-3.5 font-bold text-indigo-600">{att.fluencyScore}%</td>
                  <td className="p-3.5 text-slate-700 font-mono">{att.speakingPaceWpm} WPM</td>
                  <td className="p-3.5">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        att.overallRating === 'EXCELLENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.overallRating === 'GOOD'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.overallRating}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedAttempt(att)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold transition"
                    >
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Reading Passage */}
      {showAddPassageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-base text-slate-900">Add Speaking Assessment Passage</h3>
              </div>
              <button onClick={() => setShowAddPassageModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddPassage} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Passage Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC Incident Response or Tell Me About Yourself"
                  value={newPassage.title}
                  onChange={(e) => setNewPassage({ ...newPassage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newPassage.category}
                    onChange={(e) => setNewPassage({ ...newPassage, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Campus Placement">Campus Placement</option>
                    <option value="Technical Reading">Technical Reading</option>
                    <option value="Interview Questions">Interview Questions</option>
                    <option value="Professional Communication">Professional Communication</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newPassage.difficulty}
                    onChange={(e) =>
                      setNewPassage({ ...newPassage, difficulty: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Original English Text *</label>
                <textarea
                  rows={4}
                  required
                  value={newPassage.passageText}
                  onChange={(e) => setNewPassage({ ...newPassage, passageText: e.target.value })}
                  placeholder="Type or paste the passage that students must read aloud clearly into the microphone..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Phonetic Focus Words (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. architecture, cryptography, vulnerability"
                  value={newPassage.phoneticTips}
                  onChange={(e) => setNewPassage({ ...newPassage, phoneticTips: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPassageModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                >
                  Publish Passage to Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Attempt Diagnostic */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-base text-slate-900">Voice Assessment Diagnostics</h3>
              </div>
              <button onClick={() => setSelectedAttempt(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">{selectedAttempt.studentName}</p>
                <p className="text-slate-500 font-mono">
                  {selectedAttempt.registerNumber} • {selectedAttempt.departmentName}
                </p>
                <p className="text-blue-700 font-medium">Passage: {selectedAttempt.passageTitle}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-bold block">Accuracy</span>
                  <span className="text-lg font-extrabold text-emerald-900">
                    {selectedAttempt.readingAccuracy}%
                  </span>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <span className="text-[10px] text-blue-800 font-bold block">Pronounce</span>
                  <span className="text-lg font-extrabold text-blue-900">
                    {selectedAttempt.pronunciationScore}%
                  </span>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <span className="text-[10px] text-indigo-800 font-bold block">Fluency</span>
                  <span className="text-lg font-extrabold text-indigo-900">
                    {selectedAttempt.fluencyScore}%
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <span className="text-[10px] text-amber-800 font-bold block">Speaking Pace</span>
                  <span className="text-lg font-extrabold text-amber-900">
                    {selectedAttempt.speakingPaceWpm} WPM
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">AI Placement Feedback:</span>
                <p className="p-3 bg-cyan-50/70 border border-cyan-200 text-cyan-950 rounded-xl leading-relaxed">
                  {selectedAttempt.aiFeedback}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAttempt(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                >
                  Close Diagnostic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
