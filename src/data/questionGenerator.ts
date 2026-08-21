import {
  ExamConfig,
  ExamSheet,
  HanjaEntry,
  HanjaLevel,
  QuestionCategory,
  QuestionFormat,
  QuestionItem,
  QuestionOption,
} from '../types';
import { HANJA_DATABASE } from './hanjaMasterList';
import { EXTENDED_HANJA_DATA } from './hanjaExtendedDataset';
import { IDIOMS_DATABASE } from './idiomsList';
import { HANJA_LEVELS } from './levelStandards';

const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤'];

// Combine all datasets
export const ALL_HANJA_ENTRIES: HanjaEntry[] = [...HANJA_DATABASE, ...EXTENDED_HANJA_DATA];

// Deduplicate by char
const UNIQUE_HANJA_MAP = new Map<string, HanjaEntry>();
ALL_HANJA_ENTRIES.forEach((h) => {
  if (!UNIQUE_HANJA_MAP.has(h.char)) {
    UNIQUE_HANJA_MAP.set(h.char, h);
  }
});
export const ALL_UNIQUE_HANJA = Array.from(UNIQUE_HANJA_MAP.values());

// Helper to check if level a is within or equal to level b
function getLevelIndex(level: HanjaLevel): number {
  const idx = HANJA_LEVELS.indexOf(level as any);
  return idx >= 0 ? idx : 0;
}

export function getHanjaUpToLevel(targetLevel: HanjaLevel): HanjaEntry[] {
  if (targetLevel === '선택') {
    return [];
  }
  const targetIdx = getLevelIndex(targetLevel);
  return ALL_UNIQUE_HANJA.filter((h) => getLevelIndex(h.level) <= targetIdx);
}

export function getHanjaExactLevel(targetLevel: HanjaLevel): HanjaEntry[] {
  if (targetLevel === '선택') {
    return [];
  }
  return ALL_UNIQUE_HANJA.filter((h) => h.level === targetLevel);
}

// Construct an authentic exam pool heavily weighted towards the selected level
export function getHanjaPoolForExam(targetLevel: HanjaLevel): HanjaEntry[] {
  if (targetLevel === '선택') {
    return [];
  }
  const exact = getHanjaExactLevel(targetLevel);
  const upTo = getHanjaUpToLevel(targetLevel);

  if (exact.length >= 25) {
    // If enough exact level characters, mix 70% exact level + 30% cumulative level
    const exactShuffled = shuffle(exact);
    const cumulativeShuffled = shuffle(upTo.filter((h) => h.level !== targetLevel));
    return [...exactShuffled, ...cumulativeShuffled];
  } else if (upTo.length > 0) {
    return shuffle(upTo);
  }
  return ALL_UNIQUE_HANJA;
}

// Random shuffle array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate options for multiple choice questions
function createOptions(
  correctText: string,
  distractors: string[],
  choiceCount: 4 | 5
): { options: QuestionOption[]; answerChoiceNum: number } {
  const uniqueDistractors = Array.from(new Set(distractors)).filter(
    (d) => d && d.trim() !== correctText.trim()
  );
  const pickedDistractors = shuffle(uniqueDistractors).slice(0, choiceCount - 1);

  // If not enough distractors, pad with fallback
  while (pickedDistractors.length < choiceCount - 1) {
    pickedDistractors.push(`보기 ${pickedDistractors.length + 2}`);
  }

  const rawOptions = [
    { text: correctText, isAnswer: true },
    ...pickedDistractors.map((d) => ({ text: d, isAnswer: false })),
  ];

  const shuffledOptions = shuffle(rawOptions);
  let answerChoiceNum = 1;

  const options: QuestionOption[] = shuffledOptions.map((opt, idx) => {
    const num = idx + 1;
    if (opt.isAnswer) answerChoiceNum = num;
    return {
      num,
      symbol: CIRCLE_NUMBERS[idx] || `(${num})`,
      text: opt.text,
      isAnswer: opt.isAnswer,
    };
  });

  return { options, answerChoiceNum };
}

