import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Play,
  RotateCcw,
  Eye,
  Trash2,
  X,
  Share2,
} from 'lucide-react';
import { store } from '../../services/store';
import { Exam, ExamStatus } from '../../types';

export const ExamScheduler: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Exam Form
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: 'CS3502',
    subjectName: 'Ethical Hacking & Penetration Defense',
    departmentId: 'dept-csecs',
    departmentName: 'CSE (Cyber Security)',
    year: 'III' as 'I' | 'II' | 'III' | 'IV',
    section: 'All' as 'All' | 'A' | 'B' | 'C',
    batch: '2023-2027',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    totalQuestions: 5,
    totalMarks: 10,
    passingMarks: 5,
    negativeMarking: true,
    negativeMarkValue: 0.5,
    instructions:
      'Keep your web camera active and face clearly visible at all times. Tab switching is strictly forbidden.',
    randomizeQuestions: true,
    randomizeOptions: true,
    resultPublicationDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'scheduled' as ExamStatus,
    maxWarnings: 3,
  });

  const exams = store.exams;
  const questions = store.questions;

  // Questions from Question Bank mapped to current department & year
  const matchingQuestions = questions.filter((q) => {
    const matchDept = !q.departmentName || q.departmentName === 'All' || q.departmentName === formData.departmentName;
    const matchYear = !q.year || q.year === 'All' || q.year === formData.year;
    return matchDept && matchYear;
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Examination name is required.');
      return;
    }

    // Select suitable question IDs mapped to this department and year
    const availableQIds = matchingQuestions.length > 0
      ? matchingQuestions.map((q) => q.id)
      : questions.slice(0, Number(formData.totalQuestions)).map((q) => q.id);

    store.addExam({
      name: formData.name,
      subjectCode: formData.subjectCode,
      subjectName: formData.subjectName,
      departmentId: formData.departmentId,
      departmentName: formData.departmentName,
      year: formData.year,
      section: formData.section,
      batch: formData.batch,
      examDate: formData.examDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      durationMinutes: Number(formData.durationMinutes),
      totalQuestions: Math.max(availableQIds.length, Number(formData.totalQuestions)),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      negativeMarking: formData.negativeMarking,
      negativeMarkValue: Number(formData.negativeMarkValue),
      instructions: formData.instructions,
      randomizeQuestions: formData.randomizeQuestions,
      randomizeOptions: formData.randomizeOptions,
      resultPublicationDate: formData.resultPublicationDate,
      status: formData.status,
      questionIds: availableQIds,
      maxWarnings: Number(formData.maxWarnings),
    });

    setShowCreateModal(false);
  };

  const handleStatusChange = (id: string, newStatus: ExamStatus) => {
    if (newStatus === 'results_published') {
      store.publishExamResults(id);
    } else {
      store.updateExam(id, { status: newStatus });
    }
  };

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Now
          </span>
        );
      case 'scheduled':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Completed
          </span>
        );
      case 'results_published':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
            Results Certified
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Examination Scheduling &amp; Dispatch</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {exams.length} Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create online assessments, assign Anna University batches, set proctoring thresholds, and
            control result certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Calendar Schedule
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule New Exam
          </button>
        </div>
      </div>

      {/* Main View: List or Calendar */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {exam.subjectCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{exam.departmentName}</span>
                  <span className="text-xs text-slate-400">• Year {exam.year}</span>
                  <span className="text-xs text-slate-400">• Section {exam.section}</span>
                </div>
                <div>{getStatusBadge(exam.status)}</div>
              </div>

              <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">{exam.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{exam.subjectName}</p>
                  <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Date: {exam.examDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {exam.startTime} - {exam.endTime} ({exam.durationMinutes} mins)
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {exam.totalQuestions} Questions • {exam.totalMarks} Marks
                    </span>
                    {exam.negativeMarking && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                        Neg: -{exam.negativeMarkValue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center flex-wrap gap-2 pt-2 md:pt-0">
                  {exam.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(exam.id, 'active')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Launch Exam Now
                    </button>
                  )}

                  {exam.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(exam.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Close &amp; Evaluate
                    </button>
                  )}

                  {exam.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange(exam.id, 'results_published')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Publish Results
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete exam "${exam.name}"?`)) {
                        store.deleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">November 2026 Examination Schedule</h3>
            <span className="text-xs text-slate-500">Continuous Internal Assessments (CIA)</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-600 border-b pb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2 mt-2 text-xs">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
              const dayExams = exams.filter((e) => e.examDate === dateStr);

              return (
                <div
                  key={i}
                  className={`min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between ${
                    dayExams.length > 0
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'border-slate-100 bg-slate-50/30'
                  }`}
                >
                  <span className="font-bold text-slate-700 text-left">{day}</span>
                  {dayExams.map((de) => (
                    <div
                      key={de.id}
                      className="bg-blue-600 text-white text-[10px] p-1 rounded font-medium truncate"
                      title={de.name}
                    >
                      {de.subjectCode} ({de.startTime})
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Schedule New Exam */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Create &amp; Schedule Examination</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Examination Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIA-1: Ethical Hacking & Penetration Testing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                    <option value="AI & Data Science">AI &amp; Data Science</option>
                    <option value="Computer Science and Engineering">CSE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              {/* Question Bank Mapping Live Status */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    Question Bank Mapping Status:
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                    {matchingQuestions.length} Questions Mapped
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 mt-1">
                  Questions are automatically pulled from Question Bank items tagged with <strong>{formData.departmentName}</strong> and <strong>Year {formData.year}</strong>.
                </p>
                {matchingQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {matchingQuestions.map((mq, idx) => (
                      <span key={mq.id} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-blue-200">
                        Q{idx + 1}: {mq.topic} ({mq.marks}m)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Examination Date</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Warnings</label>
                  <input
                    type="number"
                    value={formData.maxWarnings}
                    onChange={(e) => setFormData({ ...formData, maxWarnings: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-600"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.negativeMarking}
                    onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">
                    Enable Negative Marking (-0.5 per wrong answer)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, randomizeQuestions: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">Randomize Question Ordering per Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.randomizeOptions}
                    onChange={(e) =>
                      setFormData({ ...formData, randomizeOptions: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">Shuffle Multiple Choice Options A/B/C/D</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                >
                  Create &amp; Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
