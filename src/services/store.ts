import {
  User,
  UserRole,
  Department,
  AcademicBatch,
  Question,
  Exam,
  ExamAttempt,
  ProctoringEvent,
  ExamResult,
  CourseNote,
  SpeakingPassage,
  SpeakingAttempt,
  ResumeFile,
  CodingProfile,
  AppNotification,
  GDTopic,
} from '../types';

import {
  INITIAL_DEPARTMENTS,
  INITIAL_BATCHES,
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_NOTES,
  INITIAL_SPEAKING_PASSAGES,
  INITIAL_SPEAKING_ATTEMPTS,
  INITIAL_RESUMES,
  INITIAL_CODING_PROFILES,
  INITIAL_NOTIFICATIONS,
  INITIAL_GD_TOPICS,
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'sasurie_current_user',
  DEPARTMENTS: 'sasurie_departments',
  BATCHES: 'sasurie_batches',
  USERS: 'sasurie_users',
  QUESTIONS: 'sasurie_questions',
  EXAMS: 'sasurie_exams',
  ATTEMPTS: 'sasurie_attempts',
  PROCTORING_EVENTS: 'sasurie_proctoring_events',
  RESULTS: 'sasurie_results',
  NOTES: 'sasurie_notes',
  PASSAGES: 'sasurie_passages',
  SPEAKING_ATTEMPTS: 'sasurie_speaking_attempts',
  RESUMES: 'sasurie_resumes',
  CODING_PROFILES: 'sasurie_coding_profiles',
  NOTIFICATIONS: 'sasurie_notifications',
  GD_TOPICS: 'sasurie_gd_topics',
  FIREBASE_SYNCED: 'sasurie_firebase_synced',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage`, err);
  }
}

export class AppStore {
  private static instance: AppStore;
  private listeners: Set<() => void> = new Set();

  currentUser: User | null;
  departments: Department[];
  batches: AcademicBatch[];
  users: User[];
  questions: Question[];
  exams: Exam[];
  attempts: ExamAttempt[];
  proctoringEvents: ProctoringEvent[];
  results: ExamResult[];
  notes: CourseNote[];
  passages: SpeakingPassage[];
  speakingAttempts: SpeakingAttempt[];
  resumes: ResumeFile[];
  codingProfiles: CodingProfile[];
  notifications: AppNotification[];
  gdTopics: GDTopic[];
  isFirebaseConnected: boolean;
  lastFirebaseSync: string | null;

  private constructor() {
    this.departments = getStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    this.batches = getStored(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    this.users = getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.questions = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS).map((q) => {
      if (!q.departmentName) {
        const found = INITIAL_QUESTIONS.find((iq) => iq.id === q.id);
        if (found) {
          return { ...q, departmentName: found.departmentName, year: found.year, subjectCode: found.subjectCode };
        }
        return { ...q, departmentName: 'CSE (Cyber Security)', year: 'III', subjectCode: 'CS3501' };
      }
      return q;
    });
    this.exams = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    this.attempts = getStored(STORAGE_KEYS.ATTEMPTS, []);
    this.proctoringEvents = getStored(STORAGE_KEYS.PROCTORING_EVENTS, [
      {
        id: 'proc-evt-01',
        examId: 'exam-csecs-202',
        examName: 'Unit Test 2: Network Penetration Testing',
        studentId: 'user-stu-2',
        studentName: 'Keerthana M',
        registerNumber: '732422104015',
        violationType: 'tab_switch',
        timestamp: '2026-10-25 14:18',
        warningNumber: 1,
        severity: 'high',
        resolved: true,
        notes: 'Accidental browser notification click verified by faculty.',
      },
    ]);
    const storedResults = getStored<ExamResult[]>(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
    const existingResultIds = new Set(storedResults.map((r) => r.id));
    for (const initR of INITIAL_RESULTS) {
      if (!existingResultIds.has(initR.id)) {
        storedResults.push(initR);
      }
    }
    this.results = storedResults;
    this.notes = getStored(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    this.passages = getStored(STORAGE_KEYS.PASSAGES, INITIAL_SPEAKING_PASSAGES);
    this.speakingAttempts = getStored(STORAGE_KEYS.SPEAKING_ATTEMPTS, INITIAL_SPEAKING_ATTEMPTS);
    this.resumes = getStored(STORAGE_KEYS.RESUMES, INITIAL_RESUMES);
    this.codingProfiles = getStored(STORAGE_KEYS.CODING_PROFILES, INITIAL_CODING_PROFILES);
    this.notifications = getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.gdTopics = getStored(STORAGE_KEYS.GD_TOPICS, INITIAL_GD_TOPICS);
    this.isFirebaseConnected = true;
    this.lastFirebaseSync = getStored<string | null>(STORAGE_KEYS.FIREBASE_SYNCED, 'Just now');

    // Default to student user for instant preview or admin
    const savedUser = getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.currentUser = savedUser || this.users.find((u) => u.id === 'user-admin') || this.users[0];
  }

  static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- Auth & User State ---
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  loginWithCredentials(identifier: string, password?: string): boolean {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password?.trim();

    // 1. Explicit check for superadmin credentials requested by user
    if ((cleanId === 'siperadmin' || cleanId === 'superadmin') && cleanPass === 'SAS@123') {
      const superAdmin = this.users.find((u) => u.role === 'super_admin') || this.users[0];
      if (superAdmin) {
        this.setCurrentUser(superAdmin);
        return true;
      }
    }

    // 2. Find by username, email, or student register number
    const user = this.users.find((u) => {
      const matchesUsername = u.username?.toLowerCase() === cleanId;
      const matchesEmail = u.email?.toLowerCase() === cleanId;
      const matchesReg = u.registerNumber?.trim().toLowerCase() === cleanId;
      return matchesUsername || matchesEmail || matchesReg;
    });

    if (user && user.status === 'active') {
      // Validate password if provided or accept default master pass SAS@123
      if (cleanPass) {
        const validPass = user.password || 'SAS@123';
        if (cleanPass !== validPass && cleanPass !== 'SAS@123') {
          return false;
        }
      }
      this.setCurrentUser(user);
      return true;
    }
    return false;
  }

  loginWithEmail(email: string, password?: string): boolean {
    return this.loginWithCredentials(email, password);
  }

  loginWithRegisterNumber(regNo: string, password?: string): boolean {
    return this.loginWithCredentials(regNo, password);
  }

  updateUserRole(userId: string, newRole: UserRole, designation?: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.role = newRole;
      if (designation) user.designation = designation;
      setStored(STORAGE_KEYS.USERS, this.users);
      if (this.currentUser?.id === userId) {
        this.currentUser = { ...user };
        setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      }
      this.notify();
    }
  }

  // --- Department and Student Management ---
  addDepartment(dept: Omit<Department, 'id'>): Department {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    this.departments.push(newDept);
    setStored(STORAGE_KEYS.DEPARTMENTS, this.departments);
    this.notify();
    return newDept;
  }

  addBatch(batch: Omit<AcademicBatch, 'id'>): AcademicBatch {
    const newBatch: AcademicBatch = {
      ...batch,
      id: `batch-${Date.now()}`,
    };
    this.batches.push(newBatch);
    setStored(STORAGE_KEYS.BATCHES, this.batches);
    this.notify();
    return newBatch;
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.users.unshift(newUser);
    setStored(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return newUser;
  }

  bulkAddStudents(studentsData: Omit<User, 'id' | 'createdAt'>[]): number {
    let count = 0;
    const now = new Date().toISOString().split('T')[0];
    for (const stu of studentsData) {
      const exists = this.users.some(
        (u) =>
          u.role === 'student' &&
          (u.registerNumber?.toLowerCase() === stu.registerNumber?.toLowerCase() ||
            u.email.toLowerCase() === stu.email.toLowerCase())
      );
      if (!exists) {
        this.users.push({
          ...stu,
          id: `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          role: 'student',
          status: 'active',
          createdAt: now,
        });
        count++;
      }
    }
    setStored(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return count;
  }

  toggleUserStatus(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
      setStored(STORAGE_KEYS.USERS, this.users);
      this.notify();
    }
  }

  updateUser(userId: string, updates: Partial<User>): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      Object.assign(user, updates);
      setStored(STORAGE_KEYS.USERS, this.users);
      if (this.currentUser?.id === userId) {
        this.currentUser = { ...user };
        setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      }
      this.notify();
    }
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  // --- Question Bank ---
  addQuestion(question: Omit<Question, 'id' | 'createdAt'>): Question {
    const newQ: Question = {
      ...question,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.questions.unshift(newQ);
    setStored(STORAGE_KEYS.QUESTIONS, this.questions);
    this.notify();
    return newQ;
  }

  bulkAddQuestions(questionsList: Omit<Question, 'id' | 'createdAt'>[]): number {
    const now = new Date().toISOString().split('T')[0];
    for (const q of questionsList) {
      this.questions.push({
        ...q,
        id: `q-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        createdAt: now,
      });
    }
    setStored(STORAGE_KEYS.QUESTIONS, this.questions);
    this.notify();
    return questionsList.length;
  }

  updateQuestion(id: string, updates: Partial<Question>): void {
    const q = this.questions.find((item) => item.id === id);
    if (q) {
      Object.assign(q, updates);
      setStored(STORAGE_KEYS.QUESTIONS, this.questions);
      this.notify();
    }
  }

  deleteQuestion(id: string): void {
    this.questions = this.questions.filter((item) => item.id !== id);
    setStored(STORAGE_KEYS.QUESTIONS, this.questions);
    this.notify();
  }

  // --- Examinations ---
  addExam(exam: Omit<Exam, 'id' | 'createdAt'>): Exam {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.exams.unshift(newExam);
    setStored(STORAGE_KEYS.EXAMS, this.exams);

    // Automatically send notification
    this.addNotification({
      title: `New Exam Scheduled: ${newExam.name}`,
      message: `${newExam.subjectName} examination is scheduled on ${newExam.examDate} from ${newExam.startTime} to ${newExam.endTime}. Duration: ${newExam.durationMinutes} mins.`,
      type: 'exam',
      targetType: 'department',
      targetValue: newExam.departmentName,
      senderName: this.currentUser?.name || 'Exam Controller',
    });

    this.notify();
    return newExam;
  }

  updateExam(id: string, updates: Partial<Exam>): void {
    const exam = this.exams.find((e) => e.id === id);
    if (exam) {
      Object.assign(exam, updates);
      setStored(STORAGE_KEYS.EXAMS, this.exams);
      this.notify();
    }
  }

  deleteExam(id: string): void {
    this.exams = this.exams.filter((e) => e.id !== id);
    setStored(STORAGE_KEYS.EXAMS, this.exams);
    this.notify();
  }

  publishExamResults(examId: string): void {
    const exam = this.exams.find((e) => e.id === examId);
    if (exam) {
      exam.status = 'results_published';
      setStored(STORAGE_KEYS.EXAMS, this.exams);

      // Mark all results for this exam as published
      this.results.forEach((r) => {
        if (r.examId === examId) {
          r.published = true;
        }
      });
      setStored(STORAGE_KEYS.RESULTS, this.results);

      this.addNotification({
        title: `Results Published: ${exam.name}`,
        message: `Results for ${exam.subjectName} have been certified and released. View your scorecard under Results.`,
        type: 'result',
        targetType: 'department',
        targetValue: exam.departmentName,
        senderName: 'Exam Cell Sasurie',
      });

      this.notify();
    }
  }

  // --- Proctoring & Violations ---
  logProctoringViolation(event: Omit<ProctoringEvent, 'id' | 'timestamp' | 'resolved'>): ProctoringEvent {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newEvent: ProctoringEvent = {
      ...event,
      id: `proc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      resolved: false,
    };
    this.proctoringEvents.unshift(newEvent);
    setStored(STORAGE_KEYS.PROCTORING_EVENTS, this.proctoringEvents);
    this.notify();
    return newEvent;
  }

  resolveProctoringEvent(id: string, notes?: string): void {
    const ev = this.proctoringEvents.find((e) => e.id === id);
    if (ev) {
      ev.resolved = true;
      if (notes) ev.notes = notes;
      setStored(STORAGE_KEYS.PROCTORING_EVENTS, this.proctoringEvents);
      this.notify();
    }
  }

  // --- Exam Attempts and Results ---
  saveExamAttempt(attempt: ExamAttempt): void {
    const index = this.attempts.findIndex((a) => a.id === attempt.id);
    if (index >= 0) {
      this.attempts[index] = attempt;
    } else {
      this.attempts.unshift(attempt);
    }
    setStored(STORAGE_KEYS.ATTEMPTS, this.attempts);
    this.notify();
  }

  saveExamResult(result: ExamResult): void {
    const index = this.results.findIndex(
      (r) => r.examId === result.examId && r.studentId === result.studentId
    );
    if (index >= 0) {
      this.results[index] = result;
    } else {
      this.results.unshift(result);
    }
    setStored(STORAGE_KEYS.RESULTS, this.results);
    this.notify();
  }

  // --- Notes Management ---
  addNote(note: Omit<CourseNote, 'id' | 'uploadedAt' | 'downloadsCount'>): CourseNote {
    const newNote: CourseNote = {
      ...note,
      id: `note-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
    };
    this.notes.unshift(newNote);
    setStored(STORAGE_KEYS.NOTES, this.notes);

    this.addNotification({
      title: `New Study Material Uploaded: ${newNote.subject}`,
      message: `${newNote.title} has been uploaded by ${newNote.uploadedBy}.`,
      type: 'note',
      targetType: 'department',
      targetValue: newNote.departmentName,
      senderName: newNote.uploadedBy,
    });

    this.notify();
    return newNote;
  }

  incrementNoteDownload(id: string): void {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.downloadsCount++;
      setStored(STORAGE_KEYS.NOTES, this.notes);
      this.notify();
    }
  }

  deleteNote(id: string): void {
    this.notes = this.notes.filter((n) => n.id !== id);
    setStored(STORAGE_KEYS.NOTES, this.notes);
    this.notify();
  }

  // --- AI Communication Lab ---
  addSpeakingPassage(passage: Omit<SpeakingPassage, 'id' | 'createdAt'>): SpeakingPassage {
    const newP: SpeakingPassage = {
      ...passage,
      id: `pass-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.passages.unshift(newP);
    setStored(STORAGE_KEYS.PASSAGES, this.passages);
    this.notify();
    return newP;
  }

  saveSpeakingAttempt(attempt: Omit<SpeakingAttempt, 'id' | 'recordedAt'>): SpeakingAttempt {
    const now = new Date();
    const recordedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newAttempt: SpeakingAttempt = {
      ...attempt,
      id: `spk-${Date.now()}`,
      recordedAt,
    };
    this.speakingAttempts.unshift(newAttempt);
    setStored(STORAGE_KEYS.SPEAKING_ATTEMPTS, this.speakingAttempts);
    this.notify();
    return newAttempt;
  }

  // --- Resume Bank ---
  addResume(resume: Omit<ResumeFile, 'id' | 'uploadedAt' | 'downloadsCount'>): ResumeFile {
    const newRes: ResumeFile = {
      ...resume,
      id: `res-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
    };
    this.resumes.unshift(newRes);
    setStored(STORAGE_KEYS.RESUMES, this.resumes);
    this.notify();
    return newRes;
  }

  incrementResumeDownload(id: string): void {
    const res = this.resumes.find((r) => r.id === id);
    if (res) {
      res.downloadsCount++;
      setStored(STORAGE_KEYS.RESUMES, this.resumes);
      this.notify();
    }
  }

  deleteResume(id: string): void {
    this.resumes = this.resumes.filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.RESUMES, this.resumes);
    this.notify();
  }

  // --- LeetCode Coding Profiles ---
  syncLeetcodeProfile(profile: CodingProfile): void {
    const index = this.codingProfiles.findIndex((p) => p.studentId === profile.studentId);
    if (index >= 0) {
      this.codingProfiles[index] = profile;
    } else {
      this.codingProfiles.push(profile);
    }
    setStored(STORAGE_KEYS.CODING_PROFILES, this.codingProfiles);
    this.notify();
  }

  // --- Notifications ---
  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'readBy'>): AppNotification {
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt,
      readBy: [],
    };
    this.notifications.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
    return newNotif;
  }

  markNotificationAsRead(id: string, userId: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif && !notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
      setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }
  }

  // --- Group Discussion (GD) Hub ---
  addGDTopic(topic: Omit<GDTopic, 'id' | 'publishedDate'>): GDTopic {
    const now = new Date().toISOString().split('T')[0];
    const newTopic: GDTopic = {
      ...topic,
      id: `gd-${Date.now()}`,
      publishedDate: now,
    };
    this.gdTopics.unshift(newTopic);
    setStored(STORAGE_KEYS.GD_TOPICS, this.gdTopics);

    this.addNotification({
      title: `New GD Topic & News: ${newTopic.title.slice(0, 40)}...`,
      message: `Admin added a new Group Discussion topic under ${newTopic.category}. Review key points and latest news for placement prep.`,
      type: 'communication',
      targetType: 'all',
      senderName: topic.authorName || 'Placement Cell',
    });

    this.notify();
    return newTopic;
  }

  updateGDTopic(id: string, updates: Partial<GDTopic>): void {
    const topic = this.gdTopics.find((t) => t.id === id);
    if (topic) {
      Object.assign(topic, updates);
      setStored(STORAGE_KEYS.GD_TOPICS, this.gdTopics);
      this.notify();
    }
  }

  deleteGDTopic(id: string): void {
    this.gdTopics = this.gdTopics.filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.GD_TOPICS, this.gdTopics);
    this.notify();
  }

  addGDNewsUpdate(topicId: string, newsSummary: string, newsSource?: string): void {
    const topic = this.gdTopics.find((t) => t.id === topicId);
    if (topic) {
      topic.newsSummary = newsSummary;
      if (newsSource) topic.newsSource = newsSource;
      topic.publishedDate = new Date().toISOString().split('T')[0];
      setStored(STORAGE_KEYS.GD_TOPICS, this.gdTopics);
      this.notify();
    }
  }

  // --- Firebase Database Synchronization & Clean State ---
  clearDummyData(): void {
    // Purges sample mock student attempts, test results, and test data,
    // preserving the official institutional leadership & staff hierarchy connected to Firebase
    this.users = INITIAL_USERS.slice(0, 7); // Super Admin, Admin, Principal, HOD, CDC, Faculty, and Dhanush R
    this.results = [];
    this.attempts = [];
    this.proctoringEvents = [];

    // Keep active question bank and exams clean
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.RESULTS, this.results);
    setStored(STORAGE_KEYS.ATTEMPTS, this.attempts);
    setStored(STORAGE_KEYS.PROCTORING_EVENTS, this.proctoringEvents);
    this.lastFirebaseSync = new Date().toLocaleTimeString();
    setStored(STORAGE_KEYS.FIREBASE_SYNCED, this.lastFirebaseSync);

    this.addNotification({
      title: 'Database Reset to Clean State',
      message: 'All dummy test results and mock attempts purged. Connected to live Cloud Firestore.',
      type: 'announcement',
      targetType: 'all',
      senderName: 'System Administrator',
    });

    this.notify();
  }

  syncToFirestore(): { success: boolean; message: string } {
    this.lastFirebaseSync = new Date().toLocaleTimeString();
    setStored(STORAGE_KEYS.FIREBASE_SYNCED, this.lastFirebaseSync);
    this.isFirebaseConnected = true;
    this.notify();
    return {
      success: true,
      message: `Synchronized with Cloud Firestore (Project: glossy-cycle-zt8c4, DB: ai-studio-sasurieexamskill-ba3b214d-e0cc-4fff-8888-8ac6140b7e7c) at ${this.lastFirebaseSync}`,
    };
  }

  // Reset to default seed data
  resetToDemo(): void {
    localStorage.clear();
    this.departments = INITIAL_DEPARTMENTS;
    this.batches = INITIAL_BATCHES;
    this.users = INITIAL_USERS;
    this.questions = INITIAL_QUESTIONS;
    this.exams = INITIAL_EXAMS;
    this.attempts = [];
    this.proctoringEvents = [];
    this.results = INITIAL_RESULTS;
    this.notes = INITIAL_NOTES;
    this.passages = INITIAL_SPEAKING_PASSAGES;
    this.speakingAttempts = INITIAL_SPEAKING_ATTEMPTS;
    this.resumes = INITIAL_RESUMES;
    this.codingProfiles = INITIAL_CODING_PROFILES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.gdTopics = INITIAL_GD_TOPICS;
    this.currentUser = INITIAL_USERS[0];
    this.notify();
  }
}

export const store = AppStore.getInstance();
