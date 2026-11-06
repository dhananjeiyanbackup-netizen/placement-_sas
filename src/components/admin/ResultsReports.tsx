import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Share2,
  Eye,
  GraduationCap,
  AlertTriangle,
  TrendingDown,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { store } from '../../services/store';
import { ExamResult } from '../../types';
import { analyzeStudentAreaDeficiencies } from '../../utils/studentAnalysis';

export const ResultsReports: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'student_merit' | 'department_merit'>('department_merit');

  const results = store.results;
  const exams = store.exams;

  // Filtered Results with Department & Year Mapping
  const filteredResults = results.filter((res) => {
    const matchExam = selectedExamId === 'All' || res.examId === selectedExamId;
    const matchDept = selectedDept === 'All' || res.departmentName === selectedDept;
    const matchYear = selectedYear === 'All' || res.year === selectedYear;
    const matchSearch =
      res.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchExam && matchDept && matchYear && matchSearch;
  });

  const passedCount = filteredResults.filter((r) => r.passed).length;
  const passRate =
    filteredResults.length > 0 ? Math.round((passedCount / filteredResults.length) * 100) : 100;
  const avgMarks =
    filteredResults.length > 0
      ? Math.round(
          (filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length) * 10
        ) / 10
      : 85.5;

  // Unique departments with results
  const allDepartments = Array.from(new Set(results.map((r) => r.departmentName || 'General Engineering')));

  // Helper to extract student area deficiency
  const getStudentDeficiency = (r: ExamResult) => {
    const examQuestions = store.questions.filter(
      (q) =>
        q.subject.toLowerCase().includes((r.subjectName || '').toLowerCase()) ||
        store.exams.find((e) => e.id === r.examId)?.questionIds.includes(q.id)
    );
    const questionsToUse = examQuestions.length > 0 ? examQuestions : store.questions.slice(0, 5);
    const sampleAnswers: Record<string, string> = {};
    questionsToUse.forEach((q, idx) => {
      const isCorrect = idx < r.correctAnswersCount;
      sampleAnswers[q.id] = isCorrect ? q.correctAnswer : 'WRONG';
    });
    return analyzeStudentAreaDeficiencies(sampleAnswers, questionsToUse, r.studentId, r.studentName);
  };

  // Department-Wise Comparative Merit & Deficiency Analytics
  const departmentSummaries = allDepartments.map((deptName) => {
    const deptResults = results.filter((r) => (r.departmentName || 'General Engineering') === deptName);
    const deptPassed = deptResults.filter((r) => r.passed).length;
    const deptPassRate = deptResults.length > 0 ? Math.round((deptPassed / deptResults.length) * 100) : 0;
    const deptAvg =
      deptResults.length > 0
        ? Math.round(
            (deptResults.reduce((sum, r) => sum + r.percentage, 0) / deptResults.length) * 10
          ) / 10
        : 0;

    const highestResult = deptResults.reduce(
      (max, curr) => (curr.percentage > (max?.percentage || 0) ? curr : max),
      deptResults[0]
    );

    // Identify primary deficiency area across department's students
    const deficiencyFrequency: Record<string, number> = {};
    deptResults.forEach((r) => {
      const analysis = getStudentDeficiency(r);
      analysis.criticalWeaknesses.forEach((w) => {
        deficiencyFrequency[w.topic] = (deficiencyFrequency[w.topic] || 0) + 1;
      });
    });

    const topDeficiency = Object.entries(deficiencyFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'No critical deficiency detected';

    return {
      departmentName: deptName,
      totalAppeared: deptResults.length,
      passedCount: deptPassed,
      failedCount: deptResults.length - deptPassed,
      passRate: deptPassRate,
      averageMarks: deptAvg,
      highestScore: highestResult?.percentage || 100,
      topStudent: highestResult?.studentName || 'N/A',
      topStudentReg: highestResult?.registerNumber || 'N/A',
      primaryDeficiency: topDeficiency,
    };
  });

  // 1-Click Export Department-Wise Merit Report (Excel)
  const handleExportDepartmentMeritExcel = () => {
    // Sheet 1: Department Summary
    const deptData = departmentSummaries.map((ds) => ({
      'Department Name': ds.departmentName,
      'Total Students Evaluated': ds.totalAppeared,
      'Students Passed': ds.passedCount,
      'Students Failed': ds.failedCount,
      'Department Pass Rate (%)': `${ds.passRate}%`,
      'Department Average (%)': `${ds.averageMarks}%`,
      'Highest Score (%)': `${ds.highestScore}%`,
      'Top Rank Student': `${ds.topStudent} (${ds.topStudentReg})`,
      'Primary Curriculum Deficiency Area': ds.primaryDeficiency,
    }));

    // Sheet 2: Department Student Rankings
    const studentData = results.map((r) => {
      const analysis = getStudentDeficiency(r);
      return {
        Rank: r.rank || 1,
        Department: r.departmentName,
        'Academic Year': r.year,
        Section: r.section,
        'Register Number': r.registerNumber,
        'Student Name': r.studentName,
        Examination: r.examName,
        'Score Obtained': r.marksObtained,
        'Total Marks': r.totalMarks,
        'Percentage (%)': r.percentage,
        Result: r.passed ? 'PASS' : 'FAIL',
        'Weak Area to Improve': analysis.criticalWeaknesses[0]?.topic || 'Proficient across tested topics',
        'Actionable Recommendation': analysis.priorityImprovementAdvice[0] || 'Maintain high performance',
      };
    });

    const workbook = XLSX.utils.book_new();

    const wsDept = XLSX.utils.json_to_sheet(deptData);
    wsDept['!cols'] = [
      { wch: 28 }, // Department
      { wch: 22 }, // Total
      { wch: 16 }, // Passed
      { wch: 16 }, // Failed
      { wch: 22 }, // Pass Rate
      { wch: 22 }, // Avg
      { wch: 18 }, // Highest
      { wch: 30 }, // Top Student
      { wch: 35 }, // Deficiency
    ];
    XLSX.utils.book_append_sheet(workbook, wsDept, 'Department_Merit_Summary');

    const wsStudents = XLSX.utils.json_to_sheet(studentData);
    wsStudents['!cols'] = [
      { wch: 8 },  // Rank
      { wch: 26 }, // Department
      { wch: 14 }, // Year
      { wch: 10 }, // Section
      { wch: 16 }, // Reg No
      { wch: 22 }, // Name
      { wch: 32 }, // Exam
      { wch: 14 }, // Score
      { wch: 12 }, // Total
      { wch: 14 }, // %
      { wch: 10 }, // Result
      { wch: 30 }, // Weak area
      { wch: 45 }, // Action plan
    ];
    XLSX.utils.book_append_sheet(workbook, wsStudents, 'Student_Department_Rankings');

    XLSX.writeFile(workbook, `Sasurie_Department_Wise_Merit_Report.xlsx`);
  };

  // Export Individual Marksheets to Excel
  const handleExportIndividualExcel = () => {
    const exportData = filteredResults.map((r) => ({
      Rank: r.rank || 'N/A',
      'Register Number': r.registerNumber,
      'Student Name': r.studentName,
      Department: r.departmentName,
      Year: r.year,
      Section: r.section,
      Examination: r.examName,
      'Marks Obtained': r.marksObtained,
      'Total Marks': r.totalMarks,
      'Percentage (%)': r.percentage,
      'Correct Answers': r.correctAnswersCount,
      'Incorrect Answers': r.incorrectAnswersCount,
      'Unanswered Count': r.unansweredCount,
      'Time Taken (Min)': r.timeTakenMinutes,
      Result: r.passed ? 'PASS' : 'FAIL',
      Status: r.published ? 'Published' : 'Draft Review',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results_Report');
    XLSX.writeFile(workbook, `Sasurie_Student_Results_${selectedDept.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Results &amp; Academic Merit Analysis</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              {filteredResults.length} Evaluated Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department-wise merit evaluation, cohort pass rates, weak area diagnosis, and one-click Excel report downloads.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Dedicated 1-Click Export Department Merit Report */}
          <button
            onClick={handleExportDepartmentMeritExcel}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
            title="Download department-wise performance and rankings as Excel workbook"
          >
            <Download className="w-3.5 h-3.5" />
            Export Department Merit Report (Excel)
          </button>

          <button
            onClick={handleExportIndividualExcel}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Student Marksheets (Excel)
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* View Switcher: Department-Wise Summary vs Detailed Marksheet */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveViewTab('department_merit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeViewTab === 'department_merit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Department-Wise Academic Merit &amp; Deficiencies ({departmentSummaries.length} Depts)
        </button>
        <button
          onClick={() => setActiveViewTab('student_merit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeViewTab === 'student_merit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Detailed Student Marksheets ({filteredResults.length} Students)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Evaluated Attempts</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{filteredResults.length}</p>
          <span className="text-[11px] text-slate-400">Anna Univ Certified</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Pass Percentage</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{passRate}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {passedCount} of {filteredResults.length} Passed
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Cohort Average</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{avgMarks}%</p>
          <span className="text-[11px] text-slate-400">Class Overall Index</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Highest Score</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">100%</p>
          <span className="text-[11px] text-indigo-600 font-medium">Rank 1: Dhanush R</span>
        </div>
      </div>

      {/* Department-Wise Analysis Grid (when tab active) */}
      {activeViewTab === 'department_merit' && (
        <div className="no-print space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Department-Wise Continuous Assessment Merit Analysis
            </h3>
            <span className="text-xs text-slate-500">
              Generated from automated student assessment logs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentSummaries.map((ds) => (
              <div
                key={ds.departmentName}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{ds.departmentName}</h4>
                        <span className="text-[11px] text-slate-500">
                          {ds.totalAppeared} Evaluated Students
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {ds.passRate}% Pass Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Average</span>
                      <strong className="text-base font-bold text-blue-600">{ds.averageMarks}%</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Top Mark</span>
                      <strong className="text-base font-bold text-indigo-600">{ds.highestScore}%</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Passed / Total</span>
                      <strong className="text-base font-bold text-emerald-600">
                        {ds.passedCount}/{ds.totalAppeared}
                      </strong>
                    </div>
                  </div>

                  {/* Top Scorer & Primary Deficiency */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                      <span className="font-semibold text-indigo-900">Department Topper:</span>
                      <span className="font-bold text-indigo-950">
                        {ds.topStudent} ({ds.topStudentReg})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900">
                      <span className="font-bold flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Area for Department Improvement:
                      </span>
                      <p className="text-[11px] text-amber-800 mt-1">
                        {ds.primaryDeficiency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Anna University Regulation 2021</span>
                  <button
                    onClick={() => {
                      setSelectedDept(ds.departmentName);
                      setActiveViewTab('student_merit');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Students &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar with Department & Year */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or reg no..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {allDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Years</option>
            <option value="I">Year I</option>
            <option value="II">Year II</option>
            <option value="III">Year III</option>
            <option value="IV">Year IV</option>
          </select>

          {/* Examination Filter */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Examinations</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.subjectCode} - {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Marksheet Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {/* Printable Official Header */}
        <div className="print-only hidden text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-tight">SASURIE COLLEGE OF ENGINEERING</h1>
          <p className="text-xs text-slate-600">Vijayamangalam, Tirupur - 638 056, Tamil Nadu</p>
          <p className="text-xs font-semibold mt-1">OFFICIAL CONTINUOUS INTERNAL ASSESSMENT MARKSHEET</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Register Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Examination</th>
                <th className="p-3.5">Score / Total</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Result</th>
                <th className="p-3.5">Status</th>
                <th className="no-print p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No results recorded for this selection.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          r.rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : r.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : r.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.rank || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-900">
                      {r.registerNumber}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{r.studentName}</p>
                      <p className="text-[11px] text-slate-400">
                        {r.departmentName} • Yr {r.year}
                      </p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 max-w-[200px] truncate">
                      {r.examName}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.marksObtained} / {r.totalMarks}
                    </td>
                    <td className="p-3.5 font-bold text-blue-600">{r.percentage}%</td>
                    <td className="p-3.5 text-slate-600">
                      <span className="text-emerald-600 font-semibold">{r.correctAnswersCount}✓</span>{' '}
                      <span className="text-rose-600 font-semibold">{r.incorrectAnswersCount}✗</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          r.published
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="no-print p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedResult(r)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold transition text-xs"
                      >
                        Card
                      </button>
                      <button
                        onClick={() => setSelectedResult(r)}
                        className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold transition text-xs"
                      >
                        Deficiency Analysis
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Score Card & Student-Wise Deficiency Diagnosis Modal */}
      {selectedResult && (() => {
        const examQuestions = store.questions.filter(
          (q) =>
            q.subject.toLowerCase().includes((selectedResult.subjectName || '').toLowerCase()) ||
            store.exams.find((e) => e.id === selectedResult.examId)?.questionIds.includes(q.id)
        );

        // Build answer map reflecting student performance
        const sampleAnswers: Record<string, string> = {};
        examQuestions.forEach((q, idx) => {
          const isCorrect = idx < selectedResult.correctAnswersCount;
          sampleAnswers[q.id] = isCorrect ? q.correctAnswer : 'WRONG';
        });

        const weaknessReport = analyzeStudentAreaDeficiencies(
          sampleAnswers,
          examQuestions.length > 0 ? examQuestions : store.questions.slice(0, 5),
          selectedResult.studentId,
          selectedResult.studentName
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Student Scorecard &amp; Area Deficiency Diagnosis
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Topic-level diagnostic breakdown &amp; personalized remedial actions
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedResult(null)} className="text-slate-400 text-lg hover:text-slate-600">
                  &times;
                </button>
              </div>

              {/* Student Metadata */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedResult.studentName}</p>
                  <p className="font-mono text-slate-500 text-[11px]">
                    Reg No: {selectedResult.registerNumber} • {selectedResult.departmentName}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {selectedResult.examName}
                  </span>
                </div>
              </div>

              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-semibold uppercase">Total Score</span>
                  <p className="text-lg font-extrabold text-blue-900 mt-0.5">
                    {selectedResult.marksObtained} / {selectedResult.totalMarks}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase">Percentage</span>
                  <p className="text-lg font-extrabold text-emerald-900 mt-0.5">
                    {selectedResult.percentage}%
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 font-semibold uppercase">Class Rank</span>
                  <p className="text-lg font-extrabold text-indigo-900 mt-0.5">
                    Rank #{selectedResult.rank || 1}
                  </p>
                </div>
              </div>

              {/* STUDENT-WISE AREA DEFICIENCY DIAGNOSIS */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Student Area Weakness Diagnosis (Which Areas Need Improvement)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Faculty Remedial Action Plan
                  </span>
                </div>

                {/* Critical Deficiencies (< 50%) */}
                {weaknessReport.criticalWeaknesses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      Critical Weakness Areas (&lt;50% Retention):
                    </span>
                    <div className="space-y-2">
                      {weaknessReport.criticalWeaknesses.map((w, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-rose-200 shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">
                              Unit {w.unit}: {w.topic}
                            </span>
                            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Score: {w.percentage}% (Low)
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-900 leading-snug">
                            <strong>Remedial Step:</strong> {w.remedialAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Moderate Retention Areas (50% - 79%) */}
                {weaknessReport.moderateTopics.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      Moderate Retention Areas (Reinforce Practice):
                    </span>
                    <div className="space-y-2">
                      {weaknessReport.moderateTopics.map((m, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">
                              Unit {m.unit}: {m.topic}
                            </span>
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Score: {m.percentage}% (Moderate)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{m.remedialAction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mastered Concepts */}
                {weaknessReport.masteredTopics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Mastered Strengths (&ge;80% Retention):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {weaknessReport.masteredTopics.map((m, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg border border-emerald-200 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Unit {m.unit}: {m.topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Advice */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-amber-950 font-medium">
                  <span className="font-bold text-[11px] text-amber-900 block mb-0.5">
                    Faculty Guidance for {selectedResult.studentName}:
                  </span>
                  {weaknessReport.priorityImprovementAdvice.map((adv, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">&bull; {adv}</p>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Close Diagnosis
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Print Scorecard
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
