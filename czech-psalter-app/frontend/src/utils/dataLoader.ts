import { WordPosition, Variant } from '../types';

// Type for optimized data format
interface OptimizedWord {
  l: string;  // latina
  b: string;  // biblpad
  v: (null | [string, string])[];  // variants: null for 'X', or [value, type]
}

interface OptimizedSheet {
  manuscripts: string[];
  words: OptimizedWord[];
}

export interface OptimizedData {
  [key: string]: OptimizedSheet;
}

const TYPE_MAP: Record<string, Variant['type']> = {
  'a': 'autosemantic',
  's': 'synsemantic',
  'u': 'unknown',
  'i': 'identical',
};

export function decodeOptimizedData(data: OptimizedData): Record<string, WordPosition[]> {
  const result: Record<string, WordPosition[]> = {};

  for (const [sheetName, sheet] of Object.entries(data)) {
    const decoded: WordPosition[] = [];

    for (const word of sheet.words) {
      const variants: Record<string, Variant> = {};

      sheet.manuscripts.forEach((ms, idx) => {
        const variantData = word.v[idx];

        if (variantData === null) {
          // 'X' - identical to BiblPad
          variants[ms] = {
            value: 'X',
            type: 'identical',
          };
        } else {
          const [value, typeCode] = variantData;
          variants[ms] = {
            value,
            type: TYPE_MAP[typeCode] || 'unknown',
          };
        }
      });

      decoded.push({
        latina: word.l,
        biblpad: word.b,
        variants,
      });
    }

    result[sheetName] = decoded;
  }

  return result;
}

export function getManuscripts(data: OptimizedData, sheetName: string): string[] {
  return data[sheetName]?.manuscripts || [];
}
