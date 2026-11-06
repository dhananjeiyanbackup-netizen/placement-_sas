import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  CalendarCheck,
  Camera,
  Award,
  BookOpen,
  Mic,
  FileText,
  Code2,
  Bell,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  MessagesSquare,
} from 'lucide-react';
import { User } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  alert?: boolean;
}

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const role = currentUser?.role || 'student';
  const isStudent = role === 'student';

  const studentNavItems: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-exams', label: 'My Examinations', icon: CalendarCheck, badge: 'Live' },
    { id: 'student-upcoming', label: 'Upcoming Exams', icon: CalendarCheck },
    { id: 'student-results', label: 'Results & Ranks', icon: Award },
    { id: 'student-gd', label: 'Group Discussion (GD) Hub', icon: MessagesSquare, highlight: true },
    { id: 'student-notes', label: 'Notes Library', icon: BookOpen },
    { id: 'student-communication', label: 'AI Communication Lab', icon: Mic, highlight: true },
    { id: 'student-resumes', label: 'Resume Bank', icon: FileText },
    { id: 'student-coding', label: 'Coding Practice (LeetCode)', icon: Code2 },
    { id: 'student-notifications', label: 'Notifications', icon: Bell },
    { id: 'student-profile', label: 'My Profile', icon: UserCheck },
  ];

  // Specific role item configurations
  const getRoleNavItems = (): NavItem[] => {
    switch (role) {
      case 'super_admin':
        return [
          { id: 'admin-dashboard', label: 'Super Admin Dashboard', icon: LayoutDashboard },
          { id: 'admin-dept-students', label: 'Staff Roles & Students', icon: Users, highlight: true },
          { id: 'admin-questions', label: 'Question Bank & Import', icon: FileQuestion },
          { id: 'admin-exams', label: 'Exam Scheduling', icon: CalendarCheck },
          { id: 'admin-proctoring', label: 'AI Camera Proctoring', icon: Camera, alert: true },
          { id: 'admin-results', label: 'Results & Weakness Audit', icon: Award },
          { id: 'admin-gd', label: 'Group Discussion (GD) Hub', icon: MessagesSquare },
          { id: 'admin-notes', label: 'Notes Management', icon: BookOpen },
          { id: 'admin-communication', label: 'AI Communication Lab', icon: Mic },
          { id: 'admin-resumes', label: 'Resume Bank Admin', icon: FileText },
          { id: 'admin-coding', label: 'LeetCode Performance', icon: Code2 },
          { id: 'admin-notifications', label: 'Broadcast Notifications', icon: Bell },
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'admin-dept-students', label: 'Staff Roles & Students', icon: Users, highlight: true },
          { id: 'admin-questions', label: 'Question Bank & Import', icon: FileQuestion },
          { id: 'admin-exams', label: 'Exam Scheduling', icon: CalendarCheck },
          { id: 'admin-proctoring', label: 'AI Camera Proctoring', icon: Camera, alert: true },
          { id: 'admin-results', label: 'Results & Reports', icon: Award },
          { id: 'admin-gd', label: 'Group Discussion (GD) Hub', icon: MessagesSquare },
          { id: 'admin-notes', label: 'Notes Management', icon: BookOpen },
          { id: 'admin-communication', label: 'AI Communication Lab', icon: Mic },
          { id: 'admin-resumes', label: 'Resume Bank Admin', icon: FileText },
          { id: 'admin-notifications', label: 'Broadcast Notifications', icon: Bell },
        ];
      case 'principal':
        return [
          { id: 'admin-dashboard', label: 'Executive College Dashboard', icon: LayoutDashboard },
          { id: 'admin-dept-students', label: 'Staff & Department Audit', icon: Users },
          { id: 'admin-results', label: 'Academic Merit & Pass Audit', icon: Award, highlight: true },
          { id: 'admin-proctoring', label: 'AI Proctoring Integrity', icon: Camera, alert: true },
          { id: 'admin-coding', label: 'CDC Placement & LeetCode', icon: Code2 },
          { id: 'admin-gd', label: 'Group Discussion (GD) Hub', icon: MessagesSquare },
          { id: 'admin-notes', label: 'Curriculum Notes Review', icon: BookOpen },
          { id: 'admin-notifications', label: 'Institutional Broadcast', icon: Bell },
        ];
      case 'hod':
        return [
          { id: 'admin-dashboard', label: 'Department Dashboard', icon: LayoutDashboard },
          { id: 'admin-dept-students', label: 'Dept Faculty & Students', icon: Users },
          { id: 'admin-questions', label: 'Department Question Bank', icon: FileQuestion },
          { id: 'admin-exams', label: 'Department Exam Schedule', icon: CalendarCheck },
          { id: 'admin-results', label: 'Results & Student Weakness', icon: Award, highlight: true },
          { id: 'admin-proctoring', label: 'Proctoring Log Feed', icon: Camera },
          { id: 'admin-notes', label: 'Syllabus Notes Upload', icon: BookOpen },
          { id: 'admin-gd', label: 'Group Discussion Topics', icon: MessagesSquare },
          { id: 'admin-notifications', label: 'Department Notices', icon: Bell },
        ];
      case 'cdc':
        return [
          { id: 'admin-dashboard', label: 'Placement Cell Dashboard', icon: LayoutDashboard },
          { id: 'admin-coding', label: 'LeetCode Coding Analytics', icon: Code2, highlight: true },
          { id: 'admin-gd', label: 'GD Hub & Placement News', icon: MessagesSquare, highlight: true },
          { id: 'admin-resumes', label: 'Student Resume Bank', icon: FileText },
          { id: 'admin-communication', label: 'AI Communication Lab', icon: Mic },
          { id: 'admin-dept-students', label: 'Eligible Candidates List', icon: Users },
          { id: 'admin-notifications', label: 'Placement Drive Broadcast', icon: Bell },
        ];
      case 'faculty':
        return [
          { id: 'admin-dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { id: 'admin-questions', label: 'Question Bank & Import', icon: FileQuestion, highlight: true },
          { id: 'admin-exams', label: 'My Class Examinations', icon: CalendarCheck },
          { id: 'admin-proctoring', label: 'Live Exam Proctoring', icon: Camera, alert: true },
          { id: 'admin-results', label: 'Student Results & Deficiency', icon: Award },
          { id: 'admin-notes', label: 'Subject Study Notes', icon: BookOpen },
          { id: 'admin-gd', label: 'Group Discussion Hub', icon: MessagesSquare },
          { id: 'admin-notifications', label: 'Class Announcements', icon: Bell },
        ];
      default:
        return studentNavItems;
    }
  };

  const navItems = isStudent ? studentNavItems : getRoleNavItems();

  const getRoleTitle = () => {
    switch (role) {
      case 'super_admin': return 'Super Admin (All Rights)';
      case 'admin': return 'College Administrator';
      case 'principal': return 'Principal Academic Console';
      case 'hod': return 'HOD Department Console';
      case 'cdc': return 'CDC / Placement Cell';
      case 'faculty': return 'Faculty & Staff Console';
      default: return 'Student Academic Portal';
    }
  };

  return (
    <aside
      className={`no-print bg-slate-900 border-r border-slate-800 text-slate-300 w-64 flex-shrink-0 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-200 ${
        isOpen ? 'block' : 'hidden md:flex'
      }`}
    >
      {/* Role Context Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
            {isStudent ? <GraduationCap className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">
              {getRoleTitle()}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
              {currentUser?.name || 'Guest User'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-cyan-400'
                      : item.alert
                      ? 'text-rose-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${
                    isActive ? 'opacity-100' : ''
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>


    </aside>
  );
};
