import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Search,
  Filter,
  FileText,
  File,
  Eye,
  CheckCircle,
  X,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, CourseNote } from '../../types';

interface NotesLibraryProps {
  currentUser: User;
}

export const NotesLibrary: React.FC<NotesLibraryProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [selectedNote, setSelectedNote] = useState<CourseNote | null>(null);

  const notes = store.notes;

  const filteredNotes = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUnit = selectedUnit === 'All' || n.unit === Number(selectedUnit);
    return matchSearch && matchUnit;
  });

  const handleDownload = (note: CourseNote) => {
    store.incrementNoteDownload(note.id);
    alert(`Downloading ${note.title} (${note.fileSizeMb} MB)...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Student Study Materials &amp; Notes Library</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {filteredNotes.length} Materials
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download authorized lecture slides, unit question banks, and Anna University syllabus notes
            uploaded by your faculty.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by subject or unit..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Units (1-5)</option>
          <option value="1">Unit 1</option>
          <option value="2">Unit 2</option>
          <option value="3">Unit 3</option>
          <option value="4">Unit 4</option>
          <option value="5">Unit 5</option>
        </select>
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
              <span className="text-[11px] text-slate-400">By {note.uploadedBy}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedNote(note)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(note)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Preview Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Study Material Overview</h3>
              <button onClick={() => setSelectedNote(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-blue-600 font-bold uppercase">
                  {selectedNote.fileType.toUpperCase()} Document ({selectedNote.fileSizeMb} MB)
                </span>
                <p className="text-sm font-bold text-slate-900">{selectedNote.title}</p>
                <p className="text-slate-600 font-medium">{selectedNote.subject}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Topics &amp; Syllabus Coverage:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedNote.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2">
                <div>Uploaded By: <strong>{selectedNote.uploadedBy}</strong></div>
                <div>Department: <strong>{selectedNote.departmentName}</strong></div>
                <div>Total Downloads: <strong>{selectedNote.downloadsCount}</strong></div>
                <div>Uploaded Date: <strong>{selectedNote.uploadedAt}</strong></div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNote(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(selectedNote);
                    setSelectedNote(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
