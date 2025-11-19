export interface Variant {
  value: string;
  type: 'identical' | 'autosemantic' | 'synsemantic' | 'unknown';
}

export interface WordPosition {
  latina: string;
  biblpad: string;
  variants: Record<string, Variant>;
}

export interface PsalmSheet {
  [psalmName: string]: WordPosition[];
}

export interface ManuscriptMetadata {
  full_name: string;
  date: string;
  location: string;
}

export interface SimilarityData {
  manuscripts: string[];
  similarity_matrix: number[][];
  distance_matrix: number[][];
  linkage_matrix: number[][];
  stats: {
    num_manuscripts: number;
    num_words: number;
  };
}

export interface ManuscriptStats {
  name: string;
  totalWords: number;
  identicalCount: number;
  autosemanticCount: number;
  synsemanticCount: number;
  otherCount: number;
  variationRate: number;
}

export interface FilterOptions {
  psalms: string[];
  manuscripts: string[];
  changeTypes: ('identical' | 'autosemantic' | 'synsemantic')[];
  searchTerm: string;
}
