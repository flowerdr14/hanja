import React from 'react';
import { ExamConfig, HanjaLevel, QuestionCategory } from '../types';
import { HANJA_LEVELS, LEVEL_DETAILS, CATEGORY_NAMES } from '../data/levelStandards';
import {
  Settings,
  Sliders,
  Sparkles,
  BookOpen,
  Clock,
  User,
  Calendar,
  CheckSquare,
  Square,
  Layers,
  X,
} from 'lucide-react';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExamConfig;
  onChangeConfig: (newConfig: ExamConfig) => void;
  onGenerate: () => void;
}

export const ExamConfigModal: React.FC<ExamConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onGenerate,
}) => {
  if (!isOpen) return null;

  const handleLevelChange = (lvl: HanjaLevel) => {
    const details = LEVEL_DETAILS[lvl];
    onChangeConfig({
      ...config,
      level: lvl,
      title: `${lvl} 한자능력검정 모의평가`,
      timeLimitMinutes: details?.recommendedTime || 50,
    });
  };

  const handlePreset = (preset: 'official_100' | 'intensive_50' | 'writing_25' | 'basic_20') => {
    switch (preset) {
      case 'official_100':
        onChangeConfig({
          ...config,
          questionCount: 100,
          timeLimitMinutes: 60,
          title: `${config.level} 국가공인 한자능력검정 종합 실전모의고사`,
          formatMode: 'mixed',
          choiceCount: 4,
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
        });
        break;
      case 'intensive_50':
        onChangeConfig({
          ...config,
          questionCount: 50,
          timeLimitMinutes: 40,
          title: `${config.level} 훈음·독음 핵심 50문항 마스터`,
          formatMode: 'mixed',
          selectedCategories: ['meaning_sound', 'reading', 'words_fill'],
        });
        break;
      case 'writing_25':
        onChangeConfig({
          ...config,
          questionCount: 25,
          timeLimitMinutes: 30,
          title: `${config.level} 배정한자 필순 및 한자쓰기 특훈`,
          formatMode: 'subjective_only',
          showWritingGrid: true,
          selectedCategories: ['write_hanja', 'words_fill'],
        });
        break;
      case 'basic_20':
        onChangeConfig({
          ...config,
          questionCount: 20,
          timeLimitMinutes: 20,
          title: `${config.level} 기초 실력 점검 20선`,
          formatMode: 'mixed',
          selectedCategories: ['meaning_sound', 'reading', 'radical'],
        });
        break;
    }
  };

  const toggleCategory = (cat: QuestionCategory) => {
    const exists = config.selectedCategories.includes(cat);
    let updated: QuestionCategory[];
    if (exists) {
      if (config.selectedCategories.length <= 1) return; // keep at least 1
      updated = config.selectedCategories.filter((c) => c !== cat);
    } else {
      updated = [...config.selectedCategories, cat];
    }
    onChangeConfig({ ...config, selectedCategories: updated });
  };

  const selectAllCategories = () => {
    const all = Object.keys(CATEGORY_NAMES) as QuestionCategory[];
    onChangeConfig({ ...config, selectedCategories: all });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-hanja text-slate-900">
                시험지 출제 상세 설정
              </h2>
              <p className="text-xs text-slate-500">
                급수, 문항 수, 문제 유형 및 시험지 출력 형식을 맞춤 설정하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              빠른 프리셋 추천
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('official_100')}
                className="p-2.5 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold text-left transition-colors"
              >
                🏆 종합 100문항 (실전)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('intensive_50')}
                className="p-2.5 bg-amber-50/70 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold text-left transition-colors"
              >
                📖 훈음·독음 50문항
              </button>
              <button
                type="button"
                onClick={() => handlePreset('writing_25')}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold text-left transition-colors"
              >
                ✍️ 한자 쓰기 25문항
              </button>
              <button
                type="button"
                onClick={() => handlePreset('basic_20')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold text-left transition-colors"
              >
                🎯 기초 20문항
              </button>
            </div>
          </div>

          {/* Hanja Level Selector (15 Grades) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              시험 대상 급수 선택 (총 15개 급수 체계)
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
              {HANJA_LEVELS.map((lvl) => {
                const isSelected = config.level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelChange(lvl)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            {LEVEL_DETAILS[config.level] && (
              <p className="text-[11px] text-slate-500 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <strong>{config.level}</strong>: {LEVEL_DETAILS[config.level].description} (누적 {LEVEL_DETAILS[config.level].cumulativeCount}자 수준)
              </p>
            )}
          </div>

          {/* Title, Name, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시험지 제목
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                수험자 성명 (인쇄용)
              </label>
              <input
                type="text"
                value={config.candidateName}
                onChange={(e) => onChangeConfig({ ...config, candidateName: e.target.value })}
                placeholder="성명 (예: 홍길동)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                문항 수 (최대 100+문항 자동출제)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={config.questionCount}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      questionCount: Math.max(1, parseInt(e.target.value) || 10),
                    })
                  }
                  className="w-24 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                />
                <div className="flex gap-1">
                  {[20, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onChangeConfig({ ...config, questionCount: num })}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold rounded-lg text-slate-700"
                    >
                      {num}문항
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시험 시행일자
              </label>
              <input
                type="date"
                value={config.examDate}
                onChange={(e) => onChangeConfig({ ...config, examDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Question Categories Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                출제 문제 유형 선택 (10개 유형)
              </label>
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-[11px] text-indigo-600 hover:underline font-bold"
              >
                전체 선택
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_NAMES) as QuestionCategory[]).map((cat) => {
                const isSelected = config.selectedCategories.includes(cat);
                const info = CATEGORY_NAMES[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs">{info.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {info.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Format & Grid Settings */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">문제 형식 모드</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'mixed', label: '혼합형 (객관식+주관식)' },
                  { id: 'multiple_choice_only', label: '객관식 전용' },
                  { id: 'subjective_only', label: '주관식 전용' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        ...config,
                        formatMode: mode.id as any,
                      })
                    }
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      config.formatMode === mode.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                한자 쓰기 문제 격자 보조선 (田자 가이드) 표시
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    showWritingGrid: !config.showWritingGrid,
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  config.showWritingGrid
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {config.showWritingGrid ? '격자 ON' : '격자 OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() => {
              onGenerate();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> 새로운 문제 랜덤 출제 및 시험지 생성
          </button>
        </div>
      </div>
    </div>
  );
};
