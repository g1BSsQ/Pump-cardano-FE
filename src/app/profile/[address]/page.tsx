'use client';

import { use, useState, useEffect } from 'react';
import { useAddress, useLovelace } from '@meshsdk/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit2, Save, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UserProfile {
  walletAddress: string;
  username: string;
  bio: string;
  avatar?: string;
  createdAt: string;
}

interface TokenHolding {
  assetId: string;
  amount: string;
}

interface TokenInfo {
  assetId: string;
  tokenName: string;
  ticker: string;
  logoUrl?: string;
  currentPrice: string;
  decimals: number;
}

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const address = resolvedParams.address;
  const connectedAddress = useAddress();
  const lovelace = useLovelace();
  const router = useRouter();

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

  const isOwnProfile = connectedAddress === address;

  useEffect(() => {
    fetchProfile();
    fetchTokenHoldings();
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

      // Fetch token info for each holding
      const assetIds = res.data.map(h => h.assetId);
      if (assetIds.length > 0) {
        const tokenInfoPromises = assetIds.map(async (assetId) => {
          try {
            const tokenRes = await axios.get<TokenInfo>(`${API_URL}/tokens/${assetId}`);
            return { assetId, info: tokenRes.data };
          } catch (err) {
            console.error(`Error fetching token ${assetId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(tokenInfoPromises);
        const infoMap: Record<string, TokenInfo> = {};
        results.forEach((result) => {
          if (result) {
            infoMap[result.assetId] = result.info;
          }
        });
        setTokensInfo(infoMap);
      }
    } catch (err) {
      console.error('Error fetching token holdings:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleSave = async () => {
    if (!isOwnProfile) return;

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

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedAvatar(reader.result as string);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      alert('Failed to read image');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const getShortAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatTokenAmount = (amount: string, decimals: number = 0) => {
    const num = Number(amount) / Math.pow(10, decimals);
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(decimals > 0 ? 2 : 0);
  };

  const formatADA = (lovelaceAmount: number | undefined) => {
    if (!lovelaceAmount) return '0.00';
    return (lovelaceAmount / 1_000_000).toFixed(2);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-lg text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="relative">
          {isOwnProfile && !editing && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              {(editing ? editedAvatar : profile.avatar) ? (
                <Image
                  src={(editing ? editedAvatar : profile.avatar) || ''}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {profile.username.slice(0, 2).toUpperCase()}
                </span>
              )}
              {editing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <span className="text-white text-sm font-medium">
                    {uploadingImage ? 'Uploading...' : 'Change'}
                  </span>
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 w-full">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      placeholder="Enter username"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {editedBio.length}/500
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{getShortAddress(profile.walletAddress)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.walletAddress);
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                  )}

                  <div className="flex gap-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Created coins</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balances Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Balances</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* ADA Balance - from wallet */}
            {isOwnProfile && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">₳</span>
                  </div>
                  <div>
                    <p className="font-semibold">Cardano</p>
                    <p className="text-xs text-muted-foreground">ADA</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{formatADA(lovelace)} ADA</p>
                  <p className="text-xs text-muted-foreground">From Wallet</p>
                </div>
              </div>
            )}

            {/* Token Holdings - from database */}
            {loadingTokens ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : tokenHoldings.length > 0 ? (
              tokenHoldings.map((holding) => {
                const tokenInfo = tokensInfo[holding.assetId];
                if (!tokenInfo) return null;

                const amount = formatTokenAmount(holding.amount, tokenInfo.decimals);
                const value = (Number(holding.amount) / Math.pow(10, tokenInfo.decimals)) * Number(tokenInfo.currentPrice);

                return (
                  <div
                    key={holding.assetId}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/token/${holding.assetId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                        {tokenInfo.logoUrl ? (
                          <Image
                            src={tokenInfo.logoUrl}
                            alt={tokenInfo.tokenName}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {tokenInfo.ticker?.slice(0, 2).toUpperCase() || '??'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{tokenInfo.tokenName}</p>
                        <p className="text-xs text-muted-foreground">{tokenInfo.ticker}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{amount} {tokenInfo.ticker}</p>
                      <p className="text-xs text-muted-foreground">
                        ≈ {value.toFixed(2)} ADA
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No token holdings found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
