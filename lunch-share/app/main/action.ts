'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type Member = {
  id: string;
  name: string;
  avatarColor: string;
  shop?: string | null;
  menu?: string | null;
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
  const group: Group = {
    id: 'default-group',
    name: 'ささき班',
    iconColor: '#e0e0e0',
  };

  const members: Member[] = [
    { id: 'member-1', name: '佐藤', avatarColor: '#F87171', shop: 'MENMENというお店', menu: 'チャーシューまぜそば' },
    { id: 'member-2', name: '鈴木', avatarColor: '#FB923C', shop: 'やよい軒', menu: '肉野菜炒め定食' },
    { id: 'member-7', name: '山本', avatarColor: '#A78BFA', shop: 'すき家', menu: '牛丼大盛り' },
    { id: 'member-8', name: '中村', avatarColor: '#F472B6', shop: 'マクドナルド', menu: 'ビッグマックセット' },
  ];

  const { data: posts } = await supabaseServer
    .from('lunch_posts')
    .select('user_id, shop, menu')
    .order('created_at', { ascending: false });

  const membersWithPosts = members.map((member) => {
    const latestPost = posts?.find((p) => p.user_id === member.id);
    return {
      ...member,
      shop: latestPost?.shop ?? member.shop ?? null,  // DBになければサンプルにフォールバック
      menu: latestPost?.menu ?? member.menu ?? null,
    };
  });

  return {
    group,
    members: buildMemberPositions(membersWithPosts),
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

  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: 'ログインが必要です。',
    };
  }

  const { error } = await supabaseServer.from('lunch_posts').insert({
    shop,
    menu,
    comment,
    user_id: user.id,
    group_id: 'default-group', // TODO: 動的なgroup_idに差し替え
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