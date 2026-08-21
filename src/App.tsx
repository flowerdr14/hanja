import React, { useState, useEffect, useCallback } from 'react';
import { ExamConfig, ExamSheet, HanjaLevel } from './types';
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
} from 'lucide-react';

const DEFAULT_CONFIG: ExamConfig = {
  title: '8급 한자능력검정 모의평가',
  level: '8급',
  questionCount: 24, // 24 questions fit cleanly on 1 page 2-column or multi-page
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

  // Generate new exam
  const handleRegenerate = useCallback((newConf?: ExamConfig) => {
    const targetConfig = newConf || config;
    const newExam = generateExamSheet(targetConfig);
    setExam(newExam);
  }, [config]);

  // Handle level change
  const handleChangeLevel = (level: HanjaLevel) => {
    const details = LEVEL_DETAILS[level];
    const updated: ExamConfig = {
      ...config,
      level,
      title: `${level} 한자능력검정 모의평가`,
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
        {currentTab === 'paper' && (
          <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                {config.level} ({exam.questions.length}문항)
              </span>

              {/* Quick Question Count Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {[10, 24, 50, 100].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      const updated = { ...config, questionCount: count };
                      setConfig(updated);
                      handleRegenerate(updated);
                    }}
                    className={`px-2 py-1 rounded font-bold font-mono transition-colors ${
                      config.questionCount === count
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {count}문항
                  </button>
                ))}
              </div>

              {/* Toggle Answers on Paper */}
              <button
                type="button"
                onClick={() => setShowAnswersOnPaper(!showAnswersOnPaper)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                  showAnswersOnPaper
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {showAnswersOnPaper ? '정답 숨기기 (학생용 시험지)' : '정답 표시 (교사용 정답지)'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* PDF Print Guide Notice */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                <Info className="w-3 h-3 text-amber-600" />
                <span>인쇄창에서 <strong>'PDF로 저장'</strong>을 누르면 깔끔한 시험지 파일로 저장됩니다.</span>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> 시험지 인쇄
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Exam Paper View */}
        {currentTab === 'paper' && (
          <div className="w-full flex justify-center">
            <ExamPaper
              exam={exam}
              showAnswers={showAnswersOnPaper}
              studentName={config.candidateName}
            />
          </div>
        )}

        {/* Tab 2: Answer Key & Solutions View */}
        {currentTab === 'answers' && (
          <AnswerKeyView exam={exam} onPrint={handlePrint} />
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
