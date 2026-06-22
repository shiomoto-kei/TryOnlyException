'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type Member = {
  id: string;
  name: string;
  avatarColor: string;
};

export type Group = {
  id: string;
  name: string;
  iconColor: string;
};

export type MemberPosition = Member & {
  angle: number;
};

export type TodayLunchPost = {
  id: string;
  shop: string;
  menu: string;
  comment: string;
  createdAt: string;
};

export type MainPageData = {
  group: Group;
  members: MemberPosition[];
  todayPosts: TodayLunchPost[];
};

export type LunchPostInput = {
  shop: string;
  menu: string;
  comment: string;
};

export type LunchPostResult = {
  ok: boolean;
  message: string;
};

type LunchPostRow = {
  id: string | number;
  shop: string | null;
  menu: string | null;
  comment?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
};

function buildMemberPositions(
  memberList: Member[],
  startAngle = -90,
): MemberPosition[] {
  if (memberList.length === 0) return [];

  const angleStep = 360 / memberList.length;

  return memberList.map((member, index) => ({
    ...member,
    angle: startAngle + angleStep * index,
  }));
}

function getTokyoDayRange(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const start = new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function toTodayLunchPost(row: LunchPostRow): TodayLunchPost {
  return {
    id: String(row.id),
    shop: row.shop ?? '',
    menu: row.menu ?? '',
    comment: row.comment ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
  };
}

export async function getMainPageData(): Promise<MainPageData> {
  // TODO: Supabase 準備後に DB 取得へ差し替え
  // const { data: group } = await supabase.from('groups').select('*').single();
  // const { data: members } = await supabase.from('members').select('*').eq('group_id', group.id);

  const group: Group = {
    id: 'default-group',
    name: 'ささき班',
    iconColor: '#e0e0e0',
  };

  const members: Member[] = [
    { id: 'member-1', name: '佐藤', avatarColor: '#F87171' },
    { id: 'member-2', name: '鈴木', avatarColor: '#FB923C' },
    // { id: 'member-3', name: '高橋', avatarColor: '#FACC15' },
    // { id: 'member-4', name: '田中', avatarColor: '#4ADE80' },
    // { id: 'member-5', name: '伊藤', avatarColor: '#2DD4BF' },
    // { id: 'member-6', name: '渡辺', avatarColor: '#60A5FA' },
    { id: 'member-7', name: '山本', avatarColor: '#A78BFA' },
    { id: 'member-8', name: '中村', avatarColor: '#F472B6' },
  ];

  const { startIso, endIso } = getTokyoDayRange();
  const { data: todayPosts, error } = await supabaseServer
    .from('lunch_posts')
    .select('id, shop, menu, comment, created_at')
    .gte('created_at', startIso)
    .lt('created_at', endIso)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('today lunch posts fetch failed:', error.message);
  }

  return {
    group,
    members: buildMemberPositions(members),
    todayPosts: error
      ? []
      : (todayPosts ?? []).map((row) =>
          toTodayLunchPost(row as LunchPostRow),
        ),
  };
}

export async function createLunchPost(
  input: LunchPostInput,
): Promise<LunchPostResult> {
  const shop = input.shop.trim();
  const menu = input.menu.trim();
  const comment = input.comment.trim();

  if (!shop || !menu) {
    return {
      ok: false,
      message: 'お店とメニューを入力してください。',
    };
  }

  const { error } = await supabaseServer.from('lunch_posts').insert({
    shop,
    menu,
    comment,
  });

  if (error) {
    return {
      ok: false,
      message: `投稿に失敗しました: ${error.message}`,
    };
  }

  return {
    ok: true,
    message: '今日行きたいお店に追加しました。',
  };
}
