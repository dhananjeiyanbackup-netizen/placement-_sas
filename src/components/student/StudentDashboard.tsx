import React from 'react';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Mic,
  Code2,
  Bell,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, Exam } from '../../types';

interface StudentDashboardProps {
  currentUser: User;
  onNavigate: (tab: string, extra?: any) => void;
  onStartExam: (exam: Exam) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onNavigate,
  onStartExam,
}) => {
  const exams = store.exams;
  const results = store.results.filter((r) => r.studentId === currentUser.id && r.published);
  const notes = store.notes;
  const notifications = store.notifications;
  const leetcode = store.codingProfiles.find((p) => p.studentId === currentUser.id);
  const speakingAttempts = store.speakingAttempts.filter((s) => s.studentId === currentUser.id);

  // Active / today's exams assigned to student's dept/year
  const activeExams = exams.filter(
    (e) =>
      e.status === 'active' &&
      (!e.departmentName || e.departmentName === 'All' || e.departmentName === currentUser.departmentName || e.departmentId === currentUser.departmentId) &&
      (!e.year || (e.year as string) === 'All' || e.year === currentUser.year) &&
      (!e.section || e.section === 'All' || e.section === currentUser.section)
  );

  const upcomingExams = exams.filter(
    (e) =>
      e.status === 'scheduled' &&
      (!e.departmentName || e.departmentName === 'All' || e.departmentName === currentUser.departmentName || e.departmentId === currentUser.departmentId) &&
      (!e.year || (e.year as string) === 'All' || e.year === currentUser.year) &&
      (!e.section || e.section === 'All' || e.section === currentUser.section)
  );

  // Student stats
  const avgMarks =
    results.length > 0
      ? Math.round(
          (results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length) * 10
        ) / 10
      : 92.5;

  const latestCommunicationScore =
    speakingAttempts.length > 0 ? speakingAttempts[0].readingAccuracy : 95;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-2xl border border-blue-900/40 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Anna University Regulation R2021
              </span>
              <span className="text-xs text-blue-200">
                {currentUser.departmentName} • Year {currentUser.year} ({currentUser.section})
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs text-blue-200/80 mt-1 font-mono">
              University Reg No: {currentUser.registerNumber} • Batch: {currentUser.batch}
            </p>
          </div>

          {activeExams.length > 0 && (
            <button
              onClick={() => onStartExam(activeExams[0])}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-pulse"
            >
              <Play className="w-4 h-4 fill-white" />
              Live CIA-1 Exam Ready (Launch Now)
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{avgMarks}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Rank 1 in Section A</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Communication Score</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{latestCommunicationScore}%</p>
          <span className="text-[11px] text-cyan-700 font-medium">EXCELLENT Fluency</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">LeetCode Solved</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {leetcode ? leetcode.totalSolved : 342}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Rating: 1724 (Knight)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Notes</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{notes.length}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Unit 1-5 Uploaded</span>
        </div>
      </div>

      {/* Main Grid: Active/Upcoming Exams & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Examination Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Examination Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-sm text-slate-900">Today's Examination Schedule</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                {activeExams.length} Active Now
              </span>
            </div>

            {activeExams.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No examinations currently active for your section right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                          {ex.subjectCode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{ex.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Duration: {ex.durationMinutes} Minutes
                        </span>
                        <span>{ex.totalQuestions} Questions</span>
                        <span>{ex.totalMarks} Marks</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartExam(ex)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Start Examination
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Examinations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Upcoming Semester Assessments</h3>
              <button
                onClick={() => onNavigate('student-upcoming')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View Full Calendar &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {ex.subjectCode}
                      </span>
                      <h4 className="font-semibold text-slate-900">{ex.name}</h4>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Date: {ex.examDate} • {ex.startTime} - {ex.endTime} ({ex.durationMinutes} mins)
                    </p>
                  </div>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Communication Lab Widget & Recent Announcements */}
        <div className="space-y-6">
          {/* Communication Lab Callout */}
          <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-blue-950 p-5 rounded-2xl border border-cyan-800/40 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-300">
                AI Communication Lab
              </span>
            </div>
            <h3 className="font-bold text-base text-white">English Speaking &amp; Fluency Trainer</h3>
            <p className="text-xs text-cyan-100/80 mt-1 leading-relaxed">
              Record reading passages and interview answers. Get instantaneous AI analysis of your
              reading accuracy, pace (WPM), phoneme pronunciation, and placement readiness.
            </p>

            <button
              onClick={() => onNavigate('student-communication')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
            >
              Start Speaking Practice
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Announcements Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Exam Cell Notices</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Campus Alerts</span>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-900 text-xs">{n.title}</p>
                  <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