export function generateExamSheet(config: ExamConfig): ExamSheet {
  // If '선택', initially no questions
  if (config.level === '선택') {
    return {
      id: `exam-${Date.now()}`,
      config,
      createdAt: new Date().toISOString(),
      questions: [],
    };
  }

  const hanjaPool = getHanjaPoolForExam(config.level);
  const effectivePool = hanjaPool.length > 0 ? hanjaPool : ALL_UNIQUE_HANJA;

  // Selected categories
  const categories =
    config.selectedCategories.length > 0
      ? config.selectedCategories
      : (['meaning_sound', 'reading', 'write_hanja', 'words_fill'] as QuestionCategory[]);

  const questions: QuestionItem[] = [];
  const targetCount = Math.max(1, config.questionCount);

  // Shuffle pools
  let shuffledHanja = shuffle(effectivePool);
  let hanjaPointer = 0;

  function nextHanja(): HanjaEntry {
    if (hanjaPointer >= shuffledHanja.length) {
      shuffledHanja = shuffle(effectivePool);
      hanjaPointer = 0;
    }
    return shuffledHanja[hanjaPointer++];
  }

  const targetLevelIdx = getLevelIndex(config.level);
  let idiomPool = shuffle(
    IDIOMS_DATABASE.filter((idm) => getLevelIndex(idm.level) <= targetLevelIdx)
  );
  if (idiomPool.length === 0) {
    idiomPool = shuffle(IDIOMS_DATABASE);
  }
  let idiomPointer = 0;

  function nextIdiom() {
    if (idiomPointer >= idiomPool.length) {
      idiomPool = shuffle(IDIOMS_DATABASE.filter((idm) => getLevelIndex(idm.level) <= targetLevelIdx));
      if (idiomPool.length === 0) idiomPool = shuffle(IDIOMS_DATABASE);
      idiomPointer = 0;
    }
    return idiomPool[idiomPointer++];
  }

  // Pre-collect distractor pools strictly from the level's effective pool
  const allMeanings = effectivePool.map((h) => h.meaningSound);
  const allReadings = effectivePool.map((h) => h.sound);
  const allWords = effectivePool.flatMap((h) => h.words?.map((w) => w.reading) || []);
  const allRadicals = effectivePool.map((h) => h.radical);

  for (let i = 0; i < targetCount; i++) {
    const qNum = i + 1;
    const category = categories[i % categories.length];

    // Determine format based on config
    let format: QuestionFormat = 'subjective';
    if (config.formatMode === 'multiple_choice_only') {
      format = 'multiple_choice';
    } else if (config.formatMode === 'subjective_only') {
      format = 'subjective';
    } else {
      // Mixed mode: 50% multiple choice, 50% subjective, or alternating
      format = i % 2 === 0 ? 'subjective' : 'multiple_choice';
    }

    const item = buildQuestionItem({
      qNum,
      category,
      format,
      choiceCount: config.choiceCount,
      nextHanja,
      nextIdiom,
      allHanja: effectivePool,
      allMeanings,
      allReadings,
      allWords,
      allRadicals,
      config,
    });

    questions.push(item);
  }

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    config,
    createdAt: new Date().toISOString(),
    questions,
  };
}

interface BuildQuestionParams {
  qNum: number;
  category: QuestionCategory;
  format: QuestionFormat;
  choiceCount: 4 | 5;
  nextHanja: () => HanjaEntry;
  nextIdiom: () => typeof IDIOMS_DATABASE[0];
  allHanja: HanjaEntry[];
  allMeanings: string[];
  allReadings: string[];
  allWords: string[];
  allRadicals: string[];
  config: ExamConfig;
}

