import React from 'react';
import {
  Users,
  Building2,
  GraduationCap,
  FileCheck,
  Calendar,
  Award,
  AlertTriangle,
  TrendingUp,
  Percent,
  UserX,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { store } from '../../services/store';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const students = store.users.filter((u) => u.role === 'student');
  const faculty = store.users.filter((u) => u.role === 'faculty' || u.role === 'hod');
  const departments = store.departments;
  const exams = store.exams;
  const results = store.results;
  const violations = store.proctoringEvents;

  const totalExams = exams.length;
  const upcomingExams = exams.filter((e) => e.status === 'scheduled').length;
  const activeExams = exams.filter((e) => e.status === 'active').length;
  const completedExams = exams.filter((e) => e.status === 'completed' || e.status === 'results_published').length;
  const publishedResults = results.filter((r) => r.published).length;

  const avgMarks =
    results.length > 0
      ? Math.round(
          (results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length) * 10
        ) / 10
      : 84.5;

  const passedCount = results.filter((r) => r.passed).length;
  const passPercentage =
    results.length > 0 ? Math.round((passedCount / results.length) * 100) : 92.5;

  // Chart data
  const deptPerformanceData = [
    { department: 'CSE-CS', avgScore: 86.4, passRate: 94, totalStudents: 180 },
    { department: 'AI-DS', avgScore: 84.8, passRate: 91, totalStudents: 195 },
    { department: 'CSE', avgScore: 81.2, passRate: 88, totalStudents: 240 },
    { department: 'ECE', avgScore: 79.5, passRate: 86, totalStudents: 160 },
  ];

  const yearPerformanceData = [
    { year: 'I Year', avgScore: 78.2, passRate: 85 },
    { year: 'II Year', avgScore: 81.4, passRate: 89 },
    { year: 'III Year', avgScore: 87.6, passRate: 95 },
    { year: 'IV Year', avgScore: 90.2, passRate: 98 },
  ];

  const monthlyExamTrend = [
    { month: 'Jun', exams: 4, avgMarks: 76 },
    { month: 'Jul', exams: 8, avgMarks: 79 },
    { month: 'Aug', exams: 12, avgMarks: 82 },
    { month: 'Sep', exams: 18, avgMarks: 85 },
    { month: 'Oct', exams: 22, avgMarks: 86 },
    { month: 'Nov', exams: 15, avgMarks: 88 },
  ];

  const communicationSkillsData = [
    { metric: 'Reading Accuracy', score: 88 },
    { metric: 'Pronunciation', score: 84 },
    { metric: 'Fluency & Pace', score: 82 },
    { metric: 'Placement Readiness', score: 86 },
  ];

  const proctoringPieData = [
    { name: 'Clean Sessions', value: 92, color: '#10b981' },
    { name: 'Minor Tab Switches', value: 5, color: '#f59e0b' },
    { name: 'Face Not Detected', value: 2, color: '#3b82f6' },
    { name: 'Multiple Faces', value: 1, color: '#ef4444' },
  ];

  const currentUser = store.currentUser;
  const userRole = currentUser?.role || 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome Banner Tailored by Institutional Role */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-2xl border border-blue-900/40 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {userRole === 'super_admin' && '👑 Super Admin Command Hub (All Rights)'}
                {userRole === 'admin' && 'Campus Administration Console'}
                {userRole === 'principal' && '🎓 Principal Executive Academic Overview'}
                {userRole === 'hod' && `🏛️ HOD Leadership • ${currentUser?.departmentName || 'Department'}`}
                {userRole === 'cdc' && '💼 Career Development & Placement Command (CDC)'}
                {userRole === 'faculty' && '👨‍🏫 Faculty Teaching & Assessment Console'}
              </span>
              <span className="text-xs text-slate-300 font-medium">Academic Year 2026-2027</span>
              {userRole === 'super_admin' && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  User: siperadmin (Full Rights)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sasurie College of Engineering Exam &amp; Skill Hub
            </h1>
            <p className="text-xs text-blue-200/80 mt-1 max-w-2xl">
              {userRole === 'super_admin' &&
                'Highest authority console: Full access to institutional user accounts, role fixing, department management, AI proctoring, examination cycles, and Firebase Firestore.'}
              {userRole === 'principal' &&
                'Executive academic audit: Real-time Anna University R2021 compliance, department rankings, faculty workload analysis, student pass rates, and CDC placement trends.'}
              {userRole === 'hod' &&
                `Departmental governance for ${currentUser?.departmentName || 'the department'}: Monitor departmental students, question banks, scheduled internal exams, and weak student remedial alerts.`}
              {userRole === 'cdc' &&
                'Placement preparation command: Track student LeetCode algorithmic problem solving, active Group Discussion (GD) news topics, resume repository, and AI spoken communication fluency.'}
              {userRole === 'faculty' &&
                'Classroom teaching console: Build and import subject question banks, schedule continuous internal assessments, monitor students via AI live proctoring, and review deficiency diagnosis.'}
              {userRole === 'admin' &&
                'Centralized management of academic assessments, student registrations, automated proctoring surveillance, and institutional notifications.'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {(userRole === 'super_admin' || userRole === 'admin') && (
              <button
                onClick={() => onNavigate('admin-dept-students')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                Staff Roles &amp; Users
              </button>
            )}
            {userRole === 'principal' && (
              <button
                onClick={() => onNavigate('admin-results')}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                Merit &amp; Pass Audit
              </button>
            )}
            {userRole === 'cdc' && (
              <button
                onClick={() => onNavigate('admin-gd')}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                GD Hub &amp; News
              </button>
            )}
            {userRole !== 'cdc' && (
              <button
                onClick={() => onNavigate('admin-exams')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Schedule Exam
              </button>
            )}
            <button
              onClick={() => onNavigate('admin-proctoring')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Live Proctoring ({violations.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">775</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> 100% Enrolled
          </span>
        </div>

        {/* Total Departments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Departments</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{departments.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">CSE-CS, AI-DS, CSE, ECE</span>
        </div>

        {/* Total Faculty */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Faculty</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">57</p>
          <span className="text-[11px] text-cyan-700 font-medium mt-1 block">12 Doctorates</span>
        </div>

        {/* Total Examinations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Examinations</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalExams}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            {activeExams} Active • {upcomingExams} Scheduled
          </span>
        </div>

        {/* Pass Percentage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pass Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{passPercentage}%</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> +3.2% vs UT-1
          </span>
        </div>

        {/* Proctoring Violations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Violations</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{violations.length}</p>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">
            {violations.filter((v) => !v.resolved).length} Pending Review
          </span>
        </div>
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Department Performance Index</h3>
              <p className="text-xs text-slate-500">Average score &amp; pass percentage comparison</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              CIA-1 &amp; CIA-2
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avgScore" name="Avg Score (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passRate" name="Pass Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Examination Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Monthly Examination Timeline</h3>
              <p className="text-xs text-slate-500">Volume of online tests conducted &amp; average marks</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Semester Trend
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyExamTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="avgMarks"
                  name="Avg Marks %"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="exams"
                  name="Exams Conducted"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Year Performance & Communication & Proctoring Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Year-wise Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Academic Year Progress</h3>
          <p className="text-xs text-slate-500 mb-4">I to IV Year comparative metrics</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="avgScore" name="Avg Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Communication Lab Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm text-slate-900">Communication Lab Score</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
              AI Speech Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">English pronunciation &amp; placement fluency</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communicationSkillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="metric" type="category" width={110} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="score" name="Score %" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Proctoring Integrity Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Session Integrity Analysis</h3>
            <p className="text-xs text-slate-500 mb-2">Automated camera AI observation ratio</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proctoringPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {proctoringPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Clean: 92%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Tab Switch: 5%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Face Miss: 2%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Multi Face: 1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Proctoring Live Feed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900">Recent Campus Examination Events</h3>
          <button
            onClick={() => onNavigate('admin-proctoring')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View Full Incident Audit &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div>
                <p className="font-semibold text-slate-800">
                  CS3501 - Continuous Internal Assessment I launched
                </p>
                <p className="text-slate-500 text-[11px]">
                  Assigned to III Year CSE (Cyber Security) • 45 minutes duration
                </p>
              </div>
            </div>
            <span className="text-slate-400 text-[11px]">Today, 09:00</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <div>
                <p className="font-semibold text-slate-800">
                  AI Proctoring Warning #1: Tab Switch Detected
                </p>
                <p className="text-slate-500 text-[11px]">
                  Student: Keerthana M (732422104015) • Unit Test 2 • Resolved by Invigilator
                </p>
              </div>
            </div>
            <span className="text-slate-400 text-[11px]">25 Oct, 14:18</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <div>
                <p className="font-semibold text-slate-800">
                  Certified Marks Published for Network Penetration Testing
                </p>
                <p className="text-slate-500 text-[11px]">
                  Class average 85.7% • Highest Score: 100% (Dhanush R)
                </p>
              </div>
            </div>
            <span className="text-slate-400 text-[11px]">27 Oct, 10:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
