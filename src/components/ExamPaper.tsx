import React from 'react';
import { ExamSheet, QuestionItem } from '../types';

interface ExamPaperProps {
  exam: ExamSheet;
  showAnswers?: boolean;
  studentName?: string;
}

export const ExamPaper: React.FC<ExamPaperProps> = ({
  exam,
  showAnswers = false,
  studentName = '',
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
              {/* Exam Header Box (Faithfully matches 번호001.png) */}
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

                  {/* Right Box: {급수}급 - {시험지 제목} */}
                  <div className="flex-1 flex items-center justify-center py-2.5 px-4">
                    <h1 className="text-xl md:text-2xl font-bold font-hanja tracking-tight text-center">
                      {config.level} - {config.title || '한자능력검정 모의평가'}
                    </h1>
                  </div>
                </div>

                {/* Sub Bar: YYYY - MM - DD and Name/Info (Matches 번호001.png) */}
                <div className="flex items-center justify-between px-4 py-1.5 text-xs font-serif bg-slate-50/30">
                  <div className="font-mono tracking-wider font-semibold">
                    {config.examDate || new Date().toISOString().split('T')[0]}
                  </div>
                  <div className="flex items-center gap-6">
                    <span>
                      시험시간: <strong className="font-mono">{config.timeLimitMinutes}분</strong>
                    </span>
                    <span>
                      성명: <span className="inline-block min-w-20 border-b border-black text-center font-bold px-2">{studentName || config.candidateName || '          '}</span>
                    </span>
                    <span>
                      점수: <span className="inline-block min-w-14 border-b border-black text-center px-1 font-mono">      / 100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-300 pb-1 mb-4 px-1 font-sans">
                <span>※ 문항에 명시된 지시사항에 따라 바르게 답안을 작성하시오.</span>
                <span>총 {questions.length}문항 중 ({pageQuestions[0]?.number || 1} ~ {pageQuestions[pageQuestions.length - 1]?.number || questions.length}번)</span>
              </div>

              {/* 2-Column Body with Center Dashed Line (Matches 번호001.png) */}
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
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{config.level} 한자능력평가 시험지</span>
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
  const { number, categoryLabel, instruction, prompt, options, answer, explanation, format, category } = question;

  return (
    <div className="break-inside-avoid text-[12px] leading-relaxed text-slate-900">
      {/* Category Section Header (Matches 번호002.png: *한자 -> 뜻*, *뜻 -> 한자*, *빈칸에 알맞은 한자 쓰기*, *선지 보고 정답 고르기*) */}
      <div className="text-[11px] font-bold text-slate-700 mb-0.5 tracking-tight">
        *{categoryLabel}*
      </div>

      {/* Question Number & Instruction (Matches 번호002.png: {번호} 다음 한자를 보고 뜻과 음을 쓰시오.) */}
      <div className="font-bold text-[12.5px] text-black mb-1.5 flex items-start">
        <span className="inline-block min-w-6 font-mono font-black text-[13px] mr-1">
          [{number}]
        </span>
        <span className="flex-1">{instruction}</span>
      </div>

      {/* Multiple Choice Options (Matches standard exam paper: ① {내용} ② {내용} ③ {내용} ④ {내용} ⑤ {내용}) */}
      {format === 'multiple_choice' && options && options.length > 0 && (
        <div className="my-1.5 pl-1.5">
          {/* Main Question Body Prompt */}
          {prompt && (
            <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 mb-2 font-medium text-center font-hanja text-[13px]">
              {prompt}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-1.5 text-[11.5px] font-sans">
            {options.map((opt) => (
              <div
                key={opt.num}
                className={`flex items-center gap-1.5 px-1 py-0.5 rounded ${
                  showAnswers && opt.isAnswer
                    ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                    : 'text-slate-800'
                }`}
              >
                <span className="font-bold text-slate-700 select-none">{opt.symbol}</span>
                <span className="font-hanja">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjective Layout with Wide Handwriting Blank (Matches authentic exam papers: spacious (              )) */}
      {format === 'subjective' && (
        <div className="my-1.5 pl-1.5 flex flex-col gap-1.5">
          {category === 'write_hanja' && showGrid ? (
            <div className="flex items-center justify-between gap-3 bg-slate-50/70 p-2 rounded border border-slate-200">
              <div className="font-medium text-slate-900 text-[13px] font-hanja flex-1">
                {prompt.replace(/→\s*\([^)]*\)/g, '').trim()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-serif">답:</span>
                {/* Chinese Character Writing 4-Quadrant Grid (田자 격자) with Generous Size */}
                <div className="hanja-grid-box w-11 h-11 border-2 border-slate-700 bg-white rounded flex items-center justify-center relative shadow-xs">
                  {showAnswers && (
                    <span className="font-hanja text-2xl font-bold text-red-600 relative z-10">
                      {answer}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="font-hanja text-[13px] bg-slate-50/80 px-3 py-2 border border-slate-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="font-medium text-slate-900 leading-normal flex-1">
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
        <div className="mt-1.5 p-1.5 bg-red-50/70 border-l-2 border-red-500 text-[10.5px] text-red-900 rounded-r">
          <div className="font-bold">
            정답: <span className="underline">{answer}</span>
          </div>
          <div className="text-slate-700 mt-0.5 leading-snug">{explanation}</div>
        </div>
      )}
    </div>
  );
};
