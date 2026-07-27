'use server';

import { supabaseServer } from '../lib/supabaseServer';

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export type GroupSearchResult = {
  id: string;
  name: string;
  iconColor: string;
  ownerName: string;
  memberCount: number;
  requestStatus: JoinRequestStatus | 'member' | null;
};

export type SearchGroupsResult = {
  ok: boolean;
  message: string;
  groups: GroupSearchResult[];
};

export type OwnerJoinRequest = {
  id: string;
  groupId: string;
  groupName: string;
  groupIconColor: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  createdAt: string;
};

export type OwnerJoinRequestData = {
  ok: boolean;
  message: string;
  requests: OwnerJoinRequest[];
};

export type JoinRequestResult = {
  ok: boolean;
  message: string;
};

export type ReviewJoinRequestInput = {
  requestId: string;
  decision: 'approved' | 'rejected';
};

type GroupRow = {
  id: string;
  name: string;
  icon_color: string | null;
  owner_user_id: string;
};

type GroupMemberRow = {
  group_id: string;
  user_id: string;
};

type JoinRequestRow = {
  id: string;
  group_id: string;
  user_id: string;
  status: JoinRequestStatus;
  created_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

async function getUserId(accessToken?: string): Promise<string | null> {
  if (!accessToken) return null;

  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return data.user.id;
}

export async function getOwnerJoinRequests(
  accessToken?: string,
): Promise<OwnerJoinRequestData> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
      requests: [],
    };
  }

  const { data: ownedGroups, error: groupError } = await supabaseServer
    .from('groups')
    .select('id, name, icon_color, owner_user_id')
    .eq('owner_user_id', userId);

  if (groupError) {
    return {
      ok: false,
      message: '参加申請を確認できませんでした。',
      requests: [],
    };
  }

  const groups = (ownedGroups as GroupRow[] | null) ?? [];
  const groupIds = groups.map((group) => group.id);

  if (groupIds.length === 0) {
    return {
      ok: true,
      message: '',
      requests: [],
    };
  }

  const { data: requestRows, error: requestError } = await supabaseServer
    .from('group_join_requests')
    .select('id, group_id, user_id, status, created_at')
    .in('group_id', groupIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (requestError) {
    return {
      ok: false,
      message: '参加申請を取得できませんでした。Supabaseの申請用SQLを確認してください。',
      requests: [],
    };
  }

  const requests = (requestRows as JoinRequestRow[] | null) ?? [];
  const requesterIds = [...new Set(requests.map((request) => request.user_id))];

  const { data: profileRows, error: profileError } =
    requesterIds.length > 0
      ? await supabaseServer
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', requesterIds)
      : { data: [], error: null };

  if (profileError) {
    return {
      ok: false,
      message: '申請者の情報を取得できませんでした。',
      requests: [],
    };
  }

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const profileMap = new Map(
    ((profileRows as ProfileRow[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return {
    ok: true,
    message: '',
    requests: requests.flatMap((request) => {
      const group = groupMap.get(request.group_id);
      if (!group) return [];

      const profile = profileMap.get(request.user_id);

      return [
        {
          id: request.id,
          groupId: group.id,
          groupName: group.name,
          groupIconColor: group.icon_color ?? '#e0e0e0',
          userId: request.user_id,
          userName: profile?.name?.trim() || '名前未設定',
          userAvatarUrl: profile?.avatar_url ?? null,
          createdAt: request.created_at,
        },
      ];
    }),
  };
}

export async function searchGroups(
  query: string,
  accessToken?: string,
): Promise<SearchGroupsResult> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
      groups: [],
    };
  }

  const searchText = query.trim();
  if (!searchText) {
    return {
      ok: false,
      message: 'グループ名を入力してください。',
      groups: [],
    };
  }

  if (searchText.length > 30) {
    return {
      ok: false,
      message: '検索文字は30文字以内で入力してください。',
      groups: [],
    };
  }

  const escapedSearchText = searchText.replace(/[\\%_]/g, '\\$&');
  const { data: groupRows, error: groupError } = await supabaseServer
    .from('groups')
    .select('id, name, icon_color, owner_user_id')
    .ilike('name', `%${escapedSearchText}%`)
    .order('name', { ascending: true })
    .limit(20);

  if (groupError) {
    return {
      ok: false,
      message: 'グループを検索できませんでした。',
      groups: [],
    };
  }

  const groups = (groupRows as GroupRow[] | null) ?? [];
  const groupIds = groups.map((group) => group.id);
  const ownerIds = [...new Set(groups.map((group) => group.owner_user_id))];

  if (groupIds.length === 0) {
    return {
      ok: true,
      message: '該当するグループはありません。',
      groups: [],
    };
  }

  const [memberResult, ownMembershipResult, requestResult, ownerResult] =
    await Promise.all([
    supabaseServer
      .from('group_members')
      .select('group_id, user_id')
      .in('group_id', groupIds),
    supabaseServer
      .from('group_members')
      .select('group_id, user_id')
      .eq('user_id', userId)
      .in('group_id', groupIds),
    supabaseServer
      .from('group_join_requests')
      .select('id, group_id, user_id, status, created_at')
      .eq('user_id', userId)
      .in('group_id', groupIds),
    supabaseServer
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', ownerIds),
  ]);

  if (
    memberResult.error ||
    ownMembershipResult.error ||
    ownerResult.error
  ) {
    return {
      ok: false,
      message: 'グループの参加状況を取得できませんでした。',
      groups: [],
    };
  }

  if (requestResult.error) {
    return {
      ok: false,
      message: '申請状況を取得できませんでした。Supabaseの申請用SQLを確認してください。',
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

  const joinedGroupIds = new Set(
    ((ownMembershipResult.data as GroupMemberRow[] | null) ?? []).map(
      (member) => member.group_id,
    ),
  );
  const requestStatusMap = new Map(
    ((requestResult.data as JoinRequestRow[] | null) ?? []).map((request) => [
      request.group_id,
      request.status,
    ]),
  );
  const ownerNameMap = new Map(
    ((ownerResult.data as ProfileRow[] | null) ?? []).map((profile) => [
      profile.id,
      profile.name?.trim() || '名前未設定',
    ]),
  );

  return {
    ok: true,
    message: '',
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      iconColor: group.icon_color ?? '#e0e0e0',
      ownerName: ownerNameMap.get(group.owner_user_id) ?? '名前未設定',
      memberCount: memberCounts.get(group.id) ?? 0,
      requestStatus:
        group.owner_user_id === userId || joinedGroupIds.has(group.id)
          ? 'member'
          : requestStatusMap.get(group.id) ?? null,
    })),
  };
}

export async function requestToJoinGroup(
  groupId: string,
  accessToken?: string,
): Promise<JoinRequestResult> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
    };
  }

  const normalizedGroupId = groupId.trim();
  if (!normalizedGroupId) {
    return {
      ok: false,
      message: '申請先のグループが正しくありません。',
    };
  }

  const { data: group, error: groupError } = await supabaseServer
    .from('groups')
    .select('id, owner_user_id')
    .eq('id', normalizedGroupId)
    .maybeSingle();

  if (groupError || !group) {
    return {
      ok: false,
      message: '申請先のグループが見つかりません。',
    };
  }

  if (group.owner_user_id === userId) {
    return {
      ok: false,
      message: '自分が作成したグループには申請できません。',
    };
  }

  const { data: membership, error: membershipError } = await supabaseServer
    .from('group_members')
    .select('group_id')
    .eq('group_id', normalizedGroupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (membershipError) {
    return {
      ok: false,
      message: '参加状況を確認できませんでした。',
    };
  }

  if (membership) {
    return {
      ok: false,
      message: 'このグループにはすでに参加しています。',
    };
  }

  const { data: existingRequest, error: existingError } = await supabaseServer
    .from('group_join_requests')
    .select('id, status')
    .eq('group_id', normalizedGroupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message: '申請状況を確認できませんでした。',
    };
  }

  if (existingRequest?.status === 'pending') {
    return {
      ok: true,
      message: 'このグループには申請済みです。',
    };
  }

  if (existingRequest?.status === 'approved') {
    return {
      ok: false,
      message: '申請は承認済みです。画面を再読み込みしてください。',
    };
  }

  const now = new Date().toISOString();
  const requestResult = existingRequest
    ? await supabaseServer
        .from('group_join_requests')
        .update({
          status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .eq('id', existingRequest.id)
    : await supabaseServer.from('group_join_requests').insert({
        group_id: normalizedGroupId,
        user_id: userId,
        status: 'pending',
      });

  if (requestResult.error) {
    return {
      ok: false,
      message: '参加申請を送信できませんでした。',
    };
  }

  return {
    ok: true,
    message: '参加申請を送信しました。',
  };
}

export async function reviewJoinRequest(
  input: ReviewJoinRequestInput,
  accessToken?: string,
): Promise<JoinRequestResult> {
  const userId = await getUserId(accessToken);

  if (!userId) {
    return {
      ok: false,
      message: 'ログインが必要です。',
    };
  }

  if (!input.requestId || !['approved', 'rejected'].includes(input.decision)) {
    return {
      ok: false,
      message: '申請の処理内容が正しくありません。',
    };
  }

  const { data: request, error: requestError } = await supabaseServer
    .from('group_join_requests')
    .select('id, group_id, user_id, status, created_at')
    .eq('id', input.requestId)
    .maybeSingle();

  if (requestError || !request) {
    return {
      ok: false,
      message: '参加申請が見つかりません。',
    };
  }

  const { data: ownedGroup, error: groupError } = await supabaseServer
    .from('groups')
    .select('id')
    .eq('id', request.group_id)
    .eq('owner_user_id', userId)
    .maybeSingle();

  if (groupError || !ownedGroup) {
    return {
      ok: false,
      message: 'この申請を処理できるのはグループのオーナーだけです。',
    };
  }

  if (request.status !== 'pending') {
    return {
      ok: false,
      message: 'この申請はすでに処理されています。',
    };
  }

  if (input.decision === 'rejected') {
    const { error } = await supabaseServer
      .from('group_join_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .eq('status', 'pending');

    return error
      ? {
          ok: false,
          message: '参加申請を却下できませんでした。',
        }
      : {
          ok: true,
          message: '参加申請を却下しました。',
        };
  }

  const { data: existingMember, error: memberCheckError } =
    await supabaseServer
      .from('group_members')
      .select('id')
      .eq('group_id', request.group_id)
      .eq('user_id', request.user_id)
      .maybeSingle();

  if (memberCheckError) {
    return {
      ok: false,
      message: '現在のメンバーを確認できませんでした。',
    };
  }

  let insertedMember = false;
  if (!existingMember) {
    const { error: insertError } = await supabaseServer
      .from('group_members')
      .insert({
        group_id: request.group_id,
        user_id: request.user_id,
        role: 'member',
      });

    if (insertError) {
      return {
        ok: false,
        message: '申請者をグループに追加できませんでした。',
      };
    }
    insertedMember = true;
  }

  const { error: updateError } = await supabaseServer
    .from('group_join_requests')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', request.id)
    .eq('status', 'pending');

  if (updateError) {
    if (insertedMember) {
      await supabaseServer
        .from('group_members')
        .delete()
        .eq('group_id', request.group_id)
        .eq('user_id', request.user_id);
    }

    return {
      ok: false,
      message: '承認状態を保存できませんでした。',
    };
  }

  return {
    ok: true,
    message: '参加申請を承認しました。',
  };
}
