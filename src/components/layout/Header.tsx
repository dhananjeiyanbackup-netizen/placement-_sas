import React, { useState } from 'react';
import {
  Bell,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  LogOut,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { store } from '../../services/store';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSelectRole: (role: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onSelectRole,
  activeTab,
  setActiveTab,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = store.notifications;
  const unreadCount = currentUser
    ? notifications.filter((n) => !n.readBy.includes(currentUser.id)).length
    : 0;

  const handleRoleQuickSwitch = (role: 'super_admin' | 'admin' | 'principal' | 'hod' | 'cdc' | 'faculty' | 'student') => {
    let target = store.users.find((u) => u.role === role);
    if (!target) {
      target = store.users[0];
    }
    store.setCurrentUser(target);
    setShowRoleSwitcher(false);
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      notifications.forEach((n) => store.markNotificationAsRead(n.id, currentUser.id));
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 text-xs px-2.5 py-1 rounded-full font-semibold">Super Admin (All Rights)</span>;
      case 'admin':
        return <span className="bg-blue-900/80 text-blue-200 border border-blue-700/60 text-xs px-2.5 py-1 rounded-full font-semibold">Admin</span>;
      case 'principal':
        return <span className="bg-purple-900/80 text-purple-200 border border-purple-700/60 text-xs px-2.5 py-1 rounded-full font-semibold">Principal</span>;
      case 'hod':
        return <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs px-2.5 py-1 rounded-full font-semibold">HOD</span>;
      case 'cdc':
        return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">CDC / Placement</span>;
      case 'faculty':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Faculty / Staff</span>;
      case 'student':
        return <span className="bg-sky-950 text-sky-300 border border-sky-800 text-xs px-2.5 py-1 rounded-full font-semibold">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Brand */}
          <div className="flex items-center gap-2.5">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  SASURIE
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  EXAM &amp; SKILL HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider hidden sm:block uppercase">
                Sasurie College of Engineering • CSE-CS &amp; AI-DS
              </p>
            </div>
          </div>

          {/* Center: Institutional Role Quick Switcher */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-[11px] font-medium text-slate-400 px-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Switch Role:
            </span>
            <button
              onClick={() => handleRoleQuickSwitch('super_admin')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'super_admin'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('admin')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('principal')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'principal'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              Principal
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('hod')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'hod'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              HOD
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('cdc')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'cdc'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              CDC
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('faculty')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'faculty'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('student')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                currentUser?.role === 'student'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              Student
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-slate-400 hover:text-blue-400 transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">No notifications</div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-800/50 transition cursor-pointer ${
                            currentUser && !n.readBy.includes(currentUser.id)
                              ? 'bg-blue-950/20'
                              : ''
                          }`}
                          onClick={() => {
                            if (currentUser) {
                              store.markNotificationAsRead(n.id, currentUser.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-xs text-white leading-snug">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {n.createdAt.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>From: {n.senderName}</span>
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {n.type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {currentUser.role === 'student'
                        ? currentUser.registerNumber
                        : currentUser.departmentName || 'Admin'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2">
                    <div className="p-2 border-b border-slate-800">
                      <p className="font-semibold text-sm text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-400">{currentUser.email}</p>
                      <div className="mt-2">{getRoleBadge(currentUser.role)}</div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/60 p-1.5 rounded-lg border border-amber-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Firestore: glossy-cycle-zt8c4</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'student' && (
                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Student Profile
                        </button>
                      )}

                      <button
                        onClick={() => {
                          store.clearDummyData();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Purge Dummy Data (Clean DB)
                      </button>

                      <button
                        onClick={() => {
                          store.syncToFirestore();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-md flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sync to Firebase Firestore
                      </button>

                      <button
                        onClick={() => {
                          store.resetToDemo();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-md flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset All Demo Data
                      </button>

                      <button
                        onClick={() => {
                          onOpenAuth();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Switch / Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
