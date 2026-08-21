import React from 'react';
import { ExamConfig, HanjaLevel } from '../types';
import { HANJA_LEVELS } from '../data/levelStandards';
import {
  Printer,
  Sparkles,
  Sliders,
  PlayCircle,
  FileText,
  CheckCircle2,
  BookOpen,
  Download,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'paper' | 'answers' | 'online_test' | 'dictionary';
  setCurrentTab: (tab: 'paper' | 'answers' | 'online_test' | 'dictionary') => void;
  config: ExamConfig;
  onChangeLevel: (lvl: HanjaLevel) => void;
  onOpenConfig: () => void;
  onRegenerate: () => void;
  onPrint: () => void;
  questionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  config,
  onChangeLevel,
  onOpenConfig,
  onRegenerate,
  onPrint,
  questionCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-hanja font-bold shadow-md shadow-slate-300">
              <span className="text-base leading-none">漢</span>
              <span className="text-[9px] tracking-widest text-slate-300">字</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold font-hanja text-slate-900 tracking-tight">
                  한자능력검정 시험지 생성기
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-indigo-200">
                  {config.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                15개 급수 · 100문제 자동출제 · 2단 시험지 & 정답지 PDF 인쇄
              </p>
            </div>
          </div>

          {/* Mobile Fast Regenerate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            className="md:hidden p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            title="문제 다시 출제"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Center Tabs Navigation */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setCurrentTab('paper')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'paper'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>시험지 보기</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('answers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'answers'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>정답 및 해설</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('online_test')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'online_test'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-red-500" />
            <span>온라인 모의고사</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('dictionary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'dictionary'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>배정한자 사전</span>
          </button>
        </div>

        {/* Right Actions & Print */}
        <div className="flex items-center gap-2">
          {/* Quick Level Switcher Dropdown */}
          <select
            value={config.level}
            onChange={(e) => onChangeLevel(e.target.value as HanjaLevel)}
            className="text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {HANJA_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Quick Random Generation */}
          <button
            type="button"
            onClick={onRegenerate}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="새로운 무작위 문제 출제"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            랜덤 출제
          </button>

          {/* Detailed Config Trigger */}
          <button
            type="button"
            onClick={onOpenConfig}
            className="p-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="출제 옵션 및 문항 수 설정"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
          </button>

          {/* Print / Save to PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
