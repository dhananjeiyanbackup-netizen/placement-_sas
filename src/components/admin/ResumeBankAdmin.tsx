import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Tag,
  Search,
  X,
  FileCheck,
} from 'lucide-react';
import { store } from '../../services/store';
import { ResumeFile } from '../../types';

export const ResumeBankAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newResume, setNewResume] = useState({
    title: '',
    category: 'Cyber Security' as ResumeFile['category'],
    format: 'PDF' as 'PDF' | 'DOCX',
    departmentName: 'CSE (Cyber Security)',
    targetYear: 'IV Year / Campus Placements',
    downloadUrl: 'https://example.com/resumes/sample-model-resume.pdf',
    description: '',
    keyHighlights: '',
  });

  const resumes = store.resumes;

  const filteredResumes = resumes.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleUploadResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResume.title.trim()) {
      alert('Resume title is required.');
      return;
    }

    store.addResume({
      title: newResume.title,
      category: newResume.category,
      format: newResume.format,
      departmentName: newResume.departmentName,
      targetYear: newResume.targetYear,
      downloadUrl: newResume.downloadUrl,
      description: newResume.description,
      keyHighlights: newResume.keyHighlights
        ? newResume.keyHighlights.split(',').map((h) => h.trim())
        : ['ATS formatted', 'Quantified metrics', 'Placement vetted'],
    });

    setShowUploadModal(false);
    setNewResume({
      title: '',
      category: 'Cyber Security',
      format: 'PDF',
      departmentName: 'CSE (Cyber Security)',
      targetYear: 'IV Year / Campus Placements',
      downloadUrl: 'https://example.com/resumes/sample-model-resume.pdf',
      description: '',
      keyHighlights: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Placement Resume Bank Administration</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {resumes.length} Model Resumes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curate industry-vetted ATS resumes across Cyber Security, AI &amp; Data Science, SDE, and
            Fresher formats for students.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Model Resume
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
            placeholder="Search resume templates..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          <option value="Cyber Security">Cyber Security</option>
          <option value="AI and Data Science">AI and Data Science</option>
          <option value="Software Developer">Software Developer</option>
          <option value="Internship Resume">Internship Resume</option>
        </select>
      </div>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResumes.map((res) => (
          <div
            key={res.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {res.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {res.format}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-3">{res.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{res.description}</p>

              {res.keyHighlights && (
                <div className="mt-3 space-y-1">
                  {res.keyHighlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{res.downloadsCount} Downloads</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    store.incrementResumeDownload(res.id);
                    alert(`Downloading ${res.title}...`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this model resume?')) {
                      store.deleteResume(res.id);
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

      {/* Modal: Upload Model Resume */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Upload Placement Model Resume</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resume Template Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC Analyst & Threat Hunter Model Resume"
                  value={newResume.title}
                  onChange={(e) => setNewResume({ ...newResume, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Category</label>
                  <select
                    value={newResume.category}
                    onChange={(e) =>
                      setNewResume({ ...newResume, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="AI and Data Science">AI and Data Science</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Internship Resume">Internship Resume</option>
                    <option value="Fresher Resume">Fresher Resume</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={newResume.format}
                    onChange={(e) =>
                      setNewResume({ ...newResume, format: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX Word</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department &amp; Year</label>
                <input
                  type="text"
                  placeholder="e.g. CSE-CS / AI-DS • IV Year Placements"
                  value={newResume.targetYear}
                  onChange={(e) => setNewResume({ ...newResume, targetYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; ATS Score</label>
                <textarea
                  rows={2}
                  value={newResume.description}
                  onChange={(e) => setNewResume({ ...newResume, description: e.target.value })}
                  placeholder="Optimized for product companies, keywords: SIEM, Snort, Wireshark..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Highlights (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 95+ ATS Score, Clean 1-Page Layout, Verified by Placement Cell"
                  value={newResume.keyHighlights}
                  onChange={(e) => setNewResume({ ...newResume, keyHighlights: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
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
                  Save Model Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