function buildQuestionItem(params: BuildQuestionParams): QuestionItem {
  const {
    qNum,
    category,
    format,
    choiceCount,
    nextHanja,
    nextIdiom,
    allHanja,
    allMeanings,
    allReadings,
    allWords,
    allRadicals,
  } = params;

  switch (category) {
    case 'meaning_sound': {
      // 훈음 (한자 -> 뜻과 음)
      const h = nextHanja();
      const answer = h.meaningSound;
      const categoryLabel = '한자 -> 뜻·음';
      const instruction = '다음 한자를 보고 뜻과 음을 쓰시오.';
      const prompt = `${h.char}  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = allHanja
          .filter((x) => x.char !== h.char)
          .map((x) => x.meaningSound);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 한자의 올바른 뜻과 음을 고르시오.',
          prompt: `【 ${h.char} 】`,
          hanjaRef: h.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${h.char}]의 뜻과 음은 '${h.meaningSound}'입니다. (부수: ${h.radical}, 총 ${h.strokes}획)`,
          additionalInfo: { radical: h.radical, strokes: h.strokes },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: h.char,
        answer,
        explanation: `[${h.char}]의 뜻과 음은 '${h.meaningSound}'입니다. (부수: ${h.radical}, 총 ${h.strokes}획)`,
        additionalInfo: { radical: h.radical, strokes: h.strokes },
      };
    }

    case 'write_hanja': {
      // 뜻 -> 한자 (한자 쓰기)
      const h = nextHanja();
      const answer = h.char;
      const categoryLabel = '뜻·음 -> 한자';
      const instruction = '다음 뜻과 음을 보고 알맞은 한자를 쓰시오.';
      const prompt = `[ ${h.meaningSound} ]  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = allHanja.filter((x) => x.char !== h.char).map((x) => x.char);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 뜻과 음에 해당하는 한자를 고르시오.',
          prompt: `【 ${h.meaningSound} 】`,
          hanjaRef: h.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `'${h.meaningSound}'에 해당하는 한자는 [${h.char}]입니다. (부수: ${h.radical})`,
          additionalInfo: { radical: h.radical, strokes: h.strokes },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: h.char,
        answer,
        explanation: `'${h.meaningSound}'의 한자는 [${h.char}]입니다. 부수는 [${h.radical}], 총 ${h.strokes}획입니다.`,
        additionalInfo: { radical: h.radical, strokes: h.strokes },
      };
    }

    case 'reading': {
      // 독음 (한자어 -> 읽는 소리)
      const h = nextHanja();
      const wordObj = h.words && h.words.length > 0 ? h.words[0] : { word: `${h.char}字`, reading: `${h.sound}자`, meaning: '한자' };
      const answer = wordObj.reading;
      const categoryLabel = '한자어 독음';
      const instruction = '다음 밑줄 친 한자어의 올바른 독음(읽는 소리)을 쓰시오.';
      const prompt = `【 ${wordObj.word} 】  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = allWords.filter((w) => w !== answer && w.length === answer.length);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 한자어의 올바른 독음을 고르시오.',
          prompt: `【 ${wordObj.word} 】`,
          hanjaRef: wordObj.word,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${wordObj.word}]의 올바른 독음은 '${wordObj.reading}'(${wordObj.meaning})입니다.`,
          additionalInfo: { relatedWords: wordObj.meaning },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: wordObj.word,
        answer,
        explanation: `[${wordObj.word}]의 독음은 '${wordObj.reading}'입니다. 뜻: ${wordObj.meaning}`,
        additionalInfo: { relatedWords: wordObj.meaning },
      };
    }

    case 'words_fill': {
      // 한자어 / 빈칸에 알맞은 한자 쓰기
      const idiom = nextIdiom();
      const targetChar = idiom.hanja[idiom.fillIndex ?? 0] || idiom.hanja[0];
      const maskedHanja = idiom.hanja.split('').map((c, i) => (i === (idiom.fillIndex ?? 0) ? '(        )' : c)).join(' ');
      const answer = targetChar;
      const categoryLabel = '빈칸에 알맞은 한자 쓰기';
      const instruction = '다음을 보고 빈칸에 알맞은 한자를 쓰시오.';
      const prompt = `${maskedHanja}  [뜻: ${idiom.meaning}]`;

      if (format === 'multiple_choice') {
        const distractors = allHanja.filter((x) => x.char !== answer).map((x) => x.char);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 고사성어의 빈칸에 들어갈 알맞은 한자를 고르시오.',
          prompt: `${maskedHanja}\n- 뜻: ${idiom.meaning}`,
          hanjaRef: idiom.hanja,
          options,
          answer,
          answerChoiceNum,
          explanation: `정답은 [${answer}]입니다. 전체 고사성어는 [${idiom.hanja}(${idiom.reading})]이며, 뜻은 '${idiom.meaning}'입니다.`,
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: idiom.hanja,
        answer,
        explanation: `정답 한자는 [${answer}]입니다. 완성된 고사성어: [${idiom.hanja}(${idiom.reading})] - ${idiom.meaning}`,
      };
    }

    case 'synonym_antonym': {
      // 반의어 / 유의어
      const candidates = allHanja.filter((h) => (h.antonyms && h.antonyms.length > 0) || (h.synonyms && h.synonyms.length > 0));
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || allHanja[0];
      const isAntonym = Boolean(chosen.antonyms && chosen.antonyms.length > 0);
      const targetChar = isAntonym ? chosen.antonyms![0] : (chosen.synonyms ? chosen.synonyms[0] : '小');
      const relationText = isAntonym ? '상대(반대)' : '유의(비슷한)';
      const answer = targetChar;
      const targetEntry = allHanja.find((x) => x.char === targetChar);

      const categoryLabel = `유의·반의 (${relationText})`;
      const instruction = `다음 한자와 뜻이 ${relationText}되는 한자를 쓰시오.`;
      const prompt = `【 ${chosen.char} (${chosen.meaningSound}) 】 ↔ (        )`;

      if (format === 'multiple_choice') {
        const distractors = allHanja.filter((x) => x.char !== answer && x.char !== chosen.char).map((x) => x.char);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: `다음 한자와 뜻이 ${relationText}되는 알맞은 한자를 고르시오.`,
          prompt: `【 ${chosen.char} (${chosen.meaningSound}) 】 의 ${relationText}자`,
          hanjaRef: chosen.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${chosen.char}(${chosen.meaningSound})]와 ${relationText} 관계인 한자는 [${answer}${targetEntry ? `(${targetEntry.meaningSound})` : ''}]입니다.`,
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: chosen.char,
        answer,
        explanation: `[${chosen.char}(${chosen.meaningSound})]와 ${relationText} 한자는 [${answer}${targetEntry ? `(${targetEntry.meaningSound})` : ''}]입니다.`,
      };
    }

    case 'radical': {
      // 부수
      const h = nextHanja();
      const answer = h.radical;
      const categoryLabel = '부수 (部首)';
      const instruction = '다음 한자의 부수(部首)를 쓰시오.';
      const prompt = `【 ${h.char} (${h.meaningSound}) 】 의 부수  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = allRadicals.filter((r) => r !== answer);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 한자의 올바른 부수를 고르시오.',
          prompt: `【 ${h.char} (${h.meaningSound}) 】`,
          hanjaRef: h.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${h.char}]의 부수는 [${h.radical}${h.radicalName ? `(${h.radicalName})` : ''}]입니다. (총 ${h.strokes}획)`,
          additionalInfo: { radical: h.radical, strokes: h.strokes },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: h.char,
        answer,
        explanation: `[${h.char}]의 부수는 [${h.radical}${h.radicalName ? `(${h.radicalName})` : ''}]입니다.`,
        additionalInfo: { radical: h.radical, strokes: h.strokes },
      };
    }

    case 'strokes': {
      // 획수
      const h = nextHanja();
      const answer = `${h.strokes}획`;
      const categoryLabel = '총 획수(劃數)';
      const instruction = '다음 한자의 총 획수를 쓰시오.';
      const prompt = `【 ${h.char} (${h.meaningSound}) 】 의 총 획수  →  (                  )획`;

      if (format === 'multiple_choice') {
        const distractors = [
          `${Math.max(1, h.strokes - 1)}획`,
          `${h.strokes + 1}획`,
          `${h.strokes + 2}획`,
          `${Math.max(1, h.strokes - 2)}획`,
        ];
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 한자의 총 획수로 알맞은 것을 고르시오.',
          prompt: `【 ${h.char} (${h.meaningSound}) 】`,
          hanjaRef: h.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${h.char}]의 총 획수는 [${h.strokes}획]입니다. (부수: ${h.radical})`,
          additionalInfo: { strokes: h.strokes },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: h.char,
        answer,
        explanation: `[${h.char}]의 총 획수는 [${h.strokes}획]입니다. (부수: ${h.radical})`,
        additionalInfo: { strokes: h.strokes },
      };
    }

    case 'simplified': {
      // 약자
      const candidates = allHanja.filter((h) => h.simplified && h.simplified !== h.char);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || {
        char: '學',
        simplified: '学',
        meaningSound: '배울 학',
        radical: '子',
        strokes: 16,
      };
      const answer = chosen.simplified!;
      const categoryLabel = '약자 (略字)';
      const instruction = '다음 본자(정자)에 해당하는 약자(略字)를 쓰시오.';
      const prompt = `【 ${chosen.char} (${chosen.meaningSound}) 】 의 약자  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = allHanja
          .filter((x) => x.char !== answer && x.char !== chosen.char)
          .map((x) => x.simplified || x.char);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 본자에 해당하는 약자를 고르시오.',
          prompt: `【 ${chosen.char} (${chosen.meaningSound}) 】`,
          hanjaRef: chosen.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `정자 [${chosen.char}]의 약자는 [${chosen.simplified}]입니다.`,
          additionalInfo: { simplified: chosen.simplified },
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: chosen.char,
        answer,
        explanation: `본자 [${chosen.char}]의 약자는 [${chosen.simplified}]입니다.`,
        additionalInfo: { simplified: chosen.simplified },
      };
    }

    case 'multiple_readings': {
      // 동자이음
      const candidates = allHanja.filter((h) => h.multipleReadings && h.multipleReadings.length >= 2);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || {
        char: '樂',
        meaningSound: '즐길 락 / 음악 악 / 좋아할 요',
        multipleReadings: [
          { sound: '악', meaning: '음악', context: '音樂(음악)' },
          { sound: '락', meaning: '즐거움', context: '快樂(쾌락)' },
          { sound: '요', meaning: '좋아함', context: '樂山樂水(요산요수)' },
        ],
      };

      const readingItem = chosen.multipleReadings![Math.floor(Math.random() * chosen.multipleReadings!.length)];
      const answer = readingItem.sound;
      const categoryLabel = '동자이음 (同字異音)';
      const instruction = '다음 단어에서 한자의 올바른 소리(독음)를 쓰시오.';
      const prompt = `【 ${readingItem.context.split('(')[0]} 】 에서 [ ${chosen.char} ]의 독음  →  (        )`;

      if (format === 'multiple_choice') {
        const distractors = ['락', '악', '요', '살', '쇄', '차', '거', '북', '배', '역', '이'].filter((s) => s !== answer);
        const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
        return {
          id: `q-${qNum}`,
          number: qNum,
          category,
          format,
          categoryLabel: '선지 보고 정답 고르기',
          instruction: '다음 문맥에서 한자의 올바른 독음을 고르시오.',
          prompt: `【 ${readingItem.context.split('(')[0]} 】 의 '${chosen.char}'`,
          hanjaRef: chosen.char,
          options,
          answer,
          answerChoiceNum,
          explanation: `[${chosen.char}]는 뜻에 따라 음이 달라집니다. '${readingItem.context}'에서는 '${answer}'(${readingItem.meaning})으로 읽습니다.`,
        };
      }

      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format,
        categoryLabel,
        instruction,
        prompt,
        hanjaRef: chosen.char,
        answer,
        explanation: `[${chosen.char}]는 ${readingItem.context}에서 '${answer}'(${readingItem.meaning})으로 발음됩니다.`,
      };
    }

    case 'vowel_length': {
      // 장단음
      const longList = [
        { word: '言語 (언어)', isLong: true, reason: '말씀 언(言)은 첫음절에서 장음(:)' },
        { word: '敎育 (교육)', isLong: true, reason: '가르칠 교(敎)는 첫음절에서 장음(:)' },
        { word: '天地 (천지)', isLong: true, reason: '하늘 천(天)은 첫음절에서 장음(:)' },
        { word: '日光 (일광)', isLong: false, reason: '날 일(日)은 단음' },
        { word: '水泳 (수영)', isLong: false, reason: '물 수(水)는 단음' },
        { word: '火山 (화산)', isLong: false, reason: '불 화(火)는 단음' },
        { word: '人間 (인간)', isLong: false, reason: '사람 인(人)은 단음' },
      ];

      const correctLong = longList.filter((x) => x.isLong)[Math.floor(Math.random() * 3)];
      const distractors = longList.filter((x) => !x.isLong).map((x) => x.word);
      const answer = correctLong.word;
      const categoryLabel = '장단음 (長短音)';
      const instruction = '다음 중 첫음절이 장음(긴소리[:])으로 발음되는 한자어를 고르시오.';
      const prompt = `첫음절이 길게 소리 나는 낱말은?`;

      const { options, answerChoiceNum } = createOptions(answer, distractors, choiceCount);
      return {
        id: `q-${qNum}`,
        number: qNum,
        category,
        format: 'multiple_choice',
        categoryLabel: '선지 보고 정답 고르기',
        instruction,
        prompt,
        options,
        answer,
        answerChoiceNum,
        explanation: `정답은 [${answer}]입니다. ${correctLong.reason}.`,
      };
    }

    default: {
      const h = nextHanja();
      return {
        id: `q-${qNum}`,
        number: qNum,
        category: 'meaning_sound',
        format,
        categoryLabel: '한자 -> 뜻·음',
        instruction: '다음 한자를 보고 뜻과 음을 쓰시오.',
        prompt: `${h.char}  →  (        )`,
        hanjaRef: h.char,
        answer: h.meaningSound,
        explanation: `[${h.char}]의 뜻과 음은 '${h.meaningSound}'입니다.`,
      };
    }
  }
}
