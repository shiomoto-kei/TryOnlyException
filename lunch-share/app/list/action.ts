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
};

function toShop(row: ShopRow): Shop {
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
  };
}

export async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabaseServer
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`お店一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((row) => toShop(row as ShopRow));
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

  return toShop(data as ShopRow);
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
