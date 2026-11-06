import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  HelpCircle,
  GraduationCap,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { store } from '../../services/store';
import { Question, QuestionType, DifficultyLevel } from '../../types';
import { generateQuestionWithAI } from '../../services/geminiService';

export const QuestionBankMgmt: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // New Question form state
  const [newQuestion, setNewQuestion] = useState({
    departmentName: 'CSE (Cyber Security)',
    year: 'III' as 'I' | 'II' | 'III' | 'IV' | 'All',
    subjectCode: 'CS3501',
    subject: 'Cyber Security & Cryptography',
    unit: 1,
    topic: '',
    type: 'mcq' as QuestionType,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 2,
    negativeMarks: 0.5,
    difficulty: 'medium' as DifficultyLevel,
    explanation: '',
    imageUrl: '',
  });

  // Bulk Upload State & Target Cohort Mapping
  const [uploadTargetDept, setUploadTargetDept] = useState<string>('CSE (Cyber Security)');
  const [uploadTargetYear, setUploadTargetYear] = useState<'I' | 'II' | 'III' | 'IV' | 'All'>('III');
  const [uploadTargetSubjectCode, setUploadTargetSubjectCode] = useState<string>('CS3501');
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const questions = store.questions;

  // Unique subjects and departments in bank
  const subjects = Array.from(new Set(questions.map((q) => q.subject)));
  const departments = ['CSE (Cyber Security)', 'AI & Data Science', 'CSE', 'ECE'];

  // Filtered Questions with Department and Year mapping
  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.subjectCode && q.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchDept = selectedDept === 'All' || q.departmentName === selectedDept || !q.departmentName;
    const matchYear = selectedYear === 'All' || q.year === selectedYear || !q.year;
    const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchUnit = selectedUnit === 'All' || q.unit === Number(selectedUnit);
    const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    return matchSearch && matchDept && matchYear && matchSubject && matchUnit && matchDiff;
  });

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.questionText.trim()) {
      alert('Question text is required.');
      return;
    }

    const options =
      newQuestion.type === 'mcq'
        ? [
            { id: 'A', text: newQuestion.optionA || 'Option A' },
            { id: 'B', text: newQuestion.optionB || 'Option B' },
            { id: 'C', text: newQuestion.optionC || 'Option C' },
            { id: 'D', text: newQuestion.optionD || 'Option D' },
          ]
        : newQuestion.type === 'true_false'
        ? [
            { id: 'True', text: 'True' },
            { id: 'False', text: 'False' },
          ]
        : undefined;

    store.addQuestion({
      departmentName: newQuestion.departmentName,
      year: newQuestion.year,
      subjectCode: newQuestion.subjectCode,
      subject: newQuestion.subject,
      unit: Number(newQuestion.unit),
      topic: newQuestion.topic || 'General Concepts',
      type: newQuestion.type,
      questionText: newQuestion.questionText,
      options,
      correctAnswer: newQuestion.correctAnswer,
      marks: Number(newQuestion.marks),
      negativeMarks: Number(newQuestion.negativeMarks),
      difficulty: newQuestion.difficulty,
      explanation: newQuestion.explanation,
      imageUrl: newQuestion.imageUrl || undefined,
    });

    setShowAddModal(false);
    setNewQuestion({
      departmentName: 'CSE (Cyber Security)',
      year: 'III',
      subjectCode: 'CS3501',
      subject: 'Cyber Security & Cryptography',
      unit: 1,
      topic: '',
      type: 'mcq',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      explanation: '',
      imageUrl: '',
    });
  };

  // AI Assistant: Generate Question
  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const generated = await generateQuestionWithAI(
        newQuestion.subject,
        newQuestion.topic || 'Core Engineering Principles',
        newQuestion.difficulty
      );
      setNewQuestion((prev) => ({
        ...prev,
        questionText: generated.questionText,
        optionA: generated.options[0]?.text || '',
        optionB: generated.options[1]?.text || '',
        optionC: generated.options[2]?.text || '',
        optionD: generated.options[3]?.text || '',
        correctAnswer: generated.correctAnswer,
        explanation: generated.explanation,
      }));
    } catch (err) {
      console.warn('AI generator error', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 1-Click Download Sample Excel (.xlsx) Template for Teachers / Admins
  const handleDownloadSampleExcel = () => {
    const templateRows = [
      {
        Department: 'CSE (Cyber Security)',
        Year: 'III',
        'Subject Code': 'CS3501',
        Subject: 'Cyber Security & Cryptography',
        Unit: 1,
        Topic: 'Asymmetric Cryptography',
        Type: 'mcq',
        Question: 'In the RSA public-key cryptosystem, what mathematical problem forms the basis of its security?',
        'Option A': 'Discrete Logarithm Problem',
        'Option B': 'Prime Factorization of large composite numbers',
        'Option C': 'Elliptic Curve Point Multiplication',
        'Option D': 'Knapsack Subset Sum Problem',
        'Correct Answer': 'B',
        Marks: 2,
        'Negative Marks': 0.5,
        Difficulty: 'medium',
        Explanation: 'RSA security is based on the computational hardness of factoring large composite primes.',
      },
      {
        Department: 'CSE (Cyber Security)',
        Year: 'III',
        'Subject Code': 'CS3501',
        Subject: 'Cyber Security & Cryptography',
        Unit: 2,
        Topic: 'Network Attacks & DDoS',
        Type: 'mcq',
        Question: 'Which TCP flag is continuously sent during a SYN flood attack to leave socket connections half-open?',
        'Option A': 'FIN flag',
        'Option B': 'SYN flag without ACK',
        'Option C': 'RST packet reset',
        'Option D': 'PSH push control',
        'Correct Answer': 'B',
        Marks: 2,
        'Negative Marks': 0.5,
        Difficulty: 'easy',
        Explanation: 'SYN flood attacks abuse the three-way handshake by abandoning the final ACK step.',
      },
      {
        Department: 'AI & Data Science',
        Year: 'III',
        'Subject Code': 'AD3401',
        Subject: 'Machine Learning & Neural Networks',
        Unit: 1,
        Topic: 'Optimization & Gradient Descent',
        Type: 'mcq',
        Question: 'What hyperparameter controls the magnitude of parameter updates along the negative gradient vector in SGD?',
        'Option A': 'Weight decay rate',
        'Option B': 'Learning Rate (alpha)',
        'Option C': 'Mini-batch size',
        'Option D': 'Momentum coefficient',
        'Correct Answer': 'B',
        Marks: 2,
        'Negative Marks': 0.5,
        Difficulty: 'easy',
        Explanation: 'Learning rate regulates the step size at each gradient descent optimization step.',
      },
      {
        Department: 'AI & Data Science',
        Year: 'III',
        'Subject Code': 'AD3401',
        Subject: 'Machine Learning & Neural Networks',
        Unit: 2,
        Topic: 'Convolutional Architectures',
        Type: 'true_false',
        Question: 'Convolutional neural network filters preserve 2D spatial feature relationships through local weight sharing.',
        'Option A': 'True',
        'Option B': 'False',
        'Option C': '',
        'Option D': '',
        'Correct Answer': 'True',
        Marks: 1,
        'Negative Marks': 0.25,
        Difficulty: 'easy',
        Explanation: 'CNN weight sharing extracts translation-invariant spatial features across input images.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 24 }, // Department
      { wch: 8 }, // Year
      { wch: 14 }, // Subject Code
      { wch: 32 }, // Subject
      { wch: 8 }, // Unit
      { wch: 28 }, // Topic
      { wch: 10 }, // Type
      { wch: 65 }, // Question
      { wch: 25 }, // Option A
      { wch: 25 }, // Option B
      { wch: 25 }, // Option C
      { wch: 25 }, // Option D
      { wch: 14 }, // Correct Answer
      { wch: 8 }, // Marks
      { wch: 14 }, // Negative Marks
      { wch: 12 }, // Difficulty
      { wch: 45 }, // Explanation
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions_Template');
    XLSX.writeFile(wb, 'Sasurie_Question_Paper_Sample_Template.xlsx');
  };

  // Bulk Excel Upload with Department & Year Extraction
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (!jsonData || jsonData.length === 0) {
          setUploadError('The uploaded Excel file contains no data rows.');
          return;
        }

        // Validate structure and map department / year
        const validated = jsonData.map((row) => ({
          departmentName: String(row['Department'] || uploadTargetDept || 'CSE (Cyber Security)'),
          year: (String(row['Year'] || uploadTargetYear || 'III') as 'I' | 'II' | 'III' | 'IV' | 'All'),
          subjectCode: String(row['Subject Code'] || row['SubjectCode'] || uploadTargetSubjectCode || 'CS3501'),
          subject: String(row['Subject'] || 'Cyber Security & Cryptography'),
          unit: Number(row['Unit'] || 1),
          topic: String(row['Topic'] || 'Curriculum Concepts'),
          type: (String(row['Type'] || 'mcq').toLowerCase() as QuestionType) || 'mcq',
          questionText: String(row['Question'] || row['QuestionText'] || ''),
          options: [
            { id: 'A', text: String(row['Option A'] || row['OptionA'] || '') },
            { id: 'B', text: String(row['Option B'] || row['OptionB'] || '') },
            { id: 'C', text: String(row['Option C'] || row['OptionC'] || '') },
            { id: 'D', text: String(row['Option D'] || row['OptionD'] || '') },
          ],
          correctAnswer: String(row['Correct Answer'] || row['Answer'] || 'A').trim(),
          marks: Number(row['Marks'] || 2),
          negativeMarks: Number(row['Negative Marks'] || 0.5),
          difficulty: (String(row['Difficulty'] || 'medium').toLowerCase() as DifficultyLevel) || 'medium',
          explanation: String(row['Explanation'] || ''),
        }));

        const cleanRows = validated.filter((q) => q.questionText.trim().length > 5);
        if (cleanRows.length === 0) {
          setUploadError(
            'Validation failed: Ensure your file includes "Question", "Option A", "Option B", "Correct Answer", "Marks".'
          );
          return;
        }

        setParsedQuestions(cleanRows);
      } catch (err: any) {
        setUploadError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmBulkImport = () => {
    if (parsedQuestions.length === 0) return;
    const count = store.bulkAddQuestions(parsedQuestions);
    alert(`Successfully imported ${count} validated questions mapped to departments and academic years into Question Bank!`);
    setShowBulkUploadModal(false);
    setParsedQuestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Question Bank &amp; Item Registry</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {filteredQuestions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain curriculum-aligned question items mapped by Department, Academic Year, and Subject.
            Upload questions in bulk via Excel or download the official template.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Download Sample Excel Template Button */}
          <button
            onClick={handleDownloadSampleExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
            title="Download sample Excel template with Department and Year mappings"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Download Sample Excel (.xlsx)
          </button>

          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Questions Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Question
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Department & Year Mappings */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, topics, codes..."
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
            {departments.map((d) => (
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
            <option value="All">All Academic Years</option>
            <option value="I">Year I</option>
            <option value="II">Year II</option>
            <option value="III">Year III</option>
            <option value="IV">Year IV</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Units (1-5)</option>
            <option value="1">Unit 1</option>
            <option value="2">Unit 2</option>
            <option value="3">Unit 3</option>
            <option value="4">Unit 4</option>
            <option value="5">Unit 5</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No questions found matching your filter criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Q{idx + 1}
                  </span>

                  {/* Department & Year Badges */}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-indigo-500" />
                    {q.departmentName || 'CSE (Cyber Security)'} • Year {q.year || 'III'}
                  </span>

                  {q.subjectCode && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {q.subjectCode}
                    </span>
                  )}

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {q.subject}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Unit {q.unit}: {q.topic}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {q.marks} Marks {q.negativeMarks > 0 && `(-${q.negativeMarks})`}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Delete this question from question bank?')) {
                      store.deleteQuestion(q.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question Text */}
              <p className="font-semibold text-sm text-slate-900 mt-2.5 leading-relaxed">
                {q.questionText}
              </p>

              {/* Options */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        opt.id === q.correctAnswer
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <strong className="font-bold text-slate-500">{opt.id}.</strong>
                        <span>{opt.text}</span>
                      </span>
                      {opt.id === q.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Correct Answer & Explanation */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Key: {q.correctAnswer}
                  </span>
                  {q.explanation && (
                    <span className="text-slate-500 italic">Explanation: {q.explanation}</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 uppercase font-mono">
                  ID: {q.id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Add New Examination Question</h3>
              </div>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* AI Generation Quick Trigger */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-3.5 rounded-xl text-white my-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold">Gemini AI Question Assistant</span>
              </div>
              <button
                type="button"
                disabled={isGeneratingAI}
                onClick={handleAIGenerate}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGeneratingAI ? 'Drafting...' : 'Generate with AI'}
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              {/* Department & Academic Year Mapping */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Curriculum &amp; Department Mapping
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={newQuestion.departmentName}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, departmentName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                    <select
                      value={newQuestion.year}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          year: e.target.value as 'I' | 'II' | 'III' | 'IV' | 'All',
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="I">Year I</option>
                      <option value="II">Year II</option>
                      <option value="III">Year III</option>
                      <option value="IV">Year IV</option>
                      <option value="All">All Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CS3501, AD3401"
                      value={newQuestion.subjectCode}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, subjectCode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit (1 - 5)</label>
                  <select
                    value={newQuestion.unit}
                    onChange={(e) => setNewQuestion({ ...newQuestion, unit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Asymmetric Cryptography, Hash Functions"
                  value={newQuestion.topic}
                  onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="Enter the complete question prompt..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Options A-D */}
              {newQuestion.type === 'mcq' && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Answer Options</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      value={newQuestion.optionA}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionA: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      value={newQuestion.optionB}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionB: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={newQuestion.optionC}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionC: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      value={newQuestion.optionD}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionD: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={newQuestion.marks}
                    onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newQuestion.negativeMarks}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, negativeMarks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Explanation / Solution Guide</label>
                <input
                  type="text"
                  placeholder="Rationale displayed to student after results publication"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Excel Upload with Validation, Preview & Department Mapping */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">Upload Questions via Excel (.xlsx)</h3>
                  <p className="text-[11px] text-slate-500">
                    Bulk import questions with department &amp; year mapping for examination scheduling
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBulkUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-xs text-emerald-950">Official Sasurie Question Template</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Includes formatted columns: <code>Department</code>, <code>Year</code>, <code>Subject Code</code>, <code>Subject</code>, <code>Unit</code>, <code>Topic</code>, <code>Question</code>, <code>Option A-D</code>, <code>Correct Answer</code>, <code>Marks</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 flex-shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample Excel (.xlsx)
              </button>
            </div>

            {/* Default Cohort Mapping Fallbacks */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-xs">
              <span className="font-bold text-slate-800 block mb-1.5 text-[11px] uppercase tracking-wider">
                Default Target Department &amp; Academic Year
              </span>
              <p className="text-[11px] text-slate-500 mb-2">
                Applied automatically to any rows in your spreadsheet where Department or Year is left blank:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Target Department</label>
                  <select
                    value={uploadTargetDept}
                    onChange={(e) => setUploadTargetDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Target Year</label>
                  <select
                    value={uploadTargetYear}
                    onChange={(e) => setUploadTargetYear(e.target.value as 'I' | 'II' | 'III' | 'IV' | 'All')}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="I">Year I</option>
                    <option value="II">Year II</option>
                    <option value="III">Year III</option>
                    <option value="IV">Year IV</option>
                    <option value="All">All Years</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Default Subject Code</label>
                  <input
                    type="text"
                    value={uploadTargetSubjectCode}
                    onChange={(e) => setUploadTargetSubjectCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-emerald-500 transition cursor-pointer relative bg-slate-50">
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                Click or drag &amp; drop your completed Excel spreadsheet (.xlsx, .xls)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Questions will be validated and mapped directly into the question repository
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Preview table with Department & Year columns */}
            {parsedQuestions.length > 0 && (
              <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Preview: {parsedQuestions.length} Questions Validated &amp; Ready for Import
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Department &amp; Year mapped successfully
                  </span>
                </div>
                <div className="overflow-y-auto max-h-48 border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-600">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Department / Year</th>
                        <th className="p-2">Code / Subject</th>
                        <th className="p-2">Unit</th>
                        <th className="p-2">Question</th>
                        <th className="p-2">Key</th>
                        <th className="p-2">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedQuestions.slice(0, 10).map((pq, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-500">{i + 1}</td>
                          <td className="p-2 font-medium text-indigo-700 whitespace-nowrap">
                            {pq.departmentName} (Yr {pq.year})
                          </td>
                          <td className="p-2 text-slate-700 whitespace-nowrap">
                            <span className="font-mono text-[11px] font-bold text-slate-800">{pq.subjectCode}</span> - {pq.subject}
                          </td>
                          <td className="p-2 text-slate-600 whitespace-nowrap">Unit {pq.unit}</td>
                          <td className="p-2 font-medium text-slate-900 line-clamp-1 max-w-xs">{pq.questionText}</td>
                          <td className="p-2 font-bold text-emerald-600">{pq.correctAnswer}</td>
                          <td className="p-2 font-semibold">{pq.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setParsedQuestions([]);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedQuestions.length === 0}
                onClick={confirmBulkImport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirm Import ({parsedQuestions.length} Questions)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
