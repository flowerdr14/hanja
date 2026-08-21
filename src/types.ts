export type HanjaLevel =
  | '8급'
  | '준7급'
  | '7급'
  | '준6급'
  | '6급'
  | '준5급'
  | '5급'
  | '준4급'
  | '4급'
  | '준3급'
  | '3급'
  | '준2급'
  | '2급'
  | '준1급'
  | '1급';

export type QuestionCategory =
  | 'meaning_sound'     // 훈음 (한자 -> 뜻과 음)
  | 'reading'           // 독음 (한자어 -> 읽기)
  | 'write_hanja'       // 한자 쓰기 (뜻음 -> 한자 쓰기)
  | 'words_fill'        // 한자어 (문맥 빈칸 채우기 / 사자성어)
  | 'synonym_antonym'   // 유의어 / 반의어
  | 'radical'           // 부수
  | 'strokes'           // 획수
  | 'simplified'        // 약자 / 본자
  | 'multiple_readings' // 동자이음
  | 'vowel_length';     // 장단음

export type QuestionFormat = 'multiple_choice' | 'subjective';

export interface HanjaEntry {
  id: string;
  char: string;
  sound: string;        // 음 (예: "천")
  meaning: string;      // 뜻 (예: "하늘")
  meaningSound: string; // "하늘 천"
  level: HanjaLevel;
  radical: string;      // 부수 (예: "大")
  radicalName?: string; // 부수 이름 (예: "큰대")
  strokes: number;      // 총획수
  simplified?: string;  // 약자
  vowelLength?: 'long' | 'short'; // 장단음
  multipleReadings?: { sound: string; meaning: string; context: string }[];
  synonyms?: string[];  // 유의자 (예: ["空", "宇"])
  antonyms?: string[];  // 반의자 (예: ["地"])
  words?: { word: string; reading: string; meaning: string }[]; // 대표 한자어
  exampleSentence?: { sentence: string; targetWord: string; targetHanja: string };
  strokeOrderHint?: string; // 필순 힌트
}

export interface HanjaIdiom {
  id: string;
  hanja: string;        // 예: "天地開闢", "一石二鳥"
  reading: string;      // "천지개벽", "일석이조"
  meaning: string;      // 뜻풀이
  level: HanjaLevel;
  fillIndex?: number;   // 빈칸 출제 시 기본 인덱스
  origin?: string;      // 유래/출처
}

export interface ExamConfig {
  title: string;
  level: HanjaLevel;
  questionCount: number;
  timeLimitMinutes: number;
  candidateName: string;
  examDate: string;
  selectedCategories: QuestionCategory[];
  formatMode: 'mixed' | 'multiple_choice_only' | 'subjective_only';
  choiceCount: 4 | 5;
  showWritingGrid: boolean; // 한자쓰기 문제 격자 가이드 표시
  fontSize: 'normal' | 'large' | 'compact';
  columnsPerPage: 2;
}

export interface QuestionOption {
  num: number; // 1, 2, 3, 4, 5
  symbol: string; // ①, ②, ③, ④, ⑤
  text: string;
  isAnswer: boolean;
}

export interface QuestionItem {
  id: string;
  number: number;
  category: QuestionCategory;
  format: QuestionFormat;
  categoryLabel: string; // 예: "한자 -> 뜻", "뜻 -> 한자", "독음", "부수", "약자" 등
  instruction: string;   // 예: "다음 한자를 보고 뜻과 음을 쓰시오."
  prompt: string;        // 문제 본문 (한자, 뜻음, 문장 등)
  subPrompt?: string;    // 추가 설명 또는 괄호 유도문 (예: "天 -> (        )")
  hanjaRef?: string;     // 대상 한자
  options?: QuestionOption[];
  answer: string;        // 정답 텍스트
  answerChoiceNum?: number; // 객관식 정답 번호 (1~5)
  explanation: string;   // 해설 및 힌트
  additionalInfo?: {
    radical?: string;
    strokes?: number;
    simplified?: string;
    vowelLength?: string;
    relatedWords?: string;
  };
}

export interface ExamSheet {
  id: string;
  config: ExamConfig;
  createdAt: string;
  questions: QuestionItem[];
}

export interface UserExamSubmission {
  examId: string;
  startedAt: string;
  finishedAt: string;
  timeSpentSeconds: number;
  answers: Record<number, string>; // question number -> user answer
  drawingAnswers?: Record<number, string>; // question number -> canvas data url
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  questionResults: {
    questionNumber: number;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
}
