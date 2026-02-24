import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TokensResponse, Token } from '@/features/create/types'; // Import đúng đường dẫn type của bạn

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UseTokensParams {
  page?: number;
  limit?: number;
  search?: string;
  headPort?: number;
}

export const useTokens = (initialParams?: UseTokensParams) => {
  const [data, setData] = useState<Token[]>([]);
  const [meta, setMeta] = useState<TokensResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State lưu params hiện tại để gọi lại khi cần (VD: đổi trang)
  const [params, setParams] = useState<UseTokensParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialParams
  });

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get<TokensResponse>(`${API_URL}/tokens`, {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          headPort: params.headPort
        }
      });

      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: unknown) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Tự động fetch khi params thay đổi
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Hàm tiện ích để đổi trang, search
  const setPage = (page: number) => setParams(prev => ({ ...prev, page }));
  const setSearch = (search: string) => setParams(prev => ({ ...prev, search, page: 1 })); // Reset về trang 1 khi search

  return {
    tokens: data,
    meta,
    loading,
    error,
    params,
    setPage,
    setSearch,
    refresh: fetchTokens
  };
};