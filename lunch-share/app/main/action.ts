'use server';
//型定義

//メンバー1人分の情報
export type Member = {
  id: string;
  name: string;
  avatarColor: string;
};

//グループ情報
export type Group = {
  id: string;
  name: string;
  iconColor: string;
};

//メンバー配置用の情報
export type MemberPosition = Member & {
  angle: number;
};

//トップページで必要なデータ
export type MainPageData = {
  group: Group;
  members: MemberPosition[];
};

//ダミーデータ
const group: Group = {
  id: 'default-group',
  name: 'ささき班',
  iconColor: '#e0e0e0',
};

//メンバーのダミーデータ
const members: Member[] = [
  { id: 'member-1', name: 'member 1', avatarColor: '#d4d4d4' },
  { id: 'member-2', name: 'member 2', avatarColor: '#d4d4d4' },
  { id: 'member-3', name: 'member 3', avatarColor: '#d4d4d4' },
  { id: 'member-4', name: 'member 4', avatarColor: '#d4d4d4' },
  { id: 'member-5', name: 'member 5', avatarColor: '#d4d4d4' },
  { id: 'member-6', name: 'member 6', avatarColor: '#d4d4d4' },
  { id: 'member-7', name: 'member 7', avatarColor: '#d4d4d4' },
  { id: 'member-8', name: 'member 8', avatarColor: '#d4d4d4' },
];

const startAngle = -90;
//メンバーの数に応じて、円形に配置するための角度を計算して返す関数
function buildMemberPositions(memberList: Member[]): MemberPosition[] {
  const angleStep = 360 / memberList.length;

  return memberList.map((member, index) => ({
    ...member,
    angle: startAngle + angleStep * index,
  }));
}

//トップページで必要なデータを取得する関数
export async function getMainPageData(): Promise<MainPageData> {
  return {
    group,
    members: buildMemberPositions(members),
  };
}
