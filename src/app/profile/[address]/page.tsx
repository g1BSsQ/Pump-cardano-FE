'use client';

import { use } from 'react';
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  return <ProfileScreen address={address} />;
}
