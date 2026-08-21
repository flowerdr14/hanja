import React, { useState, useMemo } from 'react';
import { HanjaEntry, HanjaLevel } from '../types';
import { ALL_UNIQUE_HANJA } from '../data/questionGenerator';
import { HANJA_LEVELS, LEVEL_DETAILS } from '../data/levelStandards';
import { WritingCanvas } from './WritingCanvas';
import {
  Search,
  Filter,
  Layers,
  Hash,
  ArrowLeftRight,
  BookOpen,
  Shuffle,
  Eye,
  PenTool,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const HanjaDictionary: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<HanjaLevel | 'all'>('8급');
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'grid' | 'flashcard'>('grid');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceChar, setPracticeChar] = useState<HanjaEntry | null>(null);

  // Filter Hanja
  const filteredHanja = useMemo(() => {
    return ALL_UNIQUE_HANJA.filter((h) => {
      if (selectedLevel !== 'all' && h.level !== selectedLevel) {
        return false;
      }
      if (!searchTerm.trim()) return true;

      const q = searchTerm.trim().toLowerCase();
      return (
        h.char.includes(q) ||
        h.meaningSound.toLowerCase().includes(q) ||
        h.sound.toLowerCase().includes(q) ||
        h.meaning.toLowerCase().includes(q) ||
        h.radical.includes(q) ||
        String(h.strokes).includes(q) ||
        h.words?.some((w) => w.word.includes(q) || w.reading.includes(q))
      );
    });
  }, [selectedLevel, searchTerm]);

  const currentFlashcard = filteredHanja[flashcardIdx] || filteredHanja[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev + 1) % Math.max(1, filteredHanja.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev - 1 + filteredHanja.length) % Math.max(1, filteredHanja.length));
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-2 sm:px-4 font-sans-korean text-slate-900">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                급수별 배정한자 옥편 & 플래시카드
              </span>
              <span className="text-xs font-mono text-slate-500">
                총 {filteredHanja.length}자 검색됨
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-hanja text-slate-900 mt-1">
              한자 사전 및 암기 연습장
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                mode === 'grid'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              사전 목록 보기
            </button>
            <button
              onClick={() => {
                setMode('flashcard');
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                mode === 'flashcard'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              플래시카드 암기
            </button>
          </div>
        </div>

        {/* Level Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedLevel === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 급수
          </button>
          {HANJA_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="한자(天), 뜻(하늘), 음(천), 부수(大), 획수, 또는 단어(天地)로 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {mode === 'grid' ? (
        /* Grid Explorer Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHanja.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-hanja text-4xl font-black text-slate-900">
                      {item.char}
                    </span>
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {item.meaningSound}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                          {item.level}
                        </span>
                        <span>부수: {item.radical}</span>
                        <span>{item.strokes}획</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPracticeChar(item)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="한자 쓰기 연습"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                </div>

                {/* Simplified & Multiple Readings */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 my-2 pt-2 border-t border-slate-100">
                  {item.simplified && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      약자: <strong className="font-hanja">{item.simplified}</strong>
                    </span>
                  )}
                  {item.multipleReadings && item.multipleReadings.length > 0 && (
                    <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium">
                      동자이음: {item.multipleReadings.map((r) => `${r.sound}(${r.meaning})`).join(', ')}
                    </span>
                  )}
                  {item.vowelLength && (
                    <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[11px]">
                      {item.vowelLength === 'long' ? '첫음절 장음(:)' : '단음'}
                    </span>
                  )}
                </div>

                {/* Example Words */}
                {item.words && item.words.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400">대표 어휘</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.words.map((w, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-hanja text-slate-700"
                          title={w.meaning}
                        >
                          <strong className="font-bold mr-1">{w.word}</strong>({w.reading})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flashcard Study Mode */
        currentFlashcard && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center flex flex-col items-center">
            <div className="text-xs text-slate-400 font-mono mb-4">
              카드를 클릭하여 뜻과 음을 뒤집어보세요 ({flashcardIdx + 1} / {filteredHanja.length})
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[260px] cursor-pointer rounded-2xl bg-amber-50/40 border-2 border-amber-900/20 p-6 flex flex-col items-center justify-center transition-all hover:scale-[1.01] shadow-inner"
            >
              {!isFlipped ? (
                <div>
                  <div className="font-hanja text-7xl font-bold text-slate-900 mb-4">
                    {currentFlashcard.char}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    클릭하면 훈음과 해설이 나타납니다
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-hanja text-4xl font-bold text-slate-800">
                    {currentFlashcard.char}
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {currentFlashcard.meaningSound}
                  </div>
                  <div className="text-xs text-slate-500">
                    급수: <strong>{currentFlashcard.level}</strong> | 부수: <strong>{currentFlashcard.radical}</strong> | 총 <strong>{currentFlashcard.strokes}획</strong>
                  </div>
                  {currentFlashcard.words && currentFlashcard.words.length > 0 && (
                    <div className="pt-2 border-t border-amber-900/10 text-xs text-slate-700">
                      {currentFlashcard.words.map((w) => `${w.word}(${w.reading}) : ${w.meaning}`).join(' / ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flashcard Controls */}
            <div className="mt-6 flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handlePrevCard}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50"
              >
                이전 카드
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> {isFlipped ? '한자만 보기' : '정답 확인'}
              </button>
              <button
                type="button"
                onClick={handleNextCard}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
              >
                다음 카드
              </button>
            </div>
          </div>
        )
      )}

      {/* Writing Practice Pad Modal */}
      {practiceChar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-hanja text-2xl font-bold">{practiceChar.char}</span>
                <span className="text-sm font-bold text-slate-800">{practiceChar.meaningSound}</span>
              </div>
              <button
                onClick={() => setPracticeChar(null)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1"
              >
                닫기
              </button>
            </div>

            <div className="flex flex-col items-center">
              <WritingCanvas
                width={200}
                height={200}
                guideChar={practiceChar.char}
                showGrid={true}
              />
              <div className="mt-3 text-xs text-slate-500 text-center">
                부수: <strong className="font-hanja">{practiceChar.radical}</strong> | 총 획수: <strong>{practiceChar.strokes}획</strong>
              </div>
            </div>

            <button
              onClick={() => setPracticeChar(null)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
