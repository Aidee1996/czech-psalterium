import { useState, useEffect } from 'react';
import { decodeOptimizedData, OptimizedData } from './dataLoader';
import { WordPosition } from '../types';

interface DataState {
  psalterData: Record<string, WordPosition[]> | null;
  similarityData: any | null;
  manuscriptMetadata: any | null;
  verseData: any | null;
  loading: boolean;
  error: string | null;
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    psalterData: null,
    similarityData: null,
    manuscriptMetadata: null,
    verseData: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const [psalterRes, similarityRes, metadataRes, verseRes] = await Promise.all([
          fetch(`${baseUrl}data/psalter_data.json`),
          fetch(`${baseUrl}data/similarity_analysis.json`),
          fetch(`${baseUrl}data/manuscript_metadata.json`),
          fetch(`${baseUrl}data/psalm_6_verses.json`),
        ]);

        if (!psalterRes.ok || !similarityRes.ok || !metadataRes.ok || !verseRes.ok) {
          throw new Error('Failed to load data');
        }

        const psalterRaw = await psalterRes.json();
        const psalterDecoded = decodeOptimizedData(psalterRaw as OptimizedData);
        const similarity = await similarityRes.json();
        const metadata = await metadataRes.json();
        const verses = await verseRes.json();

        setState({
          psalterData: psalterDecoded,
          similarityData: similarity,
          manuscriptMetadata: metadata,
          verseData: verses,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState({
          psalterData: null,
          similarityData: null,
          manuscriptMetadata: null,
          verseData: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    loadData();
  }, []);

  return state;
}
