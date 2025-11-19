import { useState, useEffect } from 'react';
import { decodeOptimizedData, OptimizedData } from './dataLoader';
import { WordPosition } from '../types';

interface DataState {
  psalterData: Record<string, WordPosition[]> | null;
  similarityData: any | null;
  manuscriptMetadata: any | null;
  loading: boolean;
  error: string | null;
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    psalterData: null,
    similarityData: null,
    manuscriptMetadata: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const [psalterRes, similarityRes, metadataRes] = await Promise.all([
          fetch(`${baseUrl}data/psalter_data.json`),
          fetch(`${baseUrl}data/similarity_analysis.json`),
          fetch(`${baseUrl}data/manuscript_metadata.json`),
        ]);

        if (!psalterRes.ok || !similarityRes.ok || !metadataRes.ok) {
          throw new Error('Failed to load data');
        }

        const psalterRaw = await psalterRes.json();
        const psalterDecoded = decodeOptimizedData(psalterRaw as OptimizedData);
        const similarity = await similarityRes.json();
        const metadata = await metadataRes.json();

        setState({
          psalterData: psalterDecoded,
          similarityData: similarity,
          manuscriptMetadata: metadata,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState({
          psalterData: null,
          similarityData: null,
          manuscriptMetadata: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    loadData();
  }, []);

  return state;
}
