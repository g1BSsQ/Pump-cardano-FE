import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Token } from '@/features/create/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useTokenDetail = (assetId: string) => {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchToken = useCallback(async (isInitial = false) => {
    if (!assetId) return;

    try {
      // Chỉ bật loading (spinner) ở lần load trang đầu tiên
      if (isInitial) setLoading(true);
      
      const res = await axios.get<Token>(`${API_URL}/tokens/${assetId}`);
      setToken(res.data);
      setError('');
    } catch (err: unknown) {
      console.error('Error fetching token detail:', err);
      setError('Failed to load token info');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    // 1. Kéo data lần đầu tiên khi mới vào trang
    fetchToken(true);

    // 2. Thiết lập chạy ngầm: Tự động cập nhật data mỗi 5 giây
    const interval = setInterval(() => {
      fetchToken(false); // Fetch ngầm (không làm chớp màn hình loading)
    }, 5000);

    // Dọn dẹp khi user thoát trang
    return () => clearInterval(interval);
  }, [fetchToken]);

  return { token, loading, error, refetch: () => fetchToken(true) };
};