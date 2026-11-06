import React, { useState } from 'react';
import {
  MessagesSquare,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Newspaper,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
  CheckCircle2,
  XCircle,
  Mic,
  MicOff,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  BookOpen,
  Volume2,
  Filter,
  Check,
} from 'lucide-react';
import { store } from '../../services/store';
import { GDTopic, GDCategory, User } from '../../types';

interface GDHubProps {
  currentUser: User | null;
}

export const GDHub: React.FC<GDHubProps> = ({ currentUser }) => {
  const isAdmin = currentUser?.role !== 'student';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<GDTopic | null>(null);

  // Admin Topic Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GDCategory>('AI & Tech Ethics');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsSource, setNewsSource] = useState('');
  const [trending, setTrending] = useState(true);
  const [pointsForText, setPointsForText] = useState('');
  const [pointsAgainstText, setPointsAgainstText] = useState('');
  const [statisticsText, setStatisticsText] = useState('');
  const [dosAndDontsText, setDosAndDontsText] = useState('');
  const [starterPhrasesText, setStarterPhrasesText] = useState('');

  // Speech Practice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSpeech, setRecordedSpeech] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speechTimer, setSpeechTimer] = useState(0);

  const categories: ('All' | GDCategory)[] = [
    'All',
    'AI & Tech Ethics',
    'Current Affairs',
    'Placement Hot Topics',
    'Business & Economy',
    'Social Issues',
  ];

  const topics = store.gdTopics;

  const filteredTopics = topics.filter((t) => {
    const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.newsSummary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingTopicId(null);
    setTitle('');
    setCategory('AI & Tech Ethics');
    setNewsSummary('');
    setNewsSource('The Hindu / TechCircle');
    setTrending(true);
    setPointsForText('Point 1\nPoint 2\nPoint 3');
    setPointsAgainstText('Counterpoint 1\nCounterpoint 2');
    setStatisticsText('Key metric or survey finding...');
    setDosAndDontsText('DO acknowledge others respectfully\nDO NOT interrupt aggressively');
    setStarterPhrasesText('Good morning peers, starting with the latest data...');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (t: GDTopic) => {
    setEditingTopicId(t.id);
    setTitle(t.title);
    setCategory(t.category);
    setNewsSummary(t.newsSummary);
    setNewsSource(t.newsSource || '');
    setTrending(!!t.trending);
    setPointsForText(t.pointsFor.join('\n'));
    setPointsAgainstText(t.pointsAgainst.join('\n'));
    setStatisticsText(t.statistics.join('\n'));
    setDosAndDontsText(t.dosAndDonts.join('\n'));
    setStarterPhrasesText(t.starterPhrases.join('\n'));
    setIsEditModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !newsSummary.trim()) return;

    const pointsFor = pointsForText.split('\n').map((s) => s.trim()).filter(Boolean);
    const pointsAgainst = pointsAgainstText.split('\n').map((s) => s.trim()).filter(Boolean);
    const statistics = statisticsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const dosAndDonts = dosAndDontsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const starterPhrases = starterPhrasesText.split('\n').map((s) => s.trim()).filter(Boolean);

    if (editingTopicId) {
      store.updateGDTopic(editingTopicId, {
        title,
        category,
        newsSummary,
        newsSource,
        trending,
        pointsFor,
        pointsAgainst,
        statistics,
        dosAndDonts,
        starterPhrases,
      });
    } else {
      store.addGDTopic({
        title,
        category,
        newsSummary,
        newsSource,
        trending,
        authorName: currentUser?.name || 'Department Admin',
        pointsFor,
        pointsAgainst,
        statistics,
        dosAndDonts,
        starterPhrases,
      });
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteTopic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this GD topic?')) {
      store.deleteGDTopic(id);
      if (selectedTopic?.id === id) {
        setSelectedTopic(null);
      }
    }
  };

  // Speech practice recorder
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Generate AI evaluation
      const wordsCount = recordedSpeech.split(' ').filter(Boolean).length;
      const paceWpm = Math.round((wordsCount / Math.max(speechTimer, 5)) * 60);
      let feedback = `Your recorded pitch contains ${wordsCount} words at an estimated pace of ${paceWpm} WPM. `;
      if (paceWpm >= 110 && paceWpm <= 150) {
        feedback += 'Pacing is professional and balanced! Strong placement delivery.';
      } else if (paceWpm < 110) {
        feedback += 'Consider speaking with slightly more momentum to project confidence.';
      } else {
        feedback += 'You are speaking slightly fast; pause briefly after quoting key statistics.';
      }
      setSpeechFeedback(feedback);
    } else {
      setRecordedSpeech('');
      setSpeechFeedback(null);
      setSpeechTimer(0);
      setIsRecording(true);

      // Default sample voice transcription starter
      const sampleIntro = selectedTopic?.starterPhrases[0] || 'Respected moderator and peers, regarding the current topic...';
      setRecordedSpeech(sampleIntro);

      const interval = setInterval(() => {
        setSpeechTimer((prev) => {
          if (prev >= 60) {
            clearInterval(interval);
            setIsRecording(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Group Discussion (GD) &amp; Corporate News Hub
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Placement Prep 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated discussion topics, breaking industry news, structured pros &amp; cons, quotable
              statistics, and voice pitch practice.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add GD Topic &amp; News
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search GD topics, news..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {topic.category}
                </span>
                {topic.trending && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition leading-snug">
                {topic.title}
              </h3>

              {/* News Snippet */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
                  <Newspaper className="w-3.5 h-3.5 text-blue-600" />
                  <span>Latest News / Case Context:</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                  {topic.newsSummary}
                </p>
                {topic.newsSource && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Source: {topic.newsSource}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Meta & Action */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {topic.publishedDate}
              </span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(topic);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTopic(topic.id, e)}
                      className="p-1 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition inline-flex items-center gap-0.5">
                  View Blueprint &rarr;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Topic Detailed Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedTopic.category}
                  </span>
                  <span className="text-xs text-slate-400">Published: {selectedTopic.publishedDate}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedTopic.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {/* News & Editorial Context */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5 text-blue-900 font-bold text-xs">
                <Newspaper className="w-4 h-4 text-blue-700" />
                <span>Editorial Case Background &amp; Recent Developments</span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">{selectedTopic.newsSummary}</p>
              {selectedTopic.newsSource && (
                <p className="text-[11px] text-blue-700 mt-1 font-mono">
                  Verified Reference: {selectedTopic.newsSource}
                </p>
              )}
            </div>

            {/* Pros and Cons 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arguments FOR */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 mb-2.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" /> Arguments &amp; Supporting Points (FOR)
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950">
                  {selectedTopic.pointsFor.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arguments AGAINST */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5 mb-2.5">
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-700" /> Counter-Arguments &amp; Concerns (AGAINST)
                </h4>
                <ul className="space-y-2 text-xs text-rose-950">
                  {selectedTopic.pointsAgainst.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Statistics & Quotable Numbers */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-2">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" /> Quotable Industry Statistics (To Impress Interviewers)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedTopic.statistics.map((stat, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-snug font-medium">
                    {stat}
                  </div>
                ))}
              </div>
            </div>

            {/* Placement Do's and Don'ts */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Placement GD Etiquette &amp; Do&apos;s / Don&apos;ts
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-950">
                {selectedTopic.dosAndDonts.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-700 font-bold">&check;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Powerful Opening Starter Phrases */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
              <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5 mb-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-700" /> Effective Opening &amp; Transition Phrases
              </h4>
              <div className="space-y-1.5">
                {selectedTopic.starterPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-purple-100 text-xs text-purple-950 italic">
                    &ldquo;{phrase}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Voice Practice Scratchpad */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" /> AI 60-Second GD Pitch Practice
                </span>
                {isRecording && (
                  <span className="text-xs text-rose-400 font-mono font-bold animate-pulse">
                    Recording: {speechTimer}s / 60s
                  </span>
                )}
              </div>

              <textarea
                value={recordedSpeech}
                onChange={(e) => setRecordedSpeech(e.target.value)}
                rows={3}
                placeholder="Practice your opening statement or point delivery here..."
                className="w-full p-3 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 focus:ring-2 focus:ring-cyan-400 resize-none font-sans"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleRecord}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" /> Stop &amp; Analyze Pitch
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" /> Start 60s Pitch Test
                    </>
                  )}
                </button>

                {speechFeedback && (
                  <span className="text-[11px] text-cyan-300 font-medium max-w-md">
                    {speechFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveTopic}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-fade-in text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingTopicId ? 'Edit Group Discussion Topic & News' : 'Add New GD Topic & News Context'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 text-lg"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Topic Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Generative AI in Software Engineering: Career Threat or Multiplier?"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GDCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="AI & Tech Ethics">AI &amp; Tech Ethics</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="Placement Hot Topics">Placement Hot Topics</option>
                  <option value="Business & Economy">Business &amp; Economy</option>
                  <option value="Social Issues">Social Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">News Source Link / Citation</label>
                <input
                  type="text"
                  value={newsSource}
                  onChange={(e) => setNewsSource(e.target.value)}
                  placeholder="e.g. Economic Times / MeitY Gazette"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Latest News &amp; Background Summary (Admin Updates)
              </label>
              <textarea
                required
                rows={3}
                value={newsSummary}
                onChange={(e) => setNewsSummary(e.target.value)}
                placeholder="Detail the recent real-world event or corporate update..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-emerald-800 mb-1">
                  Arguments FOR (One point per line)
                </label>
                <textarea
                  rows={3}
                  value={pointsForText}
                  onChange={(e) => setPointsForText(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-rose-800 mb-1">
                  Arguments AGAINST (One point per line)
                </label>
                <textarea
                  rows={3}
                  value={pointsAgainstText}
                  onChange={(e) => setPointsAgainstText(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Key Statistics (One per line)
                </label>
                <textarea
                  rows={2}
                  value={statisticsText}
                  onChange={(e) => setStatisticsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Placement Do&apos;s &amp; Don&apos;ts
                </label>
                <textarea
                  rows={2}
                  value={dosAndDontsText}
                  onChange={(e) => setDosAndDontsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Opening Starter Phrases (One per line)
              </label>
              <input
                type="text"
                value={starterPhrasesText}
                onChange={(e) => setStarterPhrasesText(e.target.value)}
                placeholder="Good morning everyone, initiating our discussion on..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Mark as Trending Topic</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Save GD Topic
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
