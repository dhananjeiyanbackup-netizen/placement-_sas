import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  FileText,
  File,
  X,
  CheckCircle,
} from 'lucide-react';
import { store } from '../../services/store';
import { CourseNote } from '../../types';

export const NotesMgmt: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    departmentId: 'dept-csecs',
    departmentName: 'CSE (Cyber Security)',
    year: 'III' as 'I' | 'II' | 'III' | 'IV',
    semester: 5,
    subject: 'Advanced Cryptography & Cyber Defense (CS3501)',
    unit: 1,
    fileType: 'pdf' as 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx',
    fileUrl: 'https://example.com/notes/sample-lecture-material.pdf',
    fileSizeMb: 4.5,
  });

  const notes = store.notes;

  const filteredNotes = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'All' || n.departmentName === selectedDept;
    const matchUnit = selectedUnit === 'All' || n.unit === Number(selectedUnit);
    return matchSearch && matchDept && matchUnit;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.subject.trim()) {
      alert('Title and Subject are required.');
      return;
    }

    store.addNote({
      ...newNote,
      uploadedBy: store.currentUser?.name || 'Faculty Invigilator',
    });

    setShowUploadModal(false);
    setNewNote({
      title: '',
      description: '',
      departmentId: 'dept-csecs',
      departmentName: 'CSE (Cyber Security)',
      year: 'III',
      semester: 5,
      subject: 'Advanced Cryptography & Cyber Defense (CS3501)',
      unit: 1,
      fileType: 'pdf',
      fileUrl: 'https://example.com/notes/sample-lecture-material.pdf',
      fileSizeMb: 4.5,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Course Notes &amp; Syllabus Repository</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {notes.length} Study Materials
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload unit-wise lecture presentations, Anna University question banks, reference guides,
            and laboratory manuals.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Study Material
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by subject or title..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
            <option value="AI & Data Science">AI &amp; Data Science</option>
          </select>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Units</option>
            <option value="1">Unit 1</option>
            <option value="2">Unit 2</option>
            <option value="3">Unit 3</option>
            <option value="4">Unit 4</option>
            <option value="5">Unit 5</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                  {note.fileType} • {note.fileSizeMb} MB
                </span>
                <span className="text-xs font-semibold text-slate-500">Unit {note.unit}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-3 line-clamp-2 leading-snug">
                {note.title}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">{note.subject}</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {note.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="text-[11px] text-slate-400">By {note.uploadedBy}</p>
                <p className="text-[10px] text-slate-400">{note.downloadsCount} Downloads</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    store.incrementNoteDownload(note.id);
                    alert(`Downloading ${note.title}...`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this course note?')) {
                      store.deleteNote(note.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Upload Note */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Upload Course Study Material</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4: Cloud Computing Security Architectures"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newNote.departmentName}
                    onChange={(e) => setNewNote({ ...newNote, departmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                    <option value="AI & Data Science">AI &amp; Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newNote.unit}
                    onChange={(e) => setNewNote({ ...newNote, unit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                <label className="block font-semibold text-slate-700 mb-1">Subject Name &amp; Code</label>
                <input
                  type="text"
                  required
                  value={newNote.subject}
                  onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                  placeholder="Summary of topics covered, syllabus mapping..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Format</label>
                  <select
                    value={newNote.fileType}
                    onChange={(e) => setNewNote({ ...newNote, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold uppercase"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="pptx">PowerPoint (PPTX)</option>
                    <option value="docx">Word (DOCX)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newNote.fileSizeMb}
                    onChange={(e) => setNewNote({ ...newNote, fileSizeMb: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                >
                  Upload &amp; Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
