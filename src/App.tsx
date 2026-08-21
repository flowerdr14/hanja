import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExamConfig, ExamSheet, HanjaLevel, QuestionCategory } from './types';
import { generateExamSheet } from './data/questionGenerator';
import { LEVEL_DETAILS, HANJA_LEVELS } from './data/levelStandards';
import { Header } from './components/Header';
import { ExamPaper } from './components/ExamPaper';
import { AnswerKeyView } from './components/AnswerKeyView';
import { OnlineTestMode } from './components/OnlineTestMode';
import { HanjaDictionary } from './components/HanjaDictionary';
import { ExamConfigModal } from './components/ExamConfigModal';
import {
  Printer,
  Sparkles,
  Sliders,
  PlayCircle,
  FileText,
  CheckCircle2,
  BookOpen,
  Info,
  Layers,
  Award,
  Clock,
  HelpCircle,
  Filter,
  RefreshCw,
  Eye,
  ListFilter,
} from 'lucide-react';

const CATEGORY_TABS: { id: QuestionCategory; label: string }[] = [
  { id: 'meaning_sound', label: '훈음 (뜻·음)' },
  { id: 'write_hanja', label: '한자 쓰기' },
  { id: 'reading', label: '한자어 독음' },
  { id: 'words_fill', label: '고사성어/빈칸' },
  { id: 'synonym_antonym', label: '유의·반의' },
  { id: 'radical', label: '부수' },
  { id: 'strokes', label: '획수' },
  { id: 'simplified', label: '약자' },
  { id: 'multiple_readings', label: '동자이음' },
  { id: 'vowel_length', label: '장단음' },
];

const DEFAULT_CONFIG: ExamConfig = {
  title: '한자능력검정 모의평가',
  level: '선택',
  questionCount: 20, // Default 20 questions
  timeLimitMinutes: 40,
  candidateName: '',
  examDate: new Date().toISOString().split('T')[0],
  selectedCategories: [
    'meaning_sound',
    'reading',
    'write_hanja',
    'words_fill',
    'synonym_antonym',
    'radical',
    'strokes',
    'simplified',
    'multiple_readings',
    'vowel_length',
  ],
  formatMode: 'mixed',
  choiceCount: 4,
  showWritingGrid: true,
  fontSize: 'normal',
  columnsPerPage: 2,
};

