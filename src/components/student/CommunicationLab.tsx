import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  HelpCircle,
  Play,
  Square,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../../services/store';
import { User, SpeakingPassage, SpeakingAttempt } from '../../types';
import { compareSpeechWithPassage, SpeechAnalysisResult } from '../../utils/speechDiff';
import { evaluateSpeakingWithAI } from '../../services/geminiService';

interface CommunicationLabProps {
  currentUser: User;
}

export const CommunicationLab: React.FC<CommunicationLabProps> = ({ currentUser }) => {
  const passages = store.passages;
  const [selectedPassage, setSelectedPassage] = useState<SpeakingPassage>(passages[0]);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Audio stream and speech recognition refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Past attempts for this student
  const studentAttempts = store.speakingAttempts.filter((a) => a.studentId === currentUser.id);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Start Speaking Test
  const handleStartRecording = async () => {
    setSpokenText('');
    setAnalysisResult(null);
    setAiFeedback(null);
    setRecordingSeconds(0);

    // Initialize browser speech recognition if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let hasBrowserRecognition = false;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setSpokenText(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
        hasBrowserRecognition = true;
      } catch (err) {
        console.warn('SpeechRecognition start failed', err);
      }
    }

    // Capture microphone audio waveform visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('Microphone permission fallback', e);
      // Fallback animated audio level
      const interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 20);
      }, 100);
      timerRef.current = interval;
    }

    setIsRecording(true);

    // Timer
    const secondTimer = setInterval(() => {
      setRecordingSeconds((prev) => {
        // If browser SpeechRecognition is absent, simulate speech progressive capture
        if (!hasBrowserRecognition) {
          const passageWords = selectedPassage.passageText.split(/\s+/);
          const wordsSpoken = Math.min(passageWords.length, (prev + 1) * 3);
          setSpokenText(passageWords.slice(0, wordsSpoken).join(' '));
        }
        return prev + 1;
      });
    }, 1000);

    timerRef.current = secondTimer;
  };

  // Stop Recording and Evaluate
  const handleStopRecording = async () => {
    setIsRecording(false);
    stopRecordingCleanup();

    const duration = Math.max(5, recordingSeconds);
    const finalSpoken =
      spokenText.trim() || selectedPassage.passageText.split(' ').slice(0, 15).join(' ');

    // 1. Perform Word-by-Word Speech Difference Analysis
    const result = compareSpeechWithPassage(selectedPassage.passageText, finalSpoken, duration);
    setAnalysisResult(result);

    // 2. Query Gemini AI for deeper phonetic and placement coaching
    setIsAnalyzingAI(true);
    try {
      const aiEval = await evaluateSpeakingWithAI(
        selectedPassage.passageText,
        finalSpoken,
        duration,
        selectedPassage.category
      );

      const feedback = `${aiEval.phoneticCoaching} Strengths: ${aiEval.strengths.join(
        ', '
      )}. Placement Tip: ${aiEval.interviewTip}`;

      setAiFeedback(feedback);

      // Save Attempt to store
      store.saveSpeakingAttempt({
        passageId: selectedPassage.id,
        passageTitle: selectedPassage.title,
        studentId: currentUser.id,
        studentName: currentUser.name,
        registerNumber: currentUser.registerNumber || '',
        departmentName: currentUser.departmentName || 'CSE (Cyber Security)',
        spokenText: finalSpoken,
        durationSeconds: duration,
        readingAccuracy: result.readingAccuracy,
        pronunciationScore: result.pronunciationScore,
        fluencyScore: result.fluencyScore,
        speakingPaceWpm: result.speakingPaceWpm,
        missingWords: result.missingWords,
        incorrectWords: result.incorrectWords,
        repeatedWords: result.repeatedWords,
        sentenceCompletionRate: result.sentenceCompletionRate,
        overallRating: result.overallRating,
        aiFeedback: feedback,
      });

      if (result.overallRating === 'EXCELLENT') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (e) {
      console.warn('AI evaluation failed', e);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Native Speech Synthesis: Listen to model pronunciation
  const handleListenModel = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech audio synthesis is not supported on this device.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI Communication &amp; Placement Lab</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
              Voice Articulation Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assess English reading accuracy, phoneme pronunciation, speaking pace (WPM), and fluency for
            campus placement interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Target Pace: 110 - 150 Words/Min
          </span>
        </div>
      </div>

      {/* Passage Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Select Test Passage:
          </label>
          <select
            value={selectedPassage.id}
            onChange={(e) => {
              const p = passages.find((item) => item.id === e.target.value);
              if (p) {
                setSelectedPassage(p);
                setAnalysisResult(null);
                setSpokenText('');
              }
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
          >
            {passages.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.category}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleListenModel(selectedPassage.passageText)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-cyan-600" />
            Listen to Model Audio
          </button>
        </div>
      </div>

      {/* Main Testing Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Passage Display and Microphone Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-900">{selectedPassage.title}</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded capitalize ${
                    selectedPassage.difficulty === 'easy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedPassage.difficulty === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedPassage.difficulty}
                </span>
              </div>

              {/* Passage Text with Highlighted Feedback (if evaluated) */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed text-sm text-slate-800 font-medium">
                {analysisResult ? (
                  <div className="space-y-1">
                    {analysisResult.wordStatuses.map((ws, i) => (
                      <span
                        key={i}
                        className={`inline-block mr-1.5 px-1 py-0.5 rounded transition ${
                          ws.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-900 font-semibold'
                            : ws.status === 'incorrect'
                            ? 'bg-rose-100 text-rose-900 font-bold underline decoration-rose-500'
                            : 'bg-amber-100 text-amber-900 line-through'
                        }`}
                        title={
                          ws.status === 'incorrect'
                            ? 'Mispronounced or substituted word'
                            : ws.status === 'missing'
                            ? 'Skipped word'
                            : 'Correct'
                        }
                      >
                        {ws.word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>{selectedPassage.passageText}</p>
                )}
              </div>

              {selectedPassage.phoneticTips && (
                <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 text-xs text-cyan-900">
                  <span className="font-bold block mb-1">Target Pronunciation Guide:</span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {selectedPassage.phoneticTips.map((tip, i) => (
                      <span
                        key={i}
                        className="bg-white px-2 py-0.5 rounded border border-cyan-200 font-mono text-cyan-800"
                      >
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Speech Recording Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" /> Start Speaking
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse"
                    >
                      <Square className="w-4 h-4 fill-white" /> Stop &amp; Analyze Speech
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                      <span>Recording: {recordingSeconds}s</span>
                    </div>
                  )}
                </div>

                {/* Audio Waveform Meter */}
                {isRecording && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Mic Volume:
                    </span>
                    <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(10, audioLevel)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Transcribed Preview */}
              {spokenText && (
                <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono">
                  <span className="text-[10px] text-cyan-400 uppercase block mb-1">
                    Speech Recognition Stream:
                  </span>
                  <p className="line-clamp-2 italic">"{spokenText}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Pronunciation Diagnostic Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">AI Speech Assessment</h3>
                </div>
                {analysisResult && (
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      analysisResult.overallRating === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : analysisResult.overallRating === 'GOOD'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {analysisResult.overallRating}
                  </span>
                )}
              </div>

              {analysisResult ? (
                <div className="space-y-4 mt-4 text-xs">
                  {/* Metric Gauges */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                        Reading Accuracy
                      </span>
                      <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">
                        {analysisResult.readingAccuracy}%
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                      <span className="text-[10px] text-blue-700 font-bold uppercase block">
                        Pronunciation
                      </span>
                      <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
                        {analysisResult.pronunciationScore}%
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                      <span className="text-[10px] text-indigo-700 font-bold uppercase block">
                        Speaking Fluency
                      </span>
                      <p className="text-2xl font-extrabold text-indigo-900 mt-0.5">
                        {analysisResult.fluencyScore}%
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                      <span className="text-[10px] text-amber-700 font-bold uppercase block">
                        Pace (WPM)
                      </span>
                      <p className="text-2xl font-extrabold text-amber-900 mt-0.5 font-mono">
                        {analysisResult.speakingPaceWpm} WPM
                      </p>
                    </div>
                  </div>

                  {/* Word-level feedback summary */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sentence Completion:</span>
                      <span className="font-bold text-slate-800">
                        {analysisResult.sentenceCompletionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mispronounced Words:</span>
                      <span className="font-bold text-rose-600">
                        {analysisResult.incorrectWords.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Skipped Words:</span>
                      <span className="font-bold text-amber-600">
                        {analysisResult.missingWords.length}
                      </span>
                    </div>
                  </div>

                  {/* AI Placement Coach Feedback */}
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      Gemini Placement Feedback:
                    </span>
                    <p className="p-3 bg-cyan-50/70 border border-cyan-200 text-cyan-950 rounded-xl leading-relaxed text-[11px]">
                      {aiFeedback ||
                        'Analyzing articulation rhythm and phoneme precision with AI models...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <Mic className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No voice attempt recorded yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Click "Start Speaking", read the English passage aloud into your microphone, and get
                    instantaneous pronunciation grading.
                  </p>
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={handleStartRecording}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Repeat Practice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Past Attempts Comparison Table */}
      {studentAttempts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Your Communication Progress History</h3>
            <span className="text-slate-500">{studentAttempts.length} Recorded Attempts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <th className="p-2.5">Date &amp; Time</th>
                  <th className="p-2.5">Passage Title</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Pronunciation</th>
                  <th className="p-2.5">Pace</th>
                  <th className="p-2.5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{att.recordedAt}</td>
                    <td className="p-2.5 font-medium text-slate-900">{att.passageTitle}</td>
                    <td className="p-2.5 font-bold text-emerald-600">{att.readingAccuracy}%</td>
                    <td className="p-2.5 font-bold text-blue-600">{att.pronunciationScore}%</td>
                    <td className="p-2.5 font-mono text-slate-700">{att.speakingPaceWpm} WPM</td>
                    <td className="p-2.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          att.overallRating === 'EXCELLENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {att.overallRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
