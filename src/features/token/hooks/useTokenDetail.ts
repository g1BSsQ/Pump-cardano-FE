import { useState, useEffect } from 'react';
import axios from 'axios';
import { Token } from '@/features/create/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useTokenDetail = (assetId: string) => {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assetId) return;

    const fetchToken = async () => {
      try {
        setLoading(true);
        // Gọi API GET /tokens/:assetId mà bạn đã viết ở Backend
        const res = await axios.get<Token>(`${API_URL}/tokens/${assetId}`);
        setToken(res.data);
      } catch (err: unknown) {
        console.error('Error fetching token detail:', err);
        setError('Failed to load token info');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [assetId]);

  return { token, loading, error };
};