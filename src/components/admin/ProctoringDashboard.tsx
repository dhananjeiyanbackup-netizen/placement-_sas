import React, { useState } from 'react';
import {
  Camera,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Clock,
  User,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Users,
  Copy,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { store } from '../../services/store';
import { ProctoringEvent, ViolationType } from '../../types';
import { formatViolationName } from '../../utils/proctoringEngine';

export const ProctoringDashboard: React.FC = () => {
  const [selectedViolationType, setSelectedViolationType] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<ProctoringEvent | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const events = store.proctoringEvents;

  const filteredEvents = events.filter((ev) => {
    const matchType = selectedViolationType === 'All' || ev.violationType === selectedViolationType;
    const matchSev = selectedSeverity === 'All' || ev.severity === selectedSeverity;
    return matchType && matchSev;
  });

  const handleResolveEvent = (id: string) => {
    store.resolveProctoringEvent(id, reviewNote || 'Verified and approved by exam invigilator');
    setSelectedEvent(null);
    setReviewNote('');
  };

  const getViolationIcon = (type: ViolationType) => {
    switch (type) {
      case 'mobile_phone_detected':
        return <Smartphone className="w-4 h-4 text-rose-500" />;
      case 'multiple_faces':
        return <Users className="w-4 h-4 text-rose-500" />;
      case 'tab_switch':
      case 'fullscreen_exit':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'copy_paste_attempt':
        return <Copy className="w-4 h-4 text-blue-500" />;
      case 'right_click_attempt':
        return <MousePointer className="w-4 h-4 text-indigo-500" />;
      default:
        return <Camera className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI Proctoring Surveillance &amp; Audit</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
              {events.filter((e) => !e.resolved).length} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-signal examination surveillance (Face posture, gaze deviation, mobile detection,
            tab loss, browser restrictions).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AI Confidence Threshold: 94%
          </div>
        </div>
      </div>

      {/* Proctoring Rules Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl border border-slate-800 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-bold text-sm text-white">Active Proctoring Policy (3-Strike System)</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              <strong>Warning 1:</strong> Advisory dialog alert • <strong>Warning 2:</strong> High alert final banner •{' '}
              <strong>Warning 3:</strong> Autonomous examination lock, submission, and incident snapshot evidence capture.
            </p>
          </div>
          <div className="text-xs text-slate-300 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
            <span className="block font-semibold text-white">Ethical AI Standards</span>
            <span className="text-[11px] text-slate-300">
              Detections serve as reviewable indicators with manual appeal rights.
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedViolationType}
            onChange={(e) => setSelectedViolationType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Violation Types</option>
            <option value="tab_switch">Tab Switching</option>
            <option value="multiple_faces">Multiple Faces Detected</option>
            <option value="mobile_phone_detected">Mobile Phone Detected</option>
            <option value="face_not_detected">Face Not Detected</option>
            <option value="looking_away">Looking Away Repeatedly</option>
            <option value="copy_paste_attempt">Copy/Paste Attempt</option>
            <option value="fullscreen_exit">Fullscreen Exit</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredEvents.length} of {events.length} logged incidents
        </span>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Student / Reg No</th>
                <th className="p-3.5">Examination</th>
                <th className="p-3.5">Incident Type</th>
                <th className="p-3.5">Warning Count</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Audit Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No proctoring violations recorded for current filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{ev.timestamp}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{ev.studentName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{ev.registerNumber}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 max-w-[200px] truncate">
                      {ev.examName}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {getViolationIcon(ev.violationType)}
                        <span>{formatViolationName(ev.violationType)}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Strike {ev.warningNumber} / 3
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded capitalize ${
                          ev.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : ev.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {ev.resolved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Incident Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Incident Evidence Review</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)}>
                <span className="text-slate-400 hover:text-slate-600 text-lg">&times;</span>
              </button>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              {/* Simulated Camera Snapshot Frame */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 h-44 flex flex-col items-center justify-center text-slate-300">
                <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                  REC CAM #1 • {selectedEvent.timestamp}
                </div>
                <div className="w-24 h-28 border-2 border-dashed border-rose-500 rounded-lg flex flex-col items-center justify-center p-2 text-center bg-rose-500/10">
                  <User className="w-10 h-10 text-rose-300 mb-1" />
                  <span className="text-[9px] font-mono text-rose-300">
                    {formatViolationName(selectedEvent.violationType)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">
                  Captured AI Telemetry Evidence Snapshot
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Student</span>
                  <span className="font-semibold text-slate-900">{selectedEvent.studentName}</span>
                  <span className="block font-mono text-[11px] text-slate-500">
                    {selectedEvent.registerNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Incident</span>
                  <span className="font-semibold text-rose-700">
                    {formatViolationName(selectedEvent.violationType)}
                  </span>
                  <span className="block text-[11px] text-slate-600">
                    Strike {selectedEvent.warningNumber} of 3
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invigilator / HOD Resolution Remarks:
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified legitimate network notification popup, cleared after student statement."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveEvent(selectedEvent.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Mark Certified &amp; Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
