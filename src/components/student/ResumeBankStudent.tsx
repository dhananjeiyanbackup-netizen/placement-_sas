import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  FileCheck,
  Star,
  ExternalLink,
  BookOpen,
  Send,
} from 'lucide-react';
import { store } from '../../services/store';
import { User, ResumeFile } from '../../types';

interface ResumeBankStudentProps {
  currentUser: User;
}

export const ResumeBankStudent: React.FC<ResumeBankStudentProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover_letters' | 'guidelines'>('resumes');
  const resumes = store.resumes;

  const handleDownload = (res: ResumeFile) => {
    store.incrementResumeDownload(res.id);
    alert(`Downloading ${res.title} (${res.format})...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Placement Resume Bank &amp; Career Hub</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Training &amp; Placement Cell
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download ATS-optimized resume templates, explore engineering cover letters, and review
            placement screening benchmarks.
          </p>
        </div>

        <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'resumes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Model Resumes ({resumes.length})
          </button>
          <button
            onClick={() => setActiveTab('cover_letters')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'cover_letters' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sample Cover Letters
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'guidelines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            ATS Guidelines
          </button>
        </div>
      </div>

      {activeTab === 'resumes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((res) => (
            <div
              key={res.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {res.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {res.format}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{res.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{res.description}</p>

                {res.keyHighlights && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-700 text-[11px] block">
                      ATS Verified Features:
                    </span>
                    {res.keyHighlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{res.downloadsCount} Student Downloads</span>
                <button
                  onClick={() => handleDownload(res)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cover_letters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs leading-relaxed">
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Cyber Security Analyst Cover Letter
            </span>
            <h3 className="font-bold text-base text-slate-900">SOC &amp; Threat Intelligence Application</h3>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 font-mono text-[11px] space-y-2 border border-slate-200">
              <p>Dear Hiring Manager,</p>
              <p>
                I am writing to express my eager interest in the Cyber Security Associate position at
                your organization. Currently pursuing my pre-final year at Sasurie College of
                Engineering specializing in Cyber Security, I bring hands-on experience in network
                vulnerability assessments, SIEM telemetry monitoring, and OWASP web defenses.
              </p>
              <p>
                During my continuous internal projects, I built an automated packet sniffer using Python
                and detected anomalous brute-force attempts in a virtualized SOC sandbox. I am eager to
                contribute my analytical problem-solving skills to protect your critical enterprise
                infrastructure.
              </p>
              <p>Sincerely,<br />{currentUser.name}<br />{currentUser.registerNumber}</p>
            </div>
            <button
              onClick={() => alert('Sample Cover Letter copied to clipboard!')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-800 transition"
            >
              Copy Cover Letter Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs leading-relaxed">
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Software Developer / AI Intern Cover Letter
            </span>
            <h3 className="font-bold text-base text-slate-900">SDE &amp; Machine Learning Trainee</h3>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 font-mono text-[11px] space-y-2 border border-slate-200">
              <p>Dear Recruitment Team,</p>
              <p>
                As an aspiring software developer with over 300+ LeetCode problems solved and practical
                experience designing machine learning models at Sasurie College of Engineering, I am
                thrilled to apply for your Software Engineer Internship.
              </p>
              <p>
                My technical foundation includes proficiency in Python, React, and RESTful API
                architecture. I have maintained a 90%+ academic assessment score while leading our
                college hackathon team to build an autonomous student assessment engine.
              </p>
              <p>Sincerely,<br />{currentUser.name}<br />{currentUser.registerNumber}</p>
            </div>
            <button
              onClick={() => alert('Sample Cover Letter copied to clipboard!')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-800 transition"
            >
              Copy Cover Letter Template
            </button>
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs leading-relaxed">
          <h3 className="font-bold text-base text-slate-900">
            Sasurie Training &amp; Placement Cell: ATS Guidelines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">1. Quantify Impact</span>
              <p className="text-emerald-800 text-[11px]">
                Always use numbers: "Optimized SQL query performance by 42%" or "Solved 300+ LeetCode
                algorithmic challenges."
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">2. Standard Headings</span>
              <p className="text-blue-800 text-[11px]">
                Use conventional headers: Education, Technical Skills, Projects, Certifications,
                Achievements. Avoid creative non-standard graphics.
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
              <span className="font-bold text-indigo-900 block">3. Anna Univ Verification</span>
              <p className="text-indigo-800 text-[11px]">
                Explicitly state your 12-digit university register number, degree program, CGPA, and
                expected graduation month (May 2027).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
