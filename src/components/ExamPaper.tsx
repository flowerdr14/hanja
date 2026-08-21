import React from 'react';
import { ExamSheet, HanjaLevel, QuestionItem } from '../types';
import { HANJA_LEVELS, LEVEL_DETAILS } from '../data/levelStandards';
import { Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface ExamPaperProps {
  exam: ExamSheet;
  showAnswers?: boolean;
  studentName?: string;
  onChangeTitle?: (title: string) => void;
  onSelectLevel?: (level: HanjaLevel) => void;
}

export const ExamPaper: React.FC<ExamPaperProps> = ({
  exam,
  showAnswers = false,
  studentName = '',
  onChangeTitle,
  onSelectLevel,
}) => {
  const { config, questions } = exam;

  // Split questions across pages for crisp A4 pagination (approx 20 questions per A4 page in 2-column layout)
  const QUESTIONS_PER_PAGE = 20;
  const pageChunks: QuestionItem[][] = [];

  for (let i = 0; i < questions.length; i += QUESTIONS_PER_PAGE) {
    pageChunks.push(questions.slice(i, i + QUESTIONS_PER_PAGE));
  }

  if (pageChunks.length === 0) {
    pageChunks.push([]);
  }

  return (
    <div id="exam-paper-printable-root" className="w-full flex flex-col items-center bg-transparent py-4 text-slate-900">
      {pageChunks.map((pageQuestions, pageIdx) => {
        // Partition page into left column and right column
        const midPoint = Math.ceil(pageQuestions.length / 2);
        const leftColQuestions = pageQuestions.slice(0, midPoint);
        const rightColQuestions = pageQuestions.slice(midPoint);

        return (
          <div
            key={pageIdx}
            className="a4-page relative w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-300 shadow-lg p-[14mm] mb-8 font-sans-korean text-black box-border flex flex-col justify-between"
            style={{ minHeight: '297mm' }}
          >
            {/* Top Container */}
            <div>
              {/* Exam Header Box - Page 1 Only (Page 2+ has no big title box as requested) */}
              {pageIdx === 0 ? (
                <div className="border-2 border-black mb-1">
                  <div className="flex border-b border-black">
                    {/* Left Box: 漢字 / 한자 */}
                    <div className="w-28 py-2 px-3 border-r-2 border-black flex flex-col items-center justify-center bg-slate-50/50">
                      <span className="font-hanja text-3xl font-black tracking-widest leading-none">
                        漢字
                      </span>
                      <span className="text-[11px] font-medium tracking-[0.35em] text-slate-700 mt-1 pl-1">
                        한 자
                      </span>
                    </div>

                    {/* Right Box: {급수}급 - {시험지 제목 (직접 입력 가능)} */}
                    <div className="flex-1 flex items-center justify-center py-2 px-3">
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        {config.level !== '선택' && (
                          <span className="text-xl md:text-2xl font-bold font-hanja tracking-tight text-slate-950 shrink-0 select-none">
                            {config.level} -
                          </span>
                        )}
                        <input
                          type="text"
                          value={config.title}
                          onChange={(e) => onChangeTitle?.(e.target.value)}
                          placeholder="시험지 제목을 입력하세요"
                          className="w-full text-center text-xl md:text-2xl font-bold font-hanja tracking-tight text-slate-950 bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-slate-950 rounded px-2 py-0.5 border-b border-transparent hover:border-slate-300 transition-colors cursor-text"
                          title="클릭하여 시험지 제목을 직접 수정할 수 있습니다"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub Bar: YYYY - MM - DD and Name/Info (Matches 번호001.png) */}
                  <div className="flex items-center justify-between px-4 py-1.5 text-xs font-serif bg-slate-50/30">
                    <div className="font-mono tracking-wider font-semibold">
                      {config.examDate || new Date().toISOString().split('T')[0]}
                    </div>
                    <div className="flex items-center gap-6">
                      <span>
                        성명: <span className="inline-block min-w-20 border-b border-black text-center font-bold px-2">{studentName || config.candidateName || '          '}</span>
                      </span>
                      <span>
                        점수: <span className="inline-block min-w-14 border-b border-black text-center px-1 font-mono">      / 100</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Page 2+ Minimal Running Header: Top title box and name are removed so name is only on front page (page 1) */
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-3 text-xs font-serif">
                  <div className="font-bold font-hanja text-[13px] text-slate-900">
                    {config.level === '선택' ? (config.title || '한자능력검정 모의평가') : `${config.level} - ${config.title || '한자능력검정 모의평가'}`}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-700">
                    <span className="font-mono text-slate-600 font-semibold">- {pageIdx + 1}쪽 -</span>
                  </div>
                </div>
              )}

              {/* Notice Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-300 pb-1 mb-4 px-1 font-sans">
                <span>※ 문항에 명시된 지시사항에 따라 바르게 답안을 작성하시오.</span>
                <span>총 {questions.length}문항 {questions.length > 0 ? `중 (${pageQuestions[0]?.number || 1} ~ ${pageQuestions[pageQuestions.length - 1]?.number || questions.length}번)` : ''}</span>
              </div>

              {/* Body: If no questions (Level is '선택'), render clean interactive guidance */}
              {questions.length === 0 ? (
                <div className="min-h-[700px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="max-w-md w-full bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-hanja">
                        응시할 급수를 선택해주세요
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        상단에서 <strong>시험지 제목</strong>을 자유롭게 수정하고, 아래 급수를 누르면 해당 급수에 맞춘 문제({config.questionCount}문항)가 바로 출제됩니다.
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {HANJA_LEVELS.map((lvl) => {
                        const detail = LEVEL_DETAILS[lvl];
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => onSelectLevel?.(lvl)}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/70 hover:shadow-xs transition-all text-slate-800 hover:text-indigo-900 group"
                          >
                            <span className="font-bold text-xs font-mono group-hover:scale-105 transition-transform">
                              {lvl}
                            </span>
                            <span className="text-[10px] text-slate-600 mt-0.5">
                              {detail ? `${detail.cumulativeCount}자` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* 2-Column Body with Center Dashed Line (Matches 번호001.png) */
                <div className="relative grid grid-cols-2 gap-x-8 min-h-[750px]">
                  {/* Center Vertical Dotted/Dashed Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-r-2 border-dashed border-slate-300 pointer-events-none" />

                  {/* Left Column Questions */}
                  <div className="flex flex-col gap-y-5 pr-4">
                    {leftColQuestions.map((q) => (
                      <QuestionCard key={q.id} question={q} showAnswers={showAnswers} showGrid={config.showWritingGrid} />
                    ))}
                  </div>

                  {/* Right Column Questions */}
                  <div className="flex flex-col gap-y-5 pl-4">
                    {rightColQuestions.map((q) => (
                      <QuestionCard key={q.id} question={q} showAnswers={showAnswers} showGrid={config.showWritingGrid} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{config.level === '선택' ? '한자능력평가' : `${config.level} 한자능력평가`} 시험지</span>
              <span className="font-semibold text-slate-600">
                - {pageIdx + 1} / {pageChunks.length} -
              </span>
              <span>한국한자한문평가</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface QuestionCardProps {
  question: QuestionItem;
  showAnswers: boolean;
  showGrid: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  showAnswers,
  showGrid,
}) => {
  const { number, instruction, prompt, options, answer, explanation, format, category } = question;

  return (
    <div className="break-inside-avoid text-[13.5px] leading-relaxed text-slate-900">
      {/* Question Number & Instruction: Question number is prominently larger than instruction */}
      <div className="text-black mb-1.5 flex items-baseline gap-1.5">
        <span className="font-mono font-black text-[17px] sm:text-[18px] text-slate-950 tracking-tight shrink-0">
          [{number}]
        </span>
        <span className="font-bold text-[13.5px] sm:text-[14px] text-slate-900 leading-snug">
          {instruction}
        </span>
      </div>

      {/* Multiple Choice Options (Matches standard exam paper: ① {내용} ② {내용} ③ {내용} ④ {내용} ⑤ {내용}) */}
      {format === 'multiple_choice' && options && options.length > 0 && (
        <div className="my-1.5 pl-1">
          {/* Main Question Body Prompt */}
          {prompt && (
            <div className="bg-slate-50/90 border border-slate-200 rounded px-3 py-2 mb-2 font-semibold text-center font-hanja text-[15px] sm:text-[16px] text-slate-950">
              {prompt}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[13px] sm:text-[13.5px] font-sans">
            {options.map((opt) => (
              <div
                key={opt.num}
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded ${
                  showAnswers && opt.isAnswer
                    ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                    : 'text-slate-800'
                }`}
              >
                <span className="font-bold text-slate-700 text-sm select-none">{opt.symbol}</span>
                <span className="font-hanja text-[14px]">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjective Layout with Balanced Handwriting Blank */}
      {format === 'subjective' && (
        <div className="my-1.5 pl-1 flex flex-col gap-1.5">
          {category === 'write_hanja' && showGrid ? (
            <div className="flex items-center justify-between gap-3 bg-slate-50/70 p-2.5 rounded border border-slate-200">
              <div className="font-semibold text-slate-950 text-[15px] sm:text-[16px] font-hanja flex-1">
                {prompt.replace(/→\s*\([^)]*\)/g, '').trim()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700 font-serif">답:</span>
                {/* Chinese Character Writing 4-Quadrant Grid (田자 격자) */}
                <div className="hanja-grid-box w-12 h-12 border-2 border-slate-800 bg-white rounded flex items-center justify-center relative shadow-xs">
                  {showAnswers && (
                    <span className="font-hanja text-2xl font-bold text-red-600 relative z-10">
                      {answer}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="font-hanja bg-slate-50/80 px-3.5 py-2.5 border border-slate-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="font-semibold text-slate-950 text-[15px] sm:text-[16px] leading-normal flex-1">
                {prompt}
              </div>
              {showAnswers && (
                <span className="text-red-600 font-bold font-sans text-xs bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">
                  정답: {answer}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Answer & Explanation in Answer Key Mode */}
      {showAnswers && (
        <div className="mt-1.5 p-2 bg-red-50/80 border-l-2 border-red-500 text-[11.5px] text-red-900 rounded-r">
          <div className="font-bold text-xs">
            정답: <span className="underline">{answer}</span>
          </div>
          <div className="text-slate-700 mt-0.5 leading-snug">{explanation}</div>
        </div>
      )}
    </div>
  );
};
