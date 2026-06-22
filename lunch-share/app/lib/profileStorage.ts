'use client';

import { supabase } from './supabaseClient';

export type StoredProfile = {
  name: string;
  avatarSrc: string | null;
};

type ProfileRow = {
  name: string | null;
  avatar_url: string | null;
};

const PROFILE_STORAGE_KEY = 'meating.profile';
const PROFILE_AVATAR_BUCKET = 'profile-avatars';
const DEFAULT_PROFILE: StoredProfile = {
  name: 'ささき しょうま',
  avatarSrc: null,
};

export const PROFILE_UPDATED_EVENT = 'meating-profile-updated';

export function loadStoredProfile(): StoredProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!rawProfile) return DEFAULT_PROFILE;

  try {
    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(rawProfile),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function persistLocalProfile(profile: StoredProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

function normalizeProfile(row: ProfileRow | null): StoredProfile {
  return {
    name: row?.name?.trim() || DEFAULT_PROFILE.name,
    avatarSrc: row?.avatar_url ?? null,
  };
}

export async function loadUserProfile(): Promise<StoredProfile> {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  const localProfile = loadStoredProfile();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return localProfile;

  const { data, error } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return localProfile;

  const profile = normalizeProfile(data as ProfileRow | null);
  persistLocalProfile(profile);
  return profile;
}

export async function saveUserProfile(
  profile: Partial<StoredProfile>,
): Promise<StoredProfile> {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;

  const currentProfile = loadStoredProfile();
  const nextProfile = {
    ...currentProfile,
    ...profile,
    name: profile.name?.trim() || currentProfile.name,
  };

  persistLocalProfile(nextProfile);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) return nextProfile;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: nextProfile.name,
    avatar_url: nextProfile.avatarSrc,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`プロフィールの保存に失敗しました: ${error.message}`);

  return nextProfile;
}

export async function uploadProfileAvatar(file: File): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    const dataUrl = await readImageAsDataUrl(file);
    await saveUserProfile({ avatarSrc: dataUrl });
    return dataUrl;
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${user.id}/${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'image/png',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`アイコンのアップロードに失敗しました: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  await saveUserProfile({ avatarSrc: publicUrl });
  return publicUrl;
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('画像の読み込みに失敗しました。'));
    };
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
    reader.readAsDataURL(file);
  });
}
