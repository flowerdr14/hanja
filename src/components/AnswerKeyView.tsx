import React from 'react';
import { ExamSheet, QuestionItem } from '../types';
import { CheckCircle, Printer, BookOpen, Layers, Hash } from 'lucide-react';

interface AnswerKeyViewProps {
  exam: ExamSheet;
  onPrint: () => void;
}

export const AnswerKeyView: React.FC<AnswerKeyViewProps> = ({ exam, onPrint }) => {
  const { config, questions } = exam;

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white border border-slate-300 shadow-lg p-6 sm:p-10 font-sans-korean text-slate-900 rounded-xl my-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded uppercase font-mono">
              OFFICIAL ANSWER KEY
            </span>
            <span className="text-xs text-slate-500 font-mono">{config.examDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-hanja text-slate-900 mt-1">
            {config.level} - {config.title} [정답 및 해설지]
          </h1>
        </div>

        <button
          onClick={onPrint}
          className="no-print inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow transition-colors"
        >
          <Printer className="w-4 h-4" /> 정답지 인쇄 / PDF 저장
        </button>
      </div>

      {/* Quick Scoring Table (OMR Style 1~100) */}
      <div className="my-6">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          빠른 채점 정답표 (총 {questions.length}문항)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-xs">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
            >
              <span className="font-bold text-slate-500 min-w-6">#{q.number}</span>
              <span className="font-bold text-red-600 truncate text-right font-hanja">
                {q.format === 'multiple_choice' && q.answerChoiceNum
                  ? `(${q.answerChoiceNum}) ${q.answer}`
                  : q.answer}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Per-Question Explanations */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          문항별 상세 해설 및 어휘 분석
        </h2>

        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs leading-relaxed"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-900 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[11px]">
                    {q.number}번
                  </span>
                  <span className="text-slate-500 font-medium text-[11px]">
                    [{q.categoryLabel}]
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  {q.additionalInfo?.radical && (
                    <span className="flex items-center gap-0.5">
                      <Layers className="w-3 h-3 text-amber-700" />
                      부수: <strong className="font-hanja text-slate-800">{q.additionalInfo.radical}</strong>
                    </span>
                  )}
                  {q.additionalInfo?.strokes && (
                    <span className="flex items-center gap-0.5">
                      <Hash className="w-3 h-3 text-blue-700" />
                      총 <strong>{q.additionalInfo.strokes}획</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-slate-800 font-medium mb-1">
                문제: <span className="font-hanja">{q.prompt}</span>
              </div>

              <div className="text-red-700 font-bold mb-1">
                정답:{' '}
                <span className="bg-red-50 border border-red-200 px-2 py-0.5 rounded font-hanja text-[13px]">
                  {q.answer}
                </span>
                {q.format === 'multiple_choice' && q.answerChoiceNum && (
                  <span className="ml-2 font-mono text-xs text-red-600 font-normal">
                    (선지 {q.answerChoiceNum}번)
                  </span>
                )}
              </div>

              <div className="text-slate-600 mt-1 bg-white p-2 rounded border border-slate-100">
                {q.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
