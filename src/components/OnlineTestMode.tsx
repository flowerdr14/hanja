import React, { useState, useEffect, useRef } from 'react';
import { ExamSheet, QuestionItem } from '../types';
import { WritingCanvas } from './WritingCanvas';
import confetti from 'canvas-confetti';
import {
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  BookOpen,
  PenTool,
} from 'lucide-react';

interface OnlineTestModeProps {
  exam: ExamSheet;
  onExit: () => void;
}

export const OnlineTestMode: React.FC<OnlineTestModeProps> = ({ exam, onExit }) => {
  const { config, questions } = exam;

  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [drawingAnswers, setDrawingAnswers] = useState<Record<number, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(config.timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [showReviewOnlyErrors, setShowReviewOnlyErrors] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Effect
  useEffect(() => {
    if (isFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (qNum: number, choiceNum: number, choiceText: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: String(choiceNum), // store choice number or text
    }));
  };

  const handleSubjectiveInput = (qNum: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: val,
    }));
  };

  const handleCanvasDrawing = (qNum: number, dataUrl: string) => {
    setDrawingAnswers((prev) => ({
      ...prev,
      [qNum]: dataUrl,
    }));
  };

  const finishExam = () => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      const userAns = (answers[q.number] || '').trim();
      if (q.format === 'multiple_choice') {
        if (userAns === String(q.answerChoiceNum)) {
          correct++;
        }
      } else {
        // Subjective text check (fuzzy match)
        const cleanUser = userAns.replace(/\s+/g, '');
        const cleanAnswer = q.answer.replace(/\s+/g, '');
        if (cleanUser && (cleanAnswer.includes(cleanUser) || cleanUser.includes(cleanAnswer))) {
          correct++;
        }
      }
    });

    const scoreRatio = correct / questions.length;
    if (scoreRatio >= 0.7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Grading calculation
  const gradingResults = questions.map((q) => {
    const userAns = (answers[q.number] || '').trim();
    let isCorrect = false;

    if (q.format === 'multiple_choice') {
      isCorrect = userAns === String(q.answerChoiceNum);
    } else {
      const cleanUser = userAns.replace(/\s+/g, '');
      const cleanAnswer = q.answer.replace(/\s+/g, '');
      isCorrect = Boolean(cleanUser && (cleanAnswer.includes(cleanUser) || cleanUser.includes(cleanAnswer)));
    }

    return {
      question: q,
      userAns,
      isCorrect,
    };
  });

  const correctCount = gradingResults.filter((r) => r.isCorrect).length;
  const totalCount = questions.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);
  const isPassed = scorePercent >= 70;

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 font-sans-korean text-slate-900">
      {/* Top Banner Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              온라인 모의고사 (CBT)
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {config.level}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-hanja text-slate-900 mt-1">
            {config.title}
          </h1>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          {!isFinished ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeftSeconds < 300
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
              <Award className="w-4 h-4" /> 시험 종료 ({scorePercent}점)
            </div>
          )}

          <button
            onClick={onExit}
            className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            나가기
          </button>
        </div>
      </div>

      {!isFinished ? (
        /* Active Test Taking View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Panel (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center font-mono">
                    {currentQ.number}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {currentQ.categoryLabel}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {currentIdx + 1} / {questions.length}
                </span>
              </div>

              {/* Instruction */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                {currentQ.instruction}
              </h2>

              {/* Prompt Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center font-hanja text-lg sm:text-xl font-bold text-slate-800 mb-6">
                {currentQ.prompt}
              </div>

              {/* Answer Inputs */}
              {currentQ.format === 'multiple_choice' && currentQ.options ? (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.number] === String(opt.num);
                    return (
                      <button
                        key={opt.num}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.number, opt.num, opt.text)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.num}
                        </span>
                        <span className="font-hanja text-base">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Subjective Input + Optional Digital Writing Canvas */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      정답 텍스트 입력 (한글 뜻음 또는 한자)
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.number] || ''}
                      onChange={(e) => handleSubjectiveInput(currentQ.number, e.target.value)}
                      placeholder="여기에 정답을 입력하세요 (예: 하늘 천)"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-base"
                    />
                  </div>

                  {/* Hanja Writing Practice Pad for Hanja questions */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5" /> 디지털 한자 직접 쓰기 패드
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        마우스나 터치펜으로 획순을 직접 써보며 답을 검토할 수 있습니다.
                      </p>
                    </div>

                    <WritingCanvas
                      width={140}
                      height={140}
                      initialDataUrl={drawingAnswers[currentQ.number]}
                      onChange={(dataUrl) => handleCanvasDrawing(currentQ.number, dataUrl)}
                      showGrid={true}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              <button
                type="button"
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> 이전 문항
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  다음 문항 <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishExam}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all"
                >
                  <Send className="w-4 h-4" /> 최종 답안 제출 및 채점
                </button>
              )}
            </div>
          </div>

          {/* Right Navigation & OMR Panel (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">문항 이동 네비게이터</span>
                <span className="text-xs font-mono text-indigo-600 font-bold">
                  답변 완료: {answeredCount} / {questions.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 max-h-[420px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAns = Boolean(answers[q.number]);
                  const isCur = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 text-xs font-mono font-bold rounded-lg flex items-center justify-center transition-all ${
                        isCur
                          ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                          : isAns
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={finishExam}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> 시험지 제출 및 자동 채점
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Test Finished & Grading Results View */
        <div className="space-y-6">
          {/* Result Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold font-hanja text-slate-900">
              {config.title} 채점 결과
            </h2>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span
                className={`text-5xl sm:text-6xl font-black font-mono ${
                  isPassed ? 'text-indigo-600' : 'text-amber-600'
                }`}
              >
                {scorePercent}
              </span>
              <span className="text-xl font-bold text-slate-400">/ 100점</span>
            </div>

            <div className="mt-2 text-sm font-semibold">
              {isPassed ? (
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🎉 합격 기준(70점)을 달성하였습니다!
                </span>
              ) : (
                <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  아쉽게 합격 기준에 미달했습니다. 오답 노트를 확인하세요.
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
              <span>총 문항: {totalCount}문항</span>
              <span>정답: <strong className="text-emerald-600">{correctCount}개</strong></span>
              <span>오답: <strong className="text-red-600">{totalCount - correctCount}개</strong></span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowReviewOnlyErrors(!showReviewOnlyErrors)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  showReviewOnlyErrors
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {showReviewOnlyErrors ? '전체 문항 보기' : '오답만 모아보기 (오답노트)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setDrawingAnswers({});
                  setTimeLeftSeconds(config.timeLimitMinutes * 60);
                  setIsFinished(false);
                  setCurrentIdx(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 다시 풀기
              </button>
            </div>
          </div>

          {/* Per Question Result List */}
          <div className="space-y-3">
            {gradingResults
              .filter((r) => (showReviewOnlyErrors ? !r.isCorrect : true))
              .map(({ question, userAns, isCorrect }) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-white border-emerald-200'
                      : 'bg-red-50/30 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center font-mono">
                        {question.number}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        [{question.categoryLabel}]
                      </span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 정답
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <XCircle className="w-3.5 h-3.5" /> 오답
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-900 mb-2">
                    {question.instruction}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-hanja text-sm mb-3">
                    {question.prompt}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2 rounded bg-slate-100/70">
                      <span className="text-slate-500">내가 제출한 답: </span>
                      <strong className={isCorrect ? 'text-emerald-700 font-hanja' : 'text-red-700 font-hanja'}>
                        {userAns || '(미작성)'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 text-emerald-900 font-bold">
                      <span>정답: </span>
                      <span className="font-hanja underline">{question.answer}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    <strong>해설: </strong> {question.explanation}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
