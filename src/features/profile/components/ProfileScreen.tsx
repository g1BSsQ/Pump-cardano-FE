'use client';

import { useAddress, useLovelace } from '@meshsdk/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBalances } from './ProfileBalances';

interface Props {
  address: string;
}

export const ProfileScreen = ({ address }: Props) => {
  const connectedAddress = useAddress();
  const lovelace = useLovelace();
  const lovelaceNumber = lovelace ? Number(lovelace) : undefined;
  const isOwnProfile = connectedAddress === address;

  const {
    profile, loading,
    editing, setEditing, saving,
    editedUsername, setEditedUsername,
    editedBio, setEditedBio,
    editedAvatar, uploadingImage,
    tokenHoldings, tokensInfo, loadingTokens,
    handleSave, handleCancel, handleImageUpload,
  } = useProfile(address);

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
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        editing={editing}
        setEditing={setEditing}
        saving={saving}
        editedUsername={editedUsername}
        setEditedUsername={setEditedUsername}
        editedBio={editedBio}
        setEditedBio={setEditedBio}
        editedAvatar={editedAvatar}
        uploadingImage={uploadingImage}
        onSave={handleSave}
        onCancel={handleCancel}
        onImageUpload={handleImageUpload}
      />
      <ProfileBalances
        isOwnProfile={isOwnProfile}
        lovelace={lovelaceNumber}
        tokenHoldings={tokenHoldings}
        tokensInfo={tokensInfo}
        loadingTokens={loadingTokens}
      />
    </div>
  );
};
