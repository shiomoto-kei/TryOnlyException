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

export type MainPageData = {
  group: Group;
  members: MemberPosition[];
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

  return {
    group,
    members: buildMemberPositions(members),
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

 const { error } = await supabaseServer.from('shops').insert({
  name: shop,       // 「行きたいお店」→ name列（必須）
  category: menu,   // 「食べたいメニュー」→ category列で代用
  comment,          // そのままcomment列へ
});

  if (error) {
    return {
      ok: false,
      message: `投稿に失敗しました: ${error.message}`,
    };
  }

  return {
    ok: true,
    message: '投稿されました',
  };
}
