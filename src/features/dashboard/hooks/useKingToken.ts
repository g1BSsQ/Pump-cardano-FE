import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface KingToken {
  assetId: string;
  tokenName: string;
  ticker: string;
  logoUrl?: string;
  marketCap: string;
  change24h: number;
  bondingProgress: number;
  holders: number;
  volume24h: string;
  description?: string;
  headPort?: number;
  head?: {
    status: string;
  };
}

export const useKingToken = () => {
  const [kingToken, setKingToken] = useState<KingToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKingToken = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await axios.get<KingToken>(`${API_URL}/tokens/king/of-hill`);
        setKingToken(res.data);
      } catch (err: unknown) {
        console.error('Error fetching king token:', err);
        setError('Failed to load king token');
        
        // Fallback to mock data if API fails
        setKingToken({
          assetId: 'fallback',
          tokenName: 'SNEK',
          ticker: 'SNEK',
          logoUrl: '',
          marketCap: '₳2.5M',
          change24h: 156.7,
          bondingProgress: 94,
          holders: 12847,
          volume24h: '₳890K',
          description: 'The legendary meme that conquered Cardano.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKingToken();
  }, []);

  return {
    kingToken,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-trigger the effect
      setKingToken(null);
    }
  };
};