export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'hod'
  | 'cdc'
  | 'faculty'
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  username?: string; // e.g. "siperadmin", "superadmin", "principal", "cdc"
  password?: string; // e.g. "SAS@123"
  designation?: string;
  employeeId?: string;
  departmentId?: string;
  departmentName?: string;
  registerNumber?: string; // For students
  year?: 'I' | 'II' | 'III' | 'IV';
  section?: 'A' | 'B' | 'C';
  batch?: string; // e.g. "2022-2026"
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  code: string; // e.g., "CSE-CS", "AI-DS"
  name: string;
  hodName: string;
  hodEmail: string;
  totalStudents: number;
  totalFaculty: number;
  establishedYear: number;
}

export interface AcademicBatch {
  id: string;
  batchYears: string; // e.g. "2023-2027"
  regulation: string; // e.g. "R2021"
  status: 'current' | 'graduated';
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'descriptive';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  subject: string;
  unit: number; // 1 to 5
  topic: string;
  type: QuestionType;
  questionText: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string; // "A", "B", "C", "D", "True", "False", or keyword string
  marks: number;
  negativeMarks: number;
  difficulty: DifficultyLevel;
  explanation: string;
  imageUrl?: string;
  departmentId?: string;
  departmentName?: string;
  year?: 'I' | 'II' | 'III' | 'IV' | 'All';
  subjectCode?: string;
  createdAt: string;
}

export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'results_published';

export interface Exam {
  id: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  departmentId: string;
  departmentName: string;
  year: 'I' | 'II' | 'III' | 'IV';
  section: 'All' | 'A' | 'B' | 'C';
  batch: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  instructions: string;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  resultPublicationDate: string;
  status: ExamStatus;
  questionIds: string[];
  maxWarnings: number;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  departmentName: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'auto_submitted_violation' | 'timed_out';
  answers: Record<string, string>; // questionId -> selectedOption or text
  markedForReview: string[]; // questionId[]
  violationsCount: number;
  score?: number;
  percentage?: number;
  passed?: boolean;
  evaluated: boolean;
}

export type ViolationType =
  | 'face_not_detected'
  | 'multiple_faces'
  | 'mobile_phone_detected'
  | 'suspicious_object'
  | 'looking_away'
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'copy_paste_attempt'
  | 'right_click_attempt'
  | 'suspicious_shortcut';

export interface ProctoringEvent {
  id: string;
  attemptId?: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  violationType: ViolationType;
  timestamp: string;
  warningNumber: number;
  severity: 'low' | 'medium' | 'high';
  snapshotUrl?: string;
  resolved: boolean;
  notes?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examName: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  departmentName: string;
  year: string;
  section: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  timeTakenMinutes: number;
  passed: boolean;
  rank?: number;
  submittedAt: string;
  published: boolean;
}

export interface CourseNote {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  year: 'I' | 'II' | 'III' | 'IV';
  semester: number; // 1 - 8
  subject: string;
  unit: number; // 1 - 5
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'image';
  fileUrl: string;
  fileSizeMb: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadsCount: number;
}

export interface SpeakingPassage {
  id: string;
  title: string;
  category: 'Interview Questions' | 'Technical Reading' | 'Professional Communication' | 'Campus Placement';
  difficulty: DifficultyLevel;
  passageText: string;
  targetYears: ('I' | 'II' | 'III' | 'IV')[];
  estimatedReadTimeSec: number;
  phoneticTips?: string[];
  createdAt: string;
}

export type AssessmentRating = 'EXCELLENT' | 'GOOD' | 'NEEDS IMPROVEMENT';

export interface SpeakingAttempt {
  id: string;
  passageId: string;
  passageTitle: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  departmentName: string;
  recordedAt: string;
  spokenText: string;
  durationSeconds: number;
  readingAccuracy: number; // 0 - 100%
  pronunciationScore: number; // 0 - 100%
  fluencyScore: number; // 0 - 100%
  speakingPaceWpm: number;
  missingWords: string[];
  incorrectWords: {
    expected: string;
    spoken: string;
  }[];
  repeatedWords: string[];
  sentenceCompletionRate: number; // 0 - 100%
  overallRating: AssessmentRating;
  aiFeedback: string;
}

export interface ResumeFile {
  id: string;
  title: string;
  category:
    | 'IT Resume'
    | 'Software Developer'
    | 'Cyber Security'
    | 'AI and Data Science'
    | 'Core Engineering'
    | 'Internship Resume'
    | 'Fresher Resume';
  format: 'PDF' | 'DOCX';
  departmentName: string;
  targetYear: string;
  downloadUrl: string;
  description: string;
  keyHighlights: string[];
  uploadedAt: string;
  downloadsCount: number;
}

export interface CodingProfile {
  studentId: string;
  registerNumber: string;
  studentName: string;
  departmentName: string;
  year: string;
  leetcodeUsername: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contestRating?: number;
  lastSyncedAt: string;
  recentBadges: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'exam' | 'result' | 'note' | 'communication' | 'announcement';
  targetType: 'all' | 'department' | 'year' | 'section' | 'student';
  targetValue?: string;
  createdAt: string;
  readBy: string[]; // userIds
  senderName: string;
}

export type GDCategory =
  | 'Current Affairs'
  | 'AI & Tech Ethics'
  | 'Placement Hot Topics'
  | 'Business & Economy'
  | 'Social Issues';

export interface GDTopic {
  id: string;
  title: string;
  category: GDCategory;
  newsSummary: string;
  newsSource?: string;
  publishedDate: string;
  pointsFor: string[];
  pointsAgainst: string[];
  statistics: string[];
  dosAndDonts: string[];
  starterPhrases: string[];
  authorName: string;
  trending?: boolean;
}

export interface TopicDeficiency {
  topic: string;
  subject: string;
  unit: number;
  score: number;
  total: number;
  percentage: number;
  status: 'mastered' | 'moderate' | 'needs_improvement';
  remedialAction: string;
  recommendedNoteId?: string;
}

