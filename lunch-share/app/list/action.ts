'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type Shop = {
  id: string;
  name: string;
  postalCode: string;
  address: string;
  category: string;
  comment?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  ownerId: string;
  ownerName: string;
};

type CreateShopInput = {
  userId: string;
  name: string;
  category?: string;
  address?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
};

type ShopRow = {
  id: string | number;
  name: string | null;
  postal_code?: string | null;
  postalCode?: string | null;
  address?: string | null;
  category?: string | null;
  comment?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
  createdAt?: string | null;
  user_id?: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
};

type MembershipRow = {
  group_id: string;
  user_id: string;
  created_at: string;
};

function toShop(
  row: ShopRow,
  owners: Map<string, ProfileRow>,
): Shop {
  const ownerId = String(row.user_id ?? '');
  const ownerName = owners.get(ownerId)?.name?.trim() || '名前未設定';

  return {
    id: String(row.id),
    name: row.name ?? '',
    postalCode: row.postal_code ?? row.postalCode ?? '',
    address: row.address ?? '',
    category: row.category ?? '',
    comment: row.comment ?? '',
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    createdAt: row.created_at ?? row.createdAt ?? '',
    ownerId,
    ownerName,
  };
}

async function getUserIdFromToken(accessToken?: string): Promise<string | null> {
  if (!accessToken) return null;

  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return data.user.id;
}

// 「行きたいお店リスト」に表示するお店の持ち主(user_id)一覧を決める。
// mainページと同じルールで「今表示中のグループ」を求め、そのメンバー全員のお店を対象にする。
// グループ未参加なら自分のお店だけ。
async function resolveVisibleOwnerIds(userId: string): Promise<string[]> {
  const { data: membershipRows } = await supabaseServer
    .from('group_members')
    .select('group_id, user_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const memberships = (membershipRows as MembershipRow[] | null) ?? [];

  if (memberships.length === 0) {
    return [userId];
  }

  const joinedGroupIds = [
    ...new Set(memberships.map((row) => String(row.group_id))),
  ];

  const { data: selfProfileRow } = await supabaseServer
    .from('profiles')
    .select('active_group_id')
    .eq('id', userId)
    .maybeSingle();

  const activeGroupId = (
    selfProfileRow as { active_group_id: string | null } | null
  )?.active_group_id;

  const groupId =
    activeGroupId && joinedGroupIds.includes(activeGroupId)
      ? activeGroupId
      : joinedGroupIds[0];

  const { data: groupMemberRows } = await supabaseServer
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  const memberIds = (
    (groupMemberRows as { user_id: string }[] | null) ?? []
  ).map((row) => row.user_id);

  return memberIds.length > 0 ? memberIds : [userId];
}

export async function getShops(accessToken?: string): Promise<Shop[]> {
  const userId = await getUserIdFromToken(accessToken);

  if (!userId) {
    return [];
  }

  const ownerIds = await resolveVisibleOwnerIds(userId);

  const [shopsResult, profileResult] = await Promise.all([
    supabaseServer
      .from('shops')
      .select('*')
      .in('user_id', ownerIds)
      .order('created_at', { ascending: false }),
    supabaseServer.from('profiles').select('id, name').in('id', ownerIds),
  ]);

  if (shopsResult.error) {
    throw new Error(`お店一覧の取得に失敗しました: ${shopsResult.error.message}`);
  }

  const owners = new Map(
    ((profileResult.data as ProfileRow[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return ((shopsResult.data ?? []) as ShopRow[]).map((row) =>
    toShop(row, owners),
  );
}

export async function createShop(input: CreateShopInput): Promise<Shop> {
  const name = input.name.trim();

  if (!name) {
    throw new Error('お店の名前を入力してください');
  }

  const { data, error } = await supabaseServer
    .from('shops')
    .insert({
      name,
      user_id: input.userId,
      category: input.category?.trim() ?? '',
      address: input.address?.trim() ?? '',
      comment: input.comment?.trim() ?? '',
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`お店の登録に失敗しました: ${error.message}`);
  }

  const { data: ownerProfile } = await supabaseServer
    .from('profiles')
    .select('id, name')
    .eq('id', input.userId)
    .maybeSingle();

  const owners = new Map(
    ownerProfile ? [[input.userId, ownerProfile as ProfileRow]] : [],
  );

  return toShop(data as ShopRow, owners);
}
export async function deleteShop(id: string, userId: string): Promise<void> {
  const { error } = await supabaseServer
    .from('shops')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`お店の削除に失敗しました: ${error.message}`);
  }
}
