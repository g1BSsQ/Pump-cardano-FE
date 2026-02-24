import { useState, useEffect } from 'react';
import axios from 'axios';
import type { UserProfile, TokenHolding, TokenInfo } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useProfile = (address: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedAvatar, setEditedAvatar] = useState<string | undefined>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [tokensInfo, setTokensInfo] = useState<Record<string, TokenInfo>>({});
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [createdTokensCount, setCreatedTokensCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchTokenHoldings();
    fetchCreatedTokensCount();
  }, [address]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get<UserProfile>(`${API_URL}/users/${address}/profile`);
      setProfile(res.data);
      setEditedUsername(res.data.username);
      setEditedBio(res.data.bio || '');
      setEditedAvatar(res.data.avatar);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenHoldings = async () => {
    try {
      setLoadingTokens(true);
      const res = await axios.get<TokenHolding[]>(`${API_URL}/users/${address}/tokens`);
      setTokenHoldings(res.data);

      const assetIds = res.data.map((h) => h.assetId);
      if (assetIds.length > 0) {
        const results = await Promise.all(
          assetIds.map(async (assetId) => {
            try {
              const tokenRes = await axios.get<TokenInfo>(`${API_URL}/tokens/${assetId}`);
              return { assetId, info: tokenRes.data };
            } catch {
              return null;
            }
          })
        );
        const infoMap: Record<string, TokenInfo> = {};
        results.forEach((r) => { if (r) infoMap[r.assetId] = r.info; });
        setTokensInfo(infoMap);
      }
    } catch (err) {
      console.error('Error fetching token holdings:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchCreatedTokensCount = async () => {
    try {
      const res = await axios.get<{ address: string; createdTokens: number }>(
        `${API_URL}/users/${address}/created-tokens`
      );
      setCreatedTokensCount(res.data.createdTokens);
    } catch (err) {
      console.error('Error fetching created tokens count:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put<UserProfile>(`${API_URL}/users/${address}/profile`, {
        username: editedUsername,
        bio: editedBio,
        avatar: editedAvatar,
      });
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUsername(profile?.username || '');
    setEditedBio(profile?.bio || '');
    setEditedAvatar(profile?.avatar);
    setEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image size must be less than 2MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => { setEditedAvatar(reader.result as string); setUploadingImage(false); };
    reader.onerror = () => { alert('Failed to read image'); setUploadingImage(false); };
    reader.readAsDataURL(file);
  };

  return {
    profile,
    loading,
    editing,
    setEditing,
    saving,
    editedUsername,
    setEditedUsername,
    editedBio,
    setEditedBio,
    editedAvatar,
    uploadingImage,
    tokenHoldings,
    tokensInfo,
    loadingTokens,
    createdTokensCount,
    handleSave,
    handleCancel,
    handleImageUpload,
  };
};
