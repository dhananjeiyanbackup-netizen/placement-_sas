/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { User, Exam } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DepartmentStudentMgmt } from './components/admin/DepartmentStudentMgmt';
import { QuestionBankMgmt } from './components/admin/QuestionBankMgmt';
import { ExamScheduler } from './components/admin/ExamScheduler';
import { ProctoringDashboard } from './components/admin/ProctoringDashboard';
import { ResultsReports } from './components/admin/ResultsReports';
import { NotesMgmt } from './components/admin/NotesMgmt';
import { CommunicationAdmin } from './components/admin/CommunicationAdmin';
import { ResumeBankAdmin } from './components/admin/ResumeBankAdmin';
import { NotificationBroadcast } from './components/admin/NotificationBroadcast';
import { GDHub } from './components/gd/GDHub';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentExams } from './components/student/StudentExams';
import { ExamTakingScreen } from './components/student/ExamTakingScreen';
import { StudentResults } from './components/student/StudentResults';
import { CommunicationLab } from './components/student/CommunicationLab';
import { CodingPractice } from './components/student/CodingPractice';
import { NotesLibrary } from './components/student/NotesLibrary';
import { ResumeBankStudent } from './components/student/ResumeBankStudent';
import { StudentProfile } from './components/student/StudentProfile';

export default function App() {
  const [, setTick] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(store.currentUser);
  const [activeTab, setActiveTab] = useState<string>('student-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTakingExam, setActiveTakingExam] = useState<Exam | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.currentUser ? { ...store.currentUser } : null);
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Sync active tab when user role changes
  useEffect(() => {
    if (currentUser?.role === 'student') {
      if (!activeTab.startsWith('student-') && activeTab !== 'profile') {
        setActiveTab('student-dashboard');
      }
    } else {
      if (!activeTab.startsWith('admin-')) {
        setActiveTab('admin-dashboard');
      }
    }
  }, [currentUser?.role]);

  // Handle start examination
  const handleStartExam = (exam: Exam) => {
    setActiveTakingExam(exam);
  };

  const handleFinishExam = () => {
    setActiveTakingExam(null);
    setActiveTab('student-results');
  };

  // If student is currently taking an examination, render isolated distraction-free proctoring view
  if (activeTakingExam && currentUser) {
    return (
      <ExamTakingScreen
        exam={activeTakingExam}
        currentUser={currentUser}
        onFinish={handleFinishExam}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectRole={(role) => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* ADMIN / FACULTY SCREENS */}
            {currentUser && currentUser.role !== 'student' && (
              <>
                {activeTab === 'admin-dashboard' && (
                  <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
                )}
                {activeTab === 'admin-dept-students' && <DepartmentStudentMgmt />}
                {activeTab === 'admin-questions' && <QuestionBankMgmt />}
                {activeTab === 'admin-exams' && <ExamScheduler />}
                {activeTab === 'admin-proctoring' && <ProctoringDashboard />}
                {activeTab === 'admin-results' && <ResultsReports />}
                {activeTab === 'admin-gd' && <GDHub currentUser={currentUser} />}
                {activeTab === 'admin-notes' && <NotesMgmt />}
                {activeTab === 'admin-communication' && <CommunicationAdmin />}
                {activeTab === 'admin-resumes' && <ResumeBankAdmin />}
                {activeTab === 'admin-coding' && (
                  <CodingPractice currentUser={store.users.find((u) => u.role === 'student') || currentUser} />
                )}
                {activeTab === 'admin-notifications' && <NotificationBroadcast />}
              </>
            )}

            {/* STUDENT SCREENS */}
            {currentUser && currentUser.role === 'student' && (
              <>
                {activeTab === 'student-dashboard' && (
                  <StudentDashboard
                    currentUser={currentUser}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onStartExam={handleStartExam}
                  />
                )}
                {activeTab === 'student-exams' && (
                  <StudentExams
                    currentUser={currentUser}
                    onStartExam={handleStartExam}
                    onViewResult={(examId) => setActiveTab('student-results')}
                  />
                )}
                {activeTab === 'student-upcoming' && (
                  <StudentExams
                    currentUser={currentUser}
                    onStartExam={handleStartExam}
                    onViewResult={(examId) => setActiveTab('student-results')}
                  />
                )}
                {activeTab === 'student-results' && <StudentResults currentUser={currentUser} />}
                {activeTab === 'student-gd' && <GDHub currentUser={currentUser} />}
                {activeTab === 'student-notes' && <NotesLibrary currentUser={currentUser} />}
                {activeTab === 'student-communication' && (
                  <CommunicationLab currentUser={currentUser} />
                )}
                {activeTab === 'student-resumes' && <ResumeBankStudent currentUser={currentUser} />}
                {activeTab === 'student-coding' && <CodingPractice currentUser={currentUser} />}
                {activeTab === 'student-notifications' && <NotificationBroadcast />}
                {activeTab === 'student-profile' && <StudentProfile currentUser={currentUser} />}
                {activeTab === 'profile' && <StudentProfile currentUser={currentUser} />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setIsAuthOpen(false);
          setActiveTab(user.role === 'student' ? 'student-dashboard' : 'admin-dashboard');
        }}
      />
    </div>
  );
}
