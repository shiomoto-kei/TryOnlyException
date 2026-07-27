'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type GroupFriend = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type JoinedGroup = {
  id: string;
  name: string;
  iconColor: string;
  memberCount: number;
};

export type GroupPageData = {
  ok: boolean;
  message: string;
  friends: GroupFriend[];
  groups: JoinedGroup[];
};

export type CreateGroupInput = {
  name: string;
  iconColor: string;
  memberIds: string[];
};

export type CreateGroupResult = {
  ok: boolean;
  message: string;
  groupId?: string;
};

type FriendRow = {
  friend_user_id: string;
  friend_name: string | null;
  friend_avatar_url: string | null;
};

type MembershipRow = {
  group_id: string;
};

type GroupRow = {
  id: string;
  name: string;
  icon_color: string | null;
};

type GroupMemberRow = {
  group_id: string;
};

const GROUP_COLORS = [
  '#F5B042',
  '#FF7B7B',
  '#5BA9E1',
  '#62C59A',
  '#A98AD9',
  '#E98AB0',
];

async function getUserId(accessToken?: string): Promise<string | null> {
  if (!accessToken) return null;

  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return data.user.id;
}

export async function getGroupPageData(
  accessToken?: string,
): Promise<GroupPageData> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
      friends: [],
      groups: [],
    };
  }

  const [friendResult, membershipResult] = await Promise.all([
    supabaseServer
      .from('friends')
      .select('friend_user_id, friend_name, friend_avatar_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseServer
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (friendResult.error) {
    return {
      ok: false,
      message: 'フレンド一覧を取得できませんでした。',
      friends: [],
      groups: [],
    };
  }

  const friends = ((friendResult.data as FriendRow[] | null) ?? []).map(
    (friend) => ({
      id: friend.friend_user_id,
      name: friend.friend_name?.trim() || '名前未設定',
      avatarUrl: friend.friend_avatar_url,
    }),
  );

  const memberships =
    (membershipResult.data as MembershipRow[] | null) ?? [];
  const groupIds = memberships.map((membership) => membership.group_id);

  if (groupIds.length === 0) {
    return {
      ok: true,
      message: '',
      friends,
      groups: [],
    };
  }

  const [groupResult, memberResult] = await Promise.all([
    supabaseServer
      .from('groups')
      .select('id, name, icon_color')
      .in('id', groupIds),
    supabaseServer
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds),
  ]);

  if (groupResult.error || memberResult.error) {
    return {
      ok: false,
      message: '参加中のグループを取得できませんでした。',
      friends,
      groups: [],
    };
  }

  const memberCounts = new Map<string, number>();
  for (const member of (memberResult.data as GroupMemberRow[] | null) ?? []) {
    memberCounts.set(
      member.group_id,
      (memberCounts.get(member.group_id) ?? 0) + 1,
    );
  }

  const groupMap = new Map(
    ((groupResult.data as GroupRow[] | null) ?? []).map((group) => [
      group.id,
      group,
    ]),
  );

  const groups = groupIds.flatMap((groupId) => {
    const group = groupMap.get(groupId);
    if (!group) return [];

    return [
      {
        id: group.id,
        name: group.name,
        iconColor: group.icon_color ?? '#e0e0e0',
        memberCount: memberCounts.get(group.id) ?? 0,
      },
    ];
  });

  return {
    ok: true,
    message: '',
    friends,
    groups,
  };
}

export async function createGroup(
  input: CreateGroupInput,
  accessToken?: string,
): Promise<CreateGroupResult> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
    };
  }

  const name = input.name.trim();
  if (!name) {
    return {
      ok: false,
      message: 'グループ名を入力してください。',
    };
  }

  if (name.length > 30) {
    return {
      ok: false,
      message: 'グループ名は30文字以内で入力してください。',
    };
  }

  const iconColor = GROUP_COLORS.includes(input.iconColor)
    ? input.iconColor
    : GROUP_COLORS[0];
  const requestedMemberIds = [
    ...new Set(input.memberIds.filter((memberId) => memberId !== userId)),
  ];

  let memberIds: string[] = [];
  if (requestedMemberIds.length > 0) {
    const { data: friendRows, error: friendError } = await supabaseServer
      .from('friends')
      .select('friend_user_id')
      .eq('user_id', userId)
      .in('friend_user_id', requestedMemberIds);

    if (friendError) {
      return {
        ok: false,
        message: '選択したフレンドを確認できませんでした。',
      };
    }

    const allowedFriendIds = new Set(
      ((friendRows as Pick<FriendRow, 'friend_user_id'>[] | null) ?? []).map(
        (friend) => friend.friend_user_id,
      ),
    );
    memberIds = requestedMemberIds.filter((memberId) =>
      allowedFriendIds.has(memberId),
    );

    if (memberIds.length !== requestedMemberIds.length) {
      return {
        ok: false,
        message: 'フレンド一覧が更新されています。画面を再読み込みしてください。',
      };
    }
  }

  const { data: group, error: groupError } = await supabaseServer
    .from('groups')
    .insert({
      name,
      icon_color: iconColor,
      owner_user_id: userId,
    })
    .select('id')
    .single();

  if (groupError || !group) {
    return {
      ok: false,
      message: 'グループを作成できませんでした。',
    };
  }

  const members = [
    {
      group_id: group.id,
      user_id: userId,
      role: 'owner',
    },
    ...memberIds.map((memberId) => ({
      group_id: group.id,
      user_id: memberId,
      role: 'member',
    })),
  ];

  const { error: memberError } = await supabaseServer
    .from('group_members')
    .insert(members);

  if (memberError) {
    await supabaseServer
      .from('groups')
      .delete()
      .eq('id', group.id)
      .eq('owner_user_id', userId);

    return {
      ok: false,
      message: 'メンバーを登録できなかったため、グループ作成を取り消しました。',
    };
  }

  return {
    ok: true,
    message: 'グループを作成しました。',
    groupId: group.id,
  };
}
