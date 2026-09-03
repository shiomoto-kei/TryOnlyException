'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type Member = {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  shop?: string | null;
  menu?: string | null;
  mapUrl?: string | null;
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
  mapUrl?: string;
};

export type LunchPostResult = {
  ok: boolean;
  message: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

type GroupRow = {
  id: string;
  name: string;
  icon_color: string | null;
};

type MembershipRow = {
  group_id: string;
  user_id: string;
  created_at: string;
};

type LunchPostRow = {
  user_id: string | null;
  shop: string | null;
  menu: string | null;
  map_url: string | null;
  created_at: string;
};

const DEFAULT_GROUP: Group = {
  id: 'no-group',
  name: 'グループ未設定',
  iconColor: '#e0e0e0',
};

const AVATAR_COLORS = [
  '#F87171',
  '#FB923C',
  '#FACC15',
  '#4ADE80',
  '#2DD4BF',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
];

function pickAvatarColor(userId: string): string {
  const sum = [...userId].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getTodayRange(now = new Date()) {
  const nowInJst = new Date(now.getTime() + JST_OFFSET_MS);
  const startTimestamp =
    Date.UTC(
      nowInJst.getUTCFullYear(),
      nowInJst.getUTCMonth(),
      nowInJst.getUTCDate(),
    ) - JST_OFFSET_MS;

  return {
    start: new Date(startTimestamp).toISOString(),
    end: new Date(startTimestamp + 24 * 60 * 60 * 1000).toISOString(),
  };
}

async function getUserIdFromToken(accessToken?: string): Promise<string | null> {
  if (!accessToken) return null;

  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return data.user.id;
}

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

export async function getMainPageData(
  accessToken?: string,
): Promise<MainPageData> {
  const userId = await getUserIdFromToken(accessToken);

  if (!userId) {
    return {
      group: DEFAULT_GROUP,
      members: [],
    };
  }

  const { data: membership } = await supabaseServer
    .from('group_members')
    .select('group_id, user_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership?.group_id) {
    return {
      group: DEFAULT_GROUP,
      members: buildMemberPositions([
        {
          id: userId,
          name: 'あなた',
          avatarColor: pickAvatarColor(userId),
          avatarUrl: null,
          shop: null,
          menu: null,
        },
      ]),
    };
  }

  const groupId = String(membership.group_id);
  const { start, end } = getTodayRange();

  const [groupResult, memberResult, postResult] = await Promise.all([
    supabaseServer
      .from('groups')
      .select('id, name, icon_color')
      .eq('id', groupId)
      .maybeSingle(),
    supabaseServer
      .from('group_members')
      .select('group_id, user_id, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true }),
    supabaseServer
      .from('lunch_posts')
      .select('user_id, shop, menu, map_url, created_at')
      .eq('group_id', groupId)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false }),
  ]);

  const groupRow = groupResult.data as GroupRow | null;
  const group: Group = groupRow
    ? {
        id: groupRow.id,
        name: groupRow.name,
        iconColor: groupRow.icon_color ?? '#e0e0e0',
      }
    : DEFAULT_GROUP;

  const memberRows = (memberResult.data as MembershipRow[] | null) ?? [];
  const memberIds = memberRows.map((member) => member.user_id);

  const { data: profileRows } =
    memberIds.length > 0
      ? await supabaseServer
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', memberIds)
      : { data: [] };

  const profiles = new Map(
    ((profileRows as ProfileRow[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const posts = (postResult.data as LunchPostRow[] | null) ?? [];

  const membersWithPosts = memberRows.map((member) => {
    const profile = profiles.get(member.user_id);
    const latestPost = posts.find((post) => post.user_id === member.user_id);

    return {
      id: member.user_id,
      name: profile?.name?.trim() || '名前未設定',
      avatarColor: pickAvatarColor(member.user_id),
      avatarUrl: profile?.avatar_url ?? null,
      shop: latestPost?.shop ?? null,
      menu: latestPost?.menu ?? null,
      mapUrl: latestPost?.map_url ?? null,
    };
  });

  return {
    group,
    members: buildMemberPositions(membersWithPosts),
  };
}

export async function createLunchPost(
  input: LunchPostInput,
  accessToken?: string,
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

  const userId = await getUserIdFromToken(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
    };
  }

  const { data: membership } = await supabaseServer
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership?.group_id) {
    return {
      ok: false,
      message: '先にグループを作成、または参加してください。',
    };
  }

  const { error } = await supabaseServer.from('lunch_posts').insert({
  shop,
  menu,
  comment,
  map_url: input.mapUrl?.trim() || null,
  user_id: userId,
  group_id: membership.group_id,
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
