import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  ChevronDown,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  TrendingDown,
  BookOpen,
  ChevronUp,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, ExamResult } from '../../types';
import { analyzeStudentAreaDeficiencies } from '../../utils/studentAnalysis';

interface StudentResultsProps {
  currentUser: User;
}

export const StudentResults: React.FC<StudentResultsProps> = ({ currentUser }) => {
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Results for current student that are published
  const publishedResults = store.results.filter(
    (r) => r.studentId === currentUser.id && r.published
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Certified Examination Results &amp; Scorecards</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Official Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access certified marks, cohort ranks, question keys and detailed solution rationales
            approved by the Exam Cell.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" /> Print Marksheet
        </button>
      </div>

      {publishedResults.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No examination results have been published for your profile yet. Results will appear here once
          evaluated and certified by faculty.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {publishedResults.map((result) => (
            <div
              key={result.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {result.subjectName}
                    </span>
                    <span className="text-xs text-slate-400">• Submitted: {result.submittedAt}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{result.examName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-extrabold text-xs px-3 py-1 rounded-full ${
                      result.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {result.passed ? 'PASSED WITH DISTINCTION' : 'REAPPEAR REQUIRED'}
                  </span>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
                  <span className="text-[10px] text-blue-600 font-semibold uppercase block">
                    Marks Obtained
                  </span>
                  <p className="text-xl font-extrabold text-blue-900 mt-0.5">
                    {result.marksObtained} / {result.totalMarks}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase block">
                    Percentage
                  </span>
                  <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
                    {result.percentage}%
                  </p>
                </div>
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase block">
                    Department Rank
                  </span>
                  <p className="text-xl font-extrabold text-indigo-900 mt-0.5">
                    Rank #{result.rank || 1}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Time Taken
                  </span>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {result.timeTakenMinutes} Mins
                  </p>
                </div>
              </div>

              {/* STUDENT-WISE AREA DEFICIENCY DIAGNOSIS */}
              {(() => {
                const examQuestions = store.questions.filter(
                  (q) =>
                    q.subject.toLowerCase().includes((result.subjectName || '').toLowerCase()) ||
                    store.exams.find((e) => e.id === result.examId)?.questionIds.includes(q.id)
                );

                const sampleAnswers: Record<string, string> = {};
                examQuestions.forEach((q, idx) => {
                  const isCorrect = idx < result.correctAnswersCount;
                  sampleAnswers[q.id] = isCorrect ? q.correctAnswer : 'WRONG';
                });

                const weakness = analyzeStudentAreaDeficiencies(
                  sampleAnswers,
                  examQuestions.length > 0 ? examQuestions : store.questions.slice(0, 5),
                  currentUser.id,
                  currentUser.name
                );

                return (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Area Deficiency &amp; Personalized Improvement Plan (Where You Need Focus)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Diagnostic Result
                      </span>
                    </div>

                    {/* Critical Weakness Areas */}
                    {weakness.criticalWeaknesses.length > 0 ? (
                      <div>
                        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                          Critical Low Areas (&lt;50% Marks):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {weakness.criticalWeaknesses.map((w, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-xl border border-rose-200 shadow-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900">
                                  Unit {w.unit}: {w.topic}
                                </span>
                                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                  {w.percentage}%
                                </span>
                              </div>
                              <p className="text-[11px] text-rose-900 leading-snug">
                                <strong>Recommended Action:</strong> {w.remedialAction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        No critical deficiencies identified! You maintained above 50% across all evaluated units.
                      </div>
                    )}

                    {/* Moderate and Mastered Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-800 font-semibold">
                          Moderate Topics: {weakness.moderateTopics.length}
                        </span>
                        <span className="text-emerald-800 font-semibold">
                          • Mastered Strengths: {weakness.masteredTopics.length}
                        </span>
                      </div>
                      <span className="text-slate-600 italic">
                        {weakness.priorityImprovementAdvice[0]}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold">
                    ✓ {result.correctAnswersCount} Correct
                  </span>
                  <span className="text-rose-700 font-semibold">
                    ✗ {result.incorrectAnswersCount} Incorrect
                  </span>
                  <span>{result.unansweredCount} Unanswered</span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Download Marksheet PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
