import { HanjaEntry } from '../../types';

// === 준2급, 2급, 준1급, 1급 배정한자 표준 데이터셋 ===
export const HANJA_GRADE_2_TO_1: HanjaEntry[] = [
  // ----------------------------------------------------
  // [준2급 배정한자 신출]
  // ----------------------------------------------------
  {
    id: '2j-01',
    char: '迦',
    sound: '가',
    meaning: '부처이름',
    meaningSound: '부처이름 가',
    level: '준2급',
    radical: '辵',
    radicalName: '책받침',
    strokes: 9,
    words: [
      { word: '釋迦牟尼', reading: '석가모니', meaning: '불교의 개조' },
    ],
  },
  {
    id: '2j-02',
    char: '珏',
    sound: '각',
    meaning: '쌍옥',
    meaningSound: '쌍옥 각',
    level: '준2급',
    radical: '玉',
    radicalName: '구슬옥',
    strokes: 9,
    words: [
      { word: '雙珏', reading: '쌍각', meaning: '쌍을 이룬 옥' },
    ],
  },
  {
    id: '2j-03',
    char: '侃',
    sound: '간',
    meaning: '강직할',
    meaningSound: '강직할 간',
    level: '준2급',
    radical: '人',
    radicalName: '사람인',
    strokes: 8,
    words: [
      { word: '侃直', reading: '간직', meaning: '강직하고 바름' },
    ],
  },

  // ----------------------------------------------------
  // [2급 배정한자 신출]
  // ----------------------------------------------------
  {
    id: '2-01',
    char: '疳',
    sound: '감',
    meaning: '감질/어린이병',
    meaningSound: '감질 감',
    level: '2급',
    radical: '疒',
    radicalName: '병질엄',
    strokes: 10,
    words: [
      { word: '疳氣', reading: '감기', meaning: '어린아이의 만성 소화불량' },
      { word: '疳疾', reading: '감질', meaning: '몹시 먹고 싶거나 탐나는 마음' },
    ],
  },
  {
    id: '2-02',
    char: '瞰',
    sound: '감',
    meaning: '굽어볼/내려다볼',
    meaningSound: '굽어볼 감',
    level: '2급',
    radical: '目',
    radicalName: '눈목',
    strokes: 17,
    words: [
      { word: '俯瞰', reading: '부감', meaning: '높은 곳에서 내려다봄' },
      { word: '鳥瞰圖', reading: '조감도', meaning: '새의 눈으로 내려다본 그림' },
    ],
  },

  // ----------------------------------------------------
  // [준1급 배정한자 신출]
  // ----------------------------------------------------
  {
    id: '1j-01',
    char: '珂',
    sound: '가',
    meaning: '옥이름/마노',
    meaningSound: '옥이름 가',
    level: '준1급',
    radical: '玉',
    radicalName: '구슬옥',
    strokes: 9,
    words: [
      { word: '珂珮', reading: '가패', meaning: '옥으로 만든 패물' },
    ],
  },

  // ----------------------------------------------------
  // [1급 배정한자 신출]
  // ----------------------------------------------------
  {
    id: '1-01',
    char: '痂',
    sound: '가',
    meaning: '부스럼딱지',
    meaningSound: '부스럼딱지 가',
    level: '1급',
    radical: '疒',
    radicalName: '병질엄',
    strokes: 10,
    words: [
      { word: '痂皮', reading: '가피', meaning: '상처에 생기는 딱지' },
    ],
  },
  {
    id: '1-02',
    char: '苛',
    sound: '가',
    meaning: '가혹할',
    meaningSound: '가혹할 가',
    level: '1급',
    radical: '艸',
    radicalName: '초두머리',
    strokes: 9,
    words: [
      { word: '苛酷', reading: '가혹', meaning: '가혹함' },
    ],
  },
];
