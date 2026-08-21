import { HanjaEntry } from '../types';
import { HANJA_GRADE_8_TO_7 } from './levelDatasets/grade8to7';
import { HANJA_GRADE_6_TO_5 } from './levelDatasets/grade6to5';
import { HANJA_GRADE_4_TO_3 } from './levelDatasets/grade4to3';
import { HANJA_GRADE_2_TO_1 } from './levelDatasets/grade2to1';

// Merge all standardized level datasets into one master database
const rawEntries: HanjaEntry[] = [
  ...HANJA_GRADE_8_TO_7,
  ...HANJA_GRADE_6_TO_5,
  ...HANJA_GRADE_4_TO_3,
  ...HANJA_GRADE_2_TO_1,
];

// Deduplicate by char (keep the first or most detailed entry per char)
const seenChars = new Set<string>();
const uniqueDatabase: HanjaEntry[] = [];

for (const entry of rawEntries) {
  if (!seenChars.has(entry.char)) {
    seenChars.add(entry.char);
    uniqueDatabase.push(entry);
  }
}

export const HANJA_DATABASE: HanjaEntry[] = uniqueDatabase;
