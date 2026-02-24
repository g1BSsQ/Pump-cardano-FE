'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Edit2, Save, X, ExternalLink } from 'lucide-react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saving: boolean;
  editedUsername: string;
  setEditedUsername: (v: string) => void;
  editedBio: string;
  setEditedBio: (v: string) => void;
  editedAvatar: string | undefined;
  uploadingImage: boolean;
  createdTokensCount: number;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getShortAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;

export const ProfileHeader = ({
  profile, isOwnProfile, editing, setEditing, saving,
  editedUsername, setEditedUsername, editedBio, setEditedBio,
  editedAvatar, uploadingImage, createdTokensCount, onSave, onCancel, onImageUpload,
}: Props) => {
  const avatarSrc = editing ? editedAvatar : profile.avatar;

  return (
    <Card>
      <CardHeader className="relative">
        {isOwnProfile && !editing && (
          <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={profile.username} fill className="object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary">
                {profile.username.slice(0, 2).toUpperCase()}
              </span>
            )}
            {editing && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={uploadingImage} />
                <span className="text-white text-sm font-medium">{uploadingImage ? 'Uploading...' : 'Change'}</span>
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            {editing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} placeholder="Enter username" maxLength={50} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea value={editedBio} onChange={(e) => setEditedBio(e.target.value)} placeholder="Tell us about yourself..." rows={4} maxLength={500} />
                  <p className="text-xs text-muted-foreground text-right">{editedBio.length}/500</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={onSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={onCancel} disabled={saving}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(profile.walletAddress)}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {profile.bio && <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>}
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
                    <p className="text-2xl font-bold">{createdTokensCount}</p>
                    <p className="text-sm text-muted-foreground">Created coins</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
