import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  GraduationCap,
  Shield,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regNo.trim()) {
      setError('Please enter your 12-digit Register Number.');
      return;
    }

    const ok = store.loginWithRegisterNumber(regNo);
    if (ok && store.currentUser) {
      onSuccess(store.currentUser);
      onClose();
    } else {
      setError(`Invalid Register Number or inactive account. Try demo: 732422104001`);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your username (e.g. siperadmin) or institutional email.');
      return;
    }

    const ok = store.loginWithCredentials(email, password);
    if (ok && store.currentUser) {
      onSuccess(store.currentUser);
      onClose();
    } else {
      setError('Invalid credentials. Super Admin username: "siperadmin" and password: "SAS@123"');
    }
  };

  const handleDemoSelect = (user: User) => {
    store.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 border-b border-slate-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">SASURIE EXAM &amp; SKILL HUB</h2>
              <p className="text-xs text-blue-200/80">Sasurie College of Engineering Portal Login</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-slate-950/40 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              Leadership &amp; Staff Login
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University Register Number (12 Digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. 732422104001"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-slate-400">Anna Univ</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password / DOB</label>
                  <span className="text-[11px] text-blue-400 cursor-pointer hover:underline">
                    Default: SAS@123
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="SAS@123"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Sign In to Student Examination Hub
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institutional Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="siperadmin / admin / principal / hod / cdc / faculty"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                <p className="text-[10px] text-blue-400 mt-1">
                  Super Admin Username: <code className="bg-slate-800 px-1 rounded text-amber-300">siperadmin</code>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <span className="text-[10px] text-slate-400">
                    Master Password: <code className="text-amber-300">SAS@123</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="SAS@123"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Sign In to Leadership &amp; Staff Console
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Personas (1-Click Login for All Roles) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Institutional Role Logins:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Password: SAS@123</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* 1. Super Admin */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'super_admin') || store.users[0])}
                className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Super Admin</span>
                  <span className="text-[9px] bg-purple-900 px-1 rounded text-purple-200">siperadmin</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Er. A. M. Kandaswami</p>
              </button>

              {/* 2. Admin */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'admin') || store.users[1])}
                className="p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-700/50 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Admin (COE)</span>
                  <span className="text-[9px] bg-indigo-900 px-1 rounded text-indigo-200">admin</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Dr. P. Sasikumar</p>
              </button>

              {/* 3. Principal */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'principal') || store.users[2])}
                className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/50 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Principal</span>
                  <span className="text-[9px] bg-amber-900 px-1 rounded text-amber-200">principal</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Dr. M. S. Balamurugan</p>
              </button>

              {/* 4. HOD */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'hod') || store.users[3])}
                className="p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/50 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">HOD (CSE-CS)</span>
                  <span className="text-[9px] bg-cyan-900 px-1 rounded text-cyan-200">hod.csecs</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Dr. K. Senthilkumar</p>
              </button>

              {/* 5. CDC */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'cdc') || store.users[4])}
                className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">CDC / Placement</span>
                  <span className="text-[9px] bg-emerald-900 px-1 rounded text-emerald-200">cdc</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">Prof. V. Karthikeyan</p>
              </button>

              {/* 6. Faculty / Staff */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'faculty') || store.users[5])}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Faculty / Staff</span>
                  <span className="text-[9px] bg-slate-700 px-1 rounded text-slate-300">faculty</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">Prof. S. Ramesh</p>
              </button>

              {/* 7. Student */}
              <button
                type="button"
                onClick={() => handleDemoSelect(store.users.find((u) => u.role === 'student') || store.users[6])}
                className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-700/50 text-left transition sm:col-span-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">Student Portal</span>
                  <span className="text-[9px] bg-blue-800 px-1 rounded text-blue-200">732422104001</span>
                </div>
                <p className="text-[10px] text-blue-200/70 truncate mt-0.5">Dhanush R (III Year CSE-CS)</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
