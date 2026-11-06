import React from 'react';
import {
  CalendarCheck,
  Clock,
  FileCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, Exam } from '../../types';

interface StudentExamsProps {
  currentUser: User;
  onStartExam: (exam: Exam) => void;
  onViewResult: (examId: string) => void;
}

export const StudentExams: React.FC<StudentExamsProps> = ({
  currentUser,
  onStartExam,
  onViewResult,
}) => {
  const exams = store.exams;
  const results = store.results.filter((r) => r.studentId === currentUser.id);

  // Filter exams strictly assigned to student's department, academic year, and section
  const studentExams = exams.filter((e) => {
    const matchDept =
      !e.departmentName ||
      e.departmentName === 'All' ||
      e.departmentName === currentUser.departmentName ||
      e.departmentId === currentUser.departmentId;
    const matchYear = !e.year || (e.year as string) === 'All' || e.year === currentUser.year;
    const matchSection = !e.section || e.section === 'All' || e.section === currentUser.section;
    return matchDept && matchYear && matchSection;
  });

  return (
    <div className="space-y-6">
      {/* Header with Department & Academic Year Cohort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">My Continuous Internal Assessments</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {studentExams.length} Assigned Tests
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {currentUser.departmentName || 'Engineering'} • Year {currentUser.year || 'III'} (Sec {currentUser.section || 'A'})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proctored digital examinations specifically scheduled for your department and academic year.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-shrink-0">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Camera Proctoring Active • Max 3 Infractions</span>
        </div>
      </div>

      {/* Empty State when no exams */}
      {studentExams.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 text-sm">No Examinations Assigned Currently</p>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no active or scheduled examinations mapped to {currentUser.departmentName} (Year {currentUser.year}).
          </p>
        </div>
      )}

      {/* Exams List */}
      <div className="space-y-4">
        {studentExams.map((exam) => {
          const result = results.find((r) => r.examId === exam.id);
          const isResultPublished = exam.status === 'results_published' && result?.published;

          return (
            <div
              key={exam.id}
              className={`p-5 rounded-2xl border transition shadow-sm bg-white ${
                exam.status === 'active'
                  ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {exam.subjectCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{exam.subjectName}</span>
                </div>

                <div>
                  {exam.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Assessment Open
                    </span>
                  ) : exam.status === 'results_published' ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      Results Certified
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">{exam.name}</h3>
                  <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Duration: {exam.durationMinutes} Minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {exam.totalQuestions} Questions • {exam.totalMarks} Total Marks
                    </span>
                    <span>Date: {exam.examDate}</span>
                    {exam.negativeMarking && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                        Neg Marking: -{exam.negativeMarkValue}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">
                    Instructions: {exam.instructions}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {exam.status === 'active' && (
                    <button
                      onClick={() => onStartExam(exam)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Start Examination
                    </button>
                  )}

                  {isResultPublished && (
                    <button
                      onClick={() => onViewResult(exam.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow"
                    >
                      View Certified Scorecard
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {exam.status === 'scheduled' && (
                    <div className="text-right text-xs text-slate-400">
                      Starts on {exam.examDate} at {exam.startTime}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
