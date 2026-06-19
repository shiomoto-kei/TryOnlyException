'use server';

export type Shop = {
  id: string;
  name: string;
  postalCode: string;
  address: string;
  category: string;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
};

type CreateShopInput = {
  name: string;
  category?: string;
  address?: string;
  comment?: string;
};

const mockShops: Shop[] = [
  {
    id: 'mock-1',
    name: 'MAREN',
    postalCode: '〒530-0015',
    address: '大阪府大阪市北区中崎西1-4-22 梅田東ビル1F',
    category: 'まぜそば',
    comment: '仮データです',
    createdAt: '2026-06-19T00:00:00.000Z',
  },
  {
    id: 'mock-2',
    name: 'カレー食堂',
    postalCode: '〒530-0001',
    address: '大阪府大阪市北区梅田1-1-1',
    category: 'カレー',
    comment: 'Supabase接続前の仮データです',
    createdAt: '2026-06-19T00:00:00.000Z',
  },
  {
    id: 'test',
    name: 'テスト食堂',
    postalCode: '〒999-999',
    address: '大阪府大阪市梅田1-1-1',
    category: 'テスト',
    comment: '仮データウェイ',
    createdAt: '2026-99-19T00:00:00.000Z',
  }
];

export async function getShops(): Promise<Shop[]> {
  // TODO: Supabaseのshopsテーブル完成後、ここをselect処理に置き換える
  return mockShops;
}

export async function createShop(input: CreateShopInput): Promise<Shop> {
  const name = input.name.trim();

  if (!name) {
    throw new Error('お店の名前を入力してください');
  }

  // TODO: Supabaseのshopsテーブル完成後、ここをinsert処理に置き換える
  return {
    id: `mock-${Date.now()}`,
    name,
    postalCode: '',
    address: input.address?.trim() ?? '',
    category: input.category?.trim() ?? '',
    comment: input.comment?.trim() ?? '',
    createdAt: new Date().toISOString(),
  };
}