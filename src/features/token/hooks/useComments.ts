import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    walletAddress: string;
    username: string;
    avatar: string | null;
  };
}

export const useComments = (assetId: string, limit: number = 50) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    if (!assetId) return;
    
    try {
      // Always show loading during fetch
      setLoading(true);
      setError('');
      
      const res = await axios.get<Comment[]>(`${API_URL}/pools/${assetId}/comments`, {
        params: { limit }
      });
      
      setComments(res.data);
    } catch (err: unknown) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [assetId, limit]); // Removed comments.length dependency to avoid infinite loops if logic changes

  useEffect(() => {
    fetchComments();
    
    // Poll for new comments every 10 seconds
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [fetchComments]);

  const postComment = async (userWalletAddress: string, content: string) => {
    try {
      const res = await axios.post<Comment>(`${API_URL}/pools/${assetId}/comments`, {
        userWalletAddress,
        content
      });
      
      // Add new comment to the list immediately
      setComments(prev => [res.data, ...prev]);
      return res.data;
    } catch (err: unknown) {
      console.error('Error posting comment:', err);
      throw err;
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      await axios.post(`${API_URL}/pools/comments/${commentId}/like`);
      
      // Update local state
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ));
    } catch (err: unknown) {
      console.error('Error liking comment:', err);
    }
  };

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    postComment,
    likeComment
  };
};
