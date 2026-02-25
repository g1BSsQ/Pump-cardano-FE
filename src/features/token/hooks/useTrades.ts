import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  tokenAmount: string;
  adaAmount: string;
  price: string;
  traderAddress: string;
  txHash: string;
  createdAt: string;
}

export const useTrades = (assetId: string, limit: number = 50) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await axios.get<Trade[]>(`${API_URL}/pools/${assetId}/trades`, {
          params: { limit }
        });
        
        setTrades(res.data);
      } catch (err: unknown) {
        console.error('Error fetching trades:', err);
        setError('Failed to load trades');
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      fetchTrades();
      
      // Poll for new trades every 5 seconds
      const interval = setInterval(fetchTrades, 5000);
      return () => clearInterval(interval);
    }
  }, [assetId, limit]);

  return {
    trades,
    loading,
    error,
  };
};
