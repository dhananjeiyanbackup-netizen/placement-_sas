import React, { useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  CheckCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { store } from '../../services/store';
import { User } from '../../types';

interface StudentProfileProps {
  currentUser: User;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ currentUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    setPasswordMsg('Password successfully changed for examination portal.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20">
          {currentUser.name.charAt(0)}
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Enrolled &amp; Active
            </span>
          </div>
          <p className="font-mono text-xs text-blue-700 font-bold">
            Anna University Reg No: {currentUser.registerNumber}
          </p>
          <p className="text-xs text-slate-500">
            {currentUser.departmentName} • Academic Batch {currentUser.batch}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Academic Profile Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Academic Registration</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Degree Program:</span>
              <span className="font-bold text-slate-900">B.E. Computer Science &amp; Eng</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Specialization:</span>
              <span className="font-bold text-slate-900">{currentUser.departmentName}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Year / Semester:</span>
              <span className="font-bold text-slate-900">
                Year {currentUser.year} (Semester 5)
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Class Section:</span>
              <span className="font-bold text-slate-900">Section {currentUser.section}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">University Regulation:</span>
              <span className="font-bold text-slate-900">Anna University R2021</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Portal Attendance Status:</span>
              <span className="font-bold text-emerald-600">96.8% (Eligible for CIA &amp; Semester Exam)</span>
            </div>
          </div>
        </div>

        {/* Contact and Password Reset */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Mail className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Official Contact Information</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institutional Email:</span>
                <span className="font-medium text-slate-800">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student Phone:</span>
                <span className="font-medium text-slate-800">{currentUser.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Security &amp; Exam Portal Password</h3>
            </div>

            {passwordMsg && (
              <p className="text-xs text-emerald-600 font-semibold p-2 bg-emerald-50 rounded-lg">
                {passwordMsg}
              </p>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