export default function App() {
  const [config, setConfig] = useState<ExamConfig>(DEFAULT_CONFIG);
  const [exam, setExam] = useState<ExamSheet>(() => generateExamSheet(DEFAULT_CONFIG));
  const [currentTab, setCurrentTab] = useState<'paper' | 'answers' | 'online_test' | 'dictionary'>('paper');
  const [showAnswersOnPaper, setShowAnswersOnPaper] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | QuestionCategory>('all');

  // Count questions per category in the current generated exam
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    exam.questions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [exam.questions]);

  // Filter questions for display if a specific category is selected
  const displayedQuestions = useMemo(() => {
    if (selectedCategoryFilter === 'all') {
      return exam.questions;
    }
    return exam.questions.filter((q) => q.category === selectedCategoryFilter);
  }, [exam.questions, selectedCategoryFilter]);

  const displayedExam = useMemo(() => {
    return {
      ...exam,
      questions: displayedQuestions,
    };
  }, [exam, displayedQuestions]);

  // Generate new exam
  const handleRegenerate = useCallback((newConf?: ExamConfig) => {
    const targetConfig = newConf || config;
    const newExam = generateExamSheet(targetConfig);
    setExam(newExam);
  }, [config]);

  // Focus generate: generate an exam specifically composed of one category
  const handleFocusGenerate = (cat: QuestionCategory) => {
    const catInfo = CATEGORY_TABS.find((c) => c.id === cat);
    const updated: ExamConfig = {
      ...config,
      title: `${config.level} [${catInfo?.label || cat}] 집중 평가`,
      selectedCategories: [cat],
    };
    setConfig(updated);
    setSelectedCategoryFilter(cat);
    handleRegenerate(updated);
  };

  // Handle level change
  const handleChangeLevel = (level: HanjaLevel) => {
    if (level === '선택') {
      const updated: ExamConfig = {
        ...config,
        level: '선택',
        title: config.title || '한자능력검정 모의평가',
        timeLimitMinutes: 40,
      };
      setConfig(updated);
      handleRegenerate(updated);
      return;
    }
    const details = LEVEL_DETAILS[level];
    // If title was default or previous level title, automatically format with new level
    const isDefaultTitle =
      !config.title ||
      config.title === '한자능력검정 모의평가' ||
      /^(선택|[1-8]급|준[1-7]급)\s*(한자능력검정\s*모의평가)?/.test(config.title);

    const newTitle = isDefaultTitle ? `${level} 한자능력검정 모의평가` : config.title;

    const updated: ExamConfig = {
      ...config,
      level,
      title: newTitle,
      timeLimitMinutes: details?.recommendedTime || 50,
    };
    setConfig(updated);
    handleRegenerate(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans-korean">
      {/* Top Main Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        config={config}
        onChangeLevel={handleChangeLevel}
        onOpenConfig={() => setIsConfigOpen(true)}
        onRegenerate={() => handleRegenerate()}
        onPrint={handlePrint}
        questionCount={exam.questions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-4">
        {/* Quick Toolbar for Paper View */}
        {(currentTab === 'paper' || currentTab === 'answers') && (
          <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6 flex flex-col gap-3.5 text-xs">
            {/* Top Row: Title, Level Selector, Custom Question Count, Student Name & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Exam Title Input (시험지 제목 직접 입력) */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[12px]">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    시험지 제목:
                  </span>
                  <input
                    type="text"
                    placeholder="시험지 제목 입력"
                    value={config.title}
                    onChange={(e) => {
                      setConfig({ ...config, title: e.target.value });
                    }}
                    className="w-48 sm:w-60 px-2 py-1 font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 text-xs"
                  />
                </div>

                {/* 2. Direct Level Selector */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[12px]">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    급수:
                  </span>
                  <select
                    value={config.level}
                    onChange={(e) => handleChangeLevel(e.target.value as HanjaLevel)}
                    className="font-bold font-mono bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="선택">선택</option>
                    {HANJA_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Custom Question Count Input (직접 입력 가능) */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="font-bold text-slate-700 text-[12px]">
                    문항 수:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={config.questionCount}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(150, parseInt(e.target.value, 10) || 1));
                      const updated = { ...config, questionCount: val };
                      setConfig(updated);
                    }}
                    onBlur={() => handleRegenerate()}
                    className="w-14 px-2 py-1 font-mono font-bold text-center bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-500 font-medium">문항</span>
                  <button
                    type="button"
                    onClick={() => handleRegenerate()}
                    className="ml-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors"
                    title="입력한 문항 수로 시험지 생성"
                  >
                    적용
                  </button>

                  {/* Preset quick buttons */}
                  <div className="hidden sm:flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
                    {[10, 20, 30, 50, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          const updated = { ...config, questionCount: count };
                          setConfig(updated);
                          handleRegenerate(updated);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
                          config.questionCount === count
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Candidate Name (성명 입력 - 1페이지 시험지에 바로 인쇄) */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="font-bold text-slate-700 text-[12px]">성명:</span>
                  <input
                    type="text"
                    placeholder="응시자 이름"
                    value={config.candidateName}
                    onChange={(e) => {
                      setConfig({ ...config, candidateName: e.target.value });
                    }}
                    className="w-24 px-2 py-1 font-sans font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>

                {/* Toggle Answers on Paper */}
                {currentTab === 'paper' && (
                  <button
                    type="button"
                    onClick={() => setShowAnswersOnPaper(!showAnswersOnPaper)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                      showAnswersOnPaper
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {showAnswersOnPaper ? '정답 숨기기 (학생용)' : '정답 표시 (교사용 정답지)'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* PDF Print Guide Notice */}
                <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1.5 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>인쇄창에서 <strong>'PDF로 저장'</strong>을 누르면 A4 시험지 파일로 저장됩니다.</span>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> 시험지 인쇄 / PDF
                </button>
              </div>
            </div>

            {/* Bottom Row: Category Separate View Filter (문항 유형별 따로보기) */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold shrink-0">
                <ListFilter className="w-3.5 h-3.5 text-indigo-600" />
                <span>유형별 따로보기:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
                {/* All Questions Pill */}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 text-[11px] ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>전체</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${selectedCategoryFilter === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {exam.questions.length}
                  </span>
                </button>

                {/* Individual Category Pills */}
                {CATEGORY_TABS.map((cat) => {
                  const count = categoryCounts[cat.id] || 0;
                  const isSelected = selectedCategoryFilter === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 text-[11px] ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : count > 0
                          ? 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-indigo-700 text-white'
                            : count > 0
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Category Filter Banner */}
            {selectedCategoryFilter !== 'all' && (
              <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-indigo-950">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    📌 [{CATEGORY_TABS.find((c) => c.id === selectedCategoryFilter)?.label}]
                  </span>
                  <span className="text-indigo-800">
                    유형 <strong>{displayedQuestions.length}문항</strong>을 따로 확인하고 있습니다.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFocusGenerate(selectedCategoryFilter)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className="w-3 h-3" /> 이 유형만 집중 재출제
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-xs transition-colors text-[11px]"
                  >
                    전체 보기로 복귀
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Exam Paper View */}
        {currentTab === 'paper' && (
          <div className="w-full flex justify-center">
            <ExamPaper
              exam={displayedExam}
              showAnswers={showAnswersOnPaper}
              studentName={config.candidateName}
              onChangeTitle={(title) => setConfig((prev) => ({ ...prev, title }))}
              onSelectLevel={handleChangeLevel}
            />
          </div>
        )}

        {/* Tab 2: Answer Key & Solutions View */}
        {currentTab === 'answers' && (
          <AnswerKeyView exam={displayedExam} onPrint={handlePrint} />
        )}

        {/* Tab 3: Interactive Online CBT Test Mode */}
        {currentTab === 'online_test' && (
          <OnlineTestMode exam={exam} onExit={() => setCurrentTab('paper')} />
        )}

        {/* Tab 4: Hanja Dictionary & Flashcards */}
        {currentTab === 'dictionary' && <HanjaDictionary />}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-hanja font-bold text-slate-800">漢字能力檢定</span>
            <span>한자능력검정시험 대비 15개 급수 자동 출제 시스템</span>
          </div>
          <div className="text-slate-400 font-mono">
            8급 · 7급 · 6급 · 5급 · 4급 · 3급 · 2급 · 1급 (준급수 포함)
          </div>
        </div>
      </footer>

      {/* Config Modal */}
      <ExamConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onChangeConfig={setConfig}
        onGenerate={() => handleRegenerate()}
      />
    </div>
  );
}
