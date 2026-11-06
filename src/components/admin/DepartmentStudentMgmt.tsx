import React, { useState } from 'react';
import {
  Users,
  Building2,
  Plus,
  Upload,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  KeyRound,
  X,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  UserPlus,
  Shield,
  Edit3,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { store } from '../../services/store';
import { User, UserRole, Department, AcademicBatch } from '../../types';

export const DepartmentStudentMgmt: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'students' | 'departments'>('staff');

  // Staff Management State
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('All');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffRoleModal, setShowEditStaffRoleModal] = useState(false);
  const [selectedStaffForRoleEdit, setSelectedStaffForRoleEdit] = useState<User | null>(null);
  const [updatedRole, setUpdatedRole] = useState<UserRole>('faculty');
  const [updatedDesignation, setUpdatedDesignation] = useState('');

  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    password: 'SAS@123',
    email: '',
    role: 'faculty' as UserRole,
    designation: 'Assistant Professor',
    departmentName: 'CSE (Cyber Security)',
    employeeId: '',
    phone: '',
  });

  // Student Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Form states for new student
  const [newStudent, setNewStudent] = useState({
    name: '',
    registerNumber: '',
    email: '',
    departmentName: 'CSE (Cyber Security)',
    year: 'III' as 'I' | 'II' | 'III' | 'IV',
    section: 'A' as 'A' | 'B' | 'C',
    batch: '2023-2027',
    phone: '',
  });

  // Bulk upload preview state
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Department state
  const [newDept, setNewDept] = useState({
    code: '',
    name: '',
    hodName: '',
    hodEmail: '',
    establishedYear: 2024,
  });

  const allUsers = store.users;
  const staffMembers = allUsers.filter((u) => u.role !== 'student');
  const students = allUsers.filter((u) => u.role === 'student');
  const departments = store.departments;

  // Filter staff members
  const filteredStaff = staffMembers.filter((staff) => {
    const matchSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (staff.username || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
      (staff.email || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
      (staff.designation || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
      (staff.employeeId || '').toLowerCase().includes(staffSearch.toLowerCase());

    const matchRole = staffRoleFilter === 'All' || staff.role === staffRoleFilter;
    const matchDept =
      staffDeptFilter === 'All' ||
      staff.departmentName === staffDeptFilter ||
      (staffDeptFilter === 'Central Administration' && !staff.departmentName);

    return matchSearch && matchRole && matchDept;
  });

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stu.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'All' || stu.departmentName === selectedDept;
    const matchYear = selectedYear === 'All' || stu.year === selectedYear;
    const matchSec = selectedSection === 'All' || stu.section === selectedSection;

    return matchSearch && matchDept && matchYear && matchSec;
  });

  // Add Staff Member handler
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.username.trim()) {
      alert('Staff Name and Username are mandatory.');
      return;
    }

    const created = store.addUser({
      name: newStaff.name.trim(),
      username: newStaff.username.trim().toLowerCase(),
      password: newStaff.password.trim() || 'SAS@123',
      email: newStaff.email.trim() || `${newStaff.username.trim().toLowerCase()}@sasurie.edu.in`,
      role: newStaff.role,
      designation: newStaff.designation.trim() || getRoleDefaultDesignation(newStaff.role),
      departmentName: newStaff.role === 'principal' || newStaff.role === 'super_admin' || newStaff.role === 'admin'
        ? 'Central Administration'
        : newStaff.departmentName,
      employeeId: newStaff.employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      phone: newStaff.phone.trim(),
      status: 'active',
    });

    alert(`Successfully registered ${created.name} as ${getRoleLabel(created.role)}!`);
    setShowAddStaffModal(false);
    setNewStaff({
      name: '',
      username: '',
      password: 'SAS@123',
      email: '',
      role: 'faculty',
      designation: 'Assistant Professor',
      departmentName: 'CSE (Cyber Security)',
      employeeId: '',
      phone: '',
    });
  };

  // Open Edit Role modal
  const openEditRoleModal = (staff: User) => {
    setSelectedStaffForRoleEdit(staff);
    setUpdatedRole(staff.role);
    setUpdatedDesignation(staff.designation || getRoleDefaultDesignation(staff.role));
    setShowEditStaffRoleModal(true);
  };

  // Save updated role
  const handleSaveUpdatedRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForRoleEdit) return;

    store.updateUserRole(selectedStaffForRoleEdit.id, updatedRole, updatedDesignation);
    alert(`Role updated! ${selectedStaffForRoleEdit.name} is now ${getRoleLabel(updatedRole)}.`);
    setShowEditStaffRoleModal(false);
    setSelectedStaffForRoleEdit(null);
  };

  const getRoleDefaultDesignation = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Chief Technology Officer / Trustee';
      case 'admin': return 'Academic Dean / Administrator';
      case 'principal': return 'Principal & Academic Head';
      case 'hod': return 'Professor & Head of Department';
      case 'cdc': return 'Training & Placement Officer (TPO)';
      case 'faculty': return 'Assistant Professor';
      default: return 'Student';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin (All Rights)';
      case 'admin': return 'Campus Admin';
      case 'principal': return 'Principal';
      case 'hod': return 'HOD / Dept Head';
      case 'cdc': return 'CDC / Placement Officer';
      case 'faculty': return 'Faculty / Staff';
      case 'student': return 'Student';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-indigo-950 text-indigo-300 border border-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><Shield className="w-3 h-3 text-indigo-400" /> Super Admin</span>;
      case 'admin':
        return <span className="bg-blue-950 text-blue-300 border border-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-400" /> Admin</span>;
      case 'principal':
        return <span className="bg-purple-950 text-purple-300 border border-purple-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><Building2 className="w-3 h-3 text-purple-400" /> Principal</span>;
      case 'hod':
        return <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><GraduationCap className="w-3 h-3 text-cyan-400" /> HOD</span>;
      case 'cdc':
        return <span className="bg-amber-950 text-amber-300 border border-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><Briefcase className="w-3 h-3 text-amber-400" /> CDC Placement</span>;
      case 'faculty':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"><Users className="w-3 h-3 text-emerald-400" /> Faculty</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">Student</span>;
    }
  };

  // Add individual student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.registerNumber) {
      alert('Name and Register Number are required.');
      return;
    }

    store.addUser({
      name: newStudent.name,
      registerNumber: newStudent.registerNumber,
      email: newStudent.email || `${newStudent.registerNumber}@sasurie.edu.in`,
      role: 'student',
      departmentName: newStudent.departmentName,
      year: newStudent.year,
      section: newStudent.section,
      batch: newStudent.batch,
      phone: newStudent.phone,
      status: 'active',
    });

    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      registerNumber: '',
      email: '',
      departmentName: 'CSE (Cyber Security)',
      year: 'III',
      section: 'A',
      batch: '2023-2027',
      phone: '',
    });
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.code || !newDept.name) {
      alert('Department Code and Name are required.');
      return;
    }
    store.addDepartment({
      code: newDept.code,
      name: newDept.name,
      hodName: newDept.hodName || 'Dr. HOD',
      hodEmail: newDept.hodEmail || 'hod@sasurie.edu.in',
      totalStudents: 0,
      totalFaculty: 0,
      establishedYear: Number(newDept.establishedYear),
    });
    setShowAddDeptModal(false);
    setNewDept({ code: '', name: '', hodName: '', hodEmail: '', establishedYear: 2024 });
  };

  // Excel File Parsing for bulk upload
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

        const normalized = jsonData.map((row) => ({
          registerNumber: String(row['Register Number'] || row['regNo'] || row['RegisterNumber'] || ''),
          name: String(row['Student Name'] || row['Name'] || ''),
          email: String(row['Email'] || ''),
          departmentName: String(row['Department'] || 'CSE (Cyber Security)'),
          year: String(row['Year'] || 'III') as any,
          section: String(row['Section'] || 'A') as any,
          batch: String(row['Batch'] || '2023-2027'),
          phone: String(row['Phone'] || ''),
        }));

        const validRows = normalized.filter((r) => r.registerNumber && r.name);
        if (validRows.length === 0) {
          setUploadError(
            'Missing required columns. Please ensure columns include "Register Number", "Student Name", "Department", "Year", "Section".'
          );
          return;
        }

        setParsedStudents(validRows);
      } catch (err: any) {
        setUploadError(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmBulkUpload = () => {
    if (parsedStudents.length === 0) return;
    const addedCount = store.bulkAddStudents(
      parsedStudents.map((s) => ({
        ...s,
        role: 'student' as const,
        status: 'active' as const,
      }))
    );
    alert(`Successfully imported ${addedCount} student accounts into the registry.`);
    setShowBulkUploadModal(false);
    setParsedStudents([]);
  };

  const handleExportStudents = () => {
    const exportData = filteredStudents.map((stu) => ({
      'Register Number': stu.registerNumber,
      'Student Name': stu.name,
      'Institutional Email': stu.email,
      Department: stu.departmentName,
      Year: stu.year,
      Section: stu.section,
      Batch: stu.batch,
      Phone: stu.phone || '',
      Status: stu.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `Sasurie_Students_${selectedDept}_${selectedYear}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Institutional Governance &amp; User Registry</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, assign, and manage institutional staff roles (Principal, HOD, CDC, Faculty, Admin) and enroll students.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {activeSubTab === 'staff' && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Add Faculty / Staff &amp; Assign Role
            </button>
          )}

          {activeSubTab === 'students' && (
            <>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk Excel Upload
              </button>
              <button
                onClick={handleExportStudents}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Students
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Student
              </button>
            </>
          )}

          {activeSubTab === 'departments' && (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              New Department
            </button>
          )}
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'staff'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          Faculty &amp; Staff Role Governance ({staffMembers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'students'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Student Registry &amp; Batches ({students.length})
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'departments'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          Academic Departments ({departments.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: FACULTY & STAFF ROLE GOVERNANCE               */}
      {/* ========================================================= */}
      {activeSubTab === 'staff' && (
        <div className="space-y-4">

          {/* Filters for Staff */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff by name, username, emp ID..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              {/* Role Filter */}
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="principal">Principal</option>
                <option value="hod">HOD</option>
                <option value="cdc">CDC / Placement</option>
                <option value="faculty">Faculty</option>
              </select>

              {/* Department Filter */}
              <select
                value={staffDeptFilter}
                onChange={(e) => setStaffDeptFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Departments</option>
                <option value="Central Administration">Central Administration</option>
                <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                <option value="AI & Data Science">AI &amp; Data Science</option>
                <option value="Computer Science and Engineering">CSE</option>
                <option value="Electronics and Communication Engineering">ECE</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Staff Name &amp; Designation</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Login Username</th>
                    <th className="p-3.5">Employee ID</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Role Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No faculty or administrative staff found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 text-sm">{staff.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {staff.designation || getRoleDefaultDesignation(staff.role)}
                          </p>
                          <p className="text-[11px] text-slate-400">{staff.email}</p>
                        </td>
                        <td className="p-3.5">{getRoleBadge(staff.role)}</td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {staff.departmentName || 'Central Administration'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                            {staff.username || staff.email.split('@')[0]}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {staff.employeeId || 'EMP-SCE'}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => store.toggleUserStatus(staff.id)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                              staff.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {staff.status === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Fix / Change Role Button */}
                          <button
                            onClick={() => openEditRoleModal(staff)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition border border-indigo-200"
                            title="Fix / Change Role & Designation"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Fix Role
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              const newPass = prompt(`Reset password for ${staff.name}:`, 'SAS@123');
                              if (newPass) {
                                alert(`Password successfully reset for ${staff.name} to ${newPass}`);
                              }
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete Staff */}
                          {staff.role !== 'super_admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove staff record for ${staff.name}?`)) {
                                  store.deleteUser(staff.id);
                                }
                              }}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: STUDENT REGISTRY & BATCH ENROLLMENT            */}
      {/* ========================================================= */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Register No or Name..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                <option value="AI & Data Science">AI &amp; Data Science</option>
                <option value="Computer Science and Engineering">CSE</option>
                <option value="Electronics and Communication Engineering">ECE</option>
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Years</option>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Register Number</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Year / Sec</th>
                    <th className="p-3.5">Academic Batch</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5 font-mono font-semibold text-slate-900">
                          {stu.registerNumber}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{stu.name}</p>
                          <p className="text-[11px] text-slate-400">{stu.email}</p>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">{stu.departmentName}</td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          Year {stu.year} - Sec {stu.section}
                        </td>
                        <td className="p-3.5 text-slate-500">{stu.batch}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => store.toggleUserStatus(stu.id)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                              stu.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {stu.status === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              const newPass = prompt(`Reset password for ${stu.name}:`, 'SAS@123');
                              if (newPass) alert(`Password successfully updated for ${stu.registerNumber}`);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove student ${stu.name} (${stu.registerNumber})?`)) {
                                store.deleteUser(stu.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ACADEMIC DEPARTMENTS                           */}
      {/* ========================================================= */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {dept.code}
                  </span>
                  <span className="text-[11px] text-slate-400">Est. {dept.establishedYear}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{dept.name}</h4>
                <p className="text-xs text-slate-500 mt-1">HOD: {dept.hodName}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{dept.totalStudents} Students</span>
                  <span>{dept.totalFaculty} Faculty</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD FACULTY / STAFF MEMBER & ASSIGN ROLE           */}
      {/* ========================================================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Add Staff Member &amp; Assign Role</h3>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Senthilkumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Institutional Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setNewStaff({
                        ...newStaff,
                        role: r,
                        designation: getRoleDefaultDesignation(r),
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-indigo-900 bg-indigo-50/50"
                  >
                    <option value="super_admin">Super Admin (All Rights)</option>
                    <option value="admin">Admin</option>
                    <option value="principal">Principal</option>
                    <option value="hod">HOD (Department Head)</option>
                    <option value="cdc">CDC (Placement Officer)</option>
                    <option value="faculty">Faculty / Teaching Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Professor & Head"
                    value={newStaff.designation}
                    onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hod.csecs or ramesh"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newStaff.departmentName}
                  onChange={(e) => setNewStaff({ ...newStaff, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Central Administration">Central Administration</option>
                  <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                  <option value="AI & Data Science">AI &amp; Data Science</option>
                  <option value="Computer Science and Engineering">CSE</option>
                  <option value="Electronics and Communication Engineering">ECE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    placeholder="staff@sasurie.edu.in"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-1044"
                    value={newStaff.employeeId}
                    onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Create Staff &amp; Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FIX / EDIT STAFF ROLE                              */}
      {/* ========================================================= */}
      {showEditStaffRoleModal && selectedStaffForRoleEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Fix / Change Staff Role</h3>
              </div>
              <button
                onClick={() => setShowEditStaffRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdatedRole} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{selectedStaffForRoleEdit.name}</p>
                <p className="text-[11px] text-slate-500">
                  Current Role: <span className="font-semibold text-indigo-700 capitalize">{selectedStaffForRoleEdit.role}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedStaffForRoleEdit.username || selectedStaffForRoleEdit.email}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Institutional Role *</label>
                <select
                  value={updatedRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setUpdatedRole(r);
                    setUpdatedDesignation(getRoleDefaultDesignation(r));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-900 bg-indigo-50/40"
                >
                  <option value="super_admin">Super Admin (All Rights)</option>
                  <option value="admin">Admin</option>
                  <option value="principal">Principal</option>
                  <option value="hod">HOD (Department Head)</option>
                  <option value="cdc">CDC (Placement Officer)</option>
                  <option value="faculty">Faculty / Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Designation</label>
                <input
                  type="text"
                  required
                  value={updatedDesignation}
                  onChange={(e) => setUpdatedDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditStaffRoleModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Save &amp; Apply Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD INDIVIDUAL STUDENT                             */}
      {/* ========================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Enroll Individual Student</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Anand Kumar R"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Register Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.registerNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                    placeholder="e.g. 732422104044"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@sasurie.edu.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newStudent.departmentName}
                  onChange={(e) => setNewStudent({ ...newStudent, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                  <option value="AI & Data Science">AI &amp; Data Science</option>
                  <option value="Computer Science and Engineering">CSE</option>
                  <option value="Electronics and Communication Engineering">ECE</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch</label>
                  <input
                    type="text"
                    value={newStudent.batch}
                    onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                    placeholder="2023-2027"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BULK EXCEL UPLOAD                                  */}
      {/* ========================================================= */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Bulk Upload Students via Excel</h3>
              </div>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl my-4 text-xs text-blue-900 space-y-1">
              <p className="font-semibold">Supported Excel Columns:</p>
              <p className="text-[11px] text-blue-700">
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Register Number</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Student Name</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Department</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Year</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Section</code>,{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Batch</code>.
              </p>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer relative bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Click to browse or drag and drop your .xlsx or .xls file
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Preview Table */}
            {parsedStudents.length > 0 && (
              <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Previewing {parsedStudents.length} records ready to import:
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Validated Clean</span>
                </div>
                <div className="overflow-y-auto max-h-48 border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Reg No</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Dept</th>
                        <th className="p-2">Year</th>
                        <th className="p-2">Sec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedStudents.slice(0, 8).map((stu, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono font-semibold">{stu.registerNumber}</td>
                          <td className="p-2 font-medium">{stu.name}</td>
                          <td className="p-2 text-slate-600">{stu.departmentName}</td>
                          <td className="p-2">{stu.year}</td>
                          <td className="p-2">{stu.section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setParsedStudents([]);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedStudents.length === 0}
                onClick={confirmBulkUpload}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Confirm &amp; Import ({parsedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEW DEPARTMENT                                     */}
      {/* ========================================================= */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Academic Department</h3>
              <button onClick={() => setShowAddDeptModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MECH or IT"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="Dr. Full Name"
                  value={newDept.hodName}
                  onChange={(e) => setNewDept({ ...newDept, hodName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
