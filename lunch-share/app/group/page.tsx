'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabaseClient';
import { addGroupMembers, createGroup, getGroupPageData } from './action';
import type { GroupFriend, JoinedGroup } from './action';
import JoinRequestPanel, {
  GROUP_MEMBERS_UPDATED_EVENT,
} from './JoinRequestPanel';

const GROUP_COLORS = [
  '#F5B042',
  '#FF7B7B',
  '#5BA9E1',
  '#62C59A',
  '#A98AD9',
  '#E98AB0',
];

export default function GroupPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<GroupFriend[]>([]);
  const [groups, setGroups] = useState<JoinedGroup[]>([]);
  const [groupName, setGroupName] = useState('');
  const [iconColor, setIconColor] = useState(GROUP_COLORS[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [message, setMessage] = useState('読み込み中...');
  const [isMessageError, setIsMessageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [memberMessage, setMemberMessage] = useState('');
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        router.replace('/login');
        return;
      }

      const result = await getGroupPageData(accessToken);
      if (!isMounted) return;

      setFriends(result.friends);
      setGroups(result.groups);
      setMessage(result.message);
      setIsMessageError(!result.ok);
      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');
    setIsMessageError(false);

    try {
      const { data } = await supabase.auth.getSession();
      const result = await createGroup(
        {
          name: groupName,
          iconColor,
          memberIds: selectedMemberIds,
        },
        data.session?.access_token,
      );

      setMessage(result.message);
      setIsMessageError(!result.ok);
      if (!result.ok) return;

      router.push('/main');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMemberModal = (groupId: string) => {
    setActiveGroupId(groupId);
    setNewMemberIds([]);
    setMemberMessage('');
  };

  const closeMemberModal = () => {
    if (isAddingMembers) return;
    setActiveGroupId(null);
    setNewMemberIds([]);
    setMemberMessage('');
  };

  const toggleNewMember = (memberId: string) => {
    setNewMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const handleAddMembers = async () => {
    if (!activeGroupId || isAddingMembers) return;

    setIsAddingMembers(true);
    setMemberMessage('');

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      const result = await addGroupMembers(
        {
          groupId: activeGroupId,
          memberIds: newMemberIds,
        },
        accessToken,
      );

      setMemberMessage(result.message);
      if (!result.ok) return;

      const pageResult = await getGroupPageData(accessToken);
      setFriends(pageResult.friends);
      setGroups(pageResult.groups);
      setMessage(result.message);
      setIsMessageError(false);
      setActiveGroupId(null);
      setNewMemberIds([]);
      window.dispatchEvent(new Event(GROUP_MEMBERS_UPDATED_EVENT));
      router.refresh();
    } finally {
      setIsAddingMembers(false);
    }
  };

  const activeGroup = groups.find((group) => group.id === activeGroupId);
  const availableFriends = activeGroup
    ? friends.filter((friend) => !activeGroup.memberIds.includes(friend.id))
    : [];

  const handleRequestApproved = (groupId: string, userId: string) => {
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId || group.memberIds.includes(userId)) {
          return group;
        }

        return {
          ...group,
          memberCount: group.memberCount + 1,
          memberIds: [...group.memberIds, userId],
        };
      }),
    );
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.backRow}>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            style={styles.backButton}
            aria-label="プロフィールへ戻る"
          >
            {'<'}
          </button>
        </div>

        <div style={styles.titleWrap}>
          <h1 style={styles.titleText}>グループ</h1>
        </div>

        {!isLoading && groups.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>参加中のグループ</h2>
            <div style={styles.groupList}>
              {groups.map((group, index) => (
                <div key={group.id} style={styles.groupRow}>
                  <span
                    style={{
                      ...styles.groupIcon,
                      background: group.iconColor,
                    }}
                  />
                  <div style={styles.groupInfo}>
                    <span style={styles.groupName}>{group.name}</span>
                    <span style={styles.groupMeta}>
                      {group.memberCount}人
                      {index === 0 ? '・Mainに表示中' : ''}
                    </span>
                  </div>
                  {group.isOwner && (
                    <button
                      type="button"
                      onClick={() => openMemberModal(group.id)}
                      style={styles.memberAddButton}
                    >
                      メンバー追加
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeGroup && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={closeMemberModal}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label={`${activeGroup.name}にメンバーを追加`}
              style={styles.modalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 style={styles.modalTitle}>メンバー追加</h2>
              <p style={styles.modalGroupName}>{activeGroup.name}</p>

              {availableFriends.length === 0 ? (
                <p style={styles.emptyMessage}>
                  追加できるフレンドはいません。
                </p>
              ) : (
                <div style={styles.modalFriendList}>
                  {availableFriends.map((friend) => (
                    <label key={friend.id} style={styles.friendRow}>
                      <input
                        type="checkbox"
                        checked={newMemberIds.includes(friend.id)}
                        onChange={() => toggleNewMember(friend.id)}
                        style={styles.checkbox}
                        disabled={isAddingMembers}
                      />
                      <span
                        style={{
                          ...styles.friendAvatar,
                          backgroundImage: friend.avatarUrl
                            ? `url(${friend.avatarUrl})`
                            : undefined,
                        }}
                      />
                      <span style={styles.friendName}>{friend.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {memberMessage && (
                <p style={styles.modalMessage} role="status">
                  {memberMessage}
                </p>
              )}

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={closeMemberModal}
                  style={styles.cancelButton}
                  disabled={isAddingMembers}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAddMembers}
                  style={{
                    ...styles.confirmButton,
                    opacity:
                      newMemberIds.length === 0 || isAddingMembers ? 0.6 : 1,
                  }}
                  disabled={newMemberIds.length === 0 || isAddingMembers}
                >
                  {isAddingMembers ? '追加中...' : '追加'}
                </button>
              </div>
            </section>
          </div>
        )}

        <JoinRequestPanel onApproved={handleRequestApproved} />

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>新しいグループを作成</h2>

          <label style={styles.field}>
            <span style={styles.label}>グループ名</span>
            <input
              type="text"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              maxLength={30}
              placeholder="例：ランチメンバー"
              style={styles.input}
              disabled={isLoading || isSubmitting}
            />
            <span style={styles.counter}>{groupName.length}/30</span>
          </label>

          <fieldset style={styles.colorFieldset}>
            <legend style={styles.label}>グループカラー</legend>
            <div style={styles.colorRow}>
              {GROUP_COLORS.map((color) => {
                const isSelected = iconColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setIconColor(color)}
                    style={{
                      ...styles.colorButton,
                      background: color,
                      borderColor: isSelected ? '#333' : 'transparent',
                    }}
                    aria-label={`グループカラー ${color}`}
                    aria-pressed={isSelected}
                    disabled={isLoading || isSubmitting}
                  >
                    {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset style={styles.memberFieldset}>
            <legend style={styles.label}>メンバーを選択</legend>
            <p style={styles.ownerNote}>自分はオーナーとして自動で追加されます。</p>

            {isLoading ? (
              <p style={styles.emptyMessage}>フレンドを読み込んでいます...</p>
            ) : friends.length === 0 ? (
              <div style={styles.emptyArea}>
                <p style={styles.emptyMessage}>
                  追加できるフレンドがまだいません。
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  style={styles.textButton}
                >
                  フレンドを追加する
                </button>
              </div>
            ) : (
              <div style={styles.friendList}>
                {friends.map((friend) => {
                  const isSelected = selectedMemberIds.includes(friend.id);

                  return (
                    <label key={friend.id} style={styles.friendRow}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(friend.id)}
                        style={styles.checkbox}
                        disabled={isSubmitting}
                      />
                      <span
                        style={{
                          ...styles.friendAvatar,
                          backgroundImage: friend.avatarUrl
                            ? `url(${friend.avatarUrl})`
                            : undefined,
                        }}
                      />
                      <span style={styles.friendName}>{friend.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          {message && (
            <p
              style={{
                ...styles.message,
                color: isMessageError ? '#C53A3A' : '#267A4A',
              }}
              role="status"
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              ...styles.createButton,
              opacity: isLoading || isSubmitting ? 0.6 : 1,
            }}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? '作成中...' : 'グループを作成'}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily:
      '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    paddingTop: 72,
    paddingBottom: 88,
  },
  main: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    alignSelf: 'center',
    padding: '12px 20px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    boxSizing: 'border-box',
  },
  backRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    fontSize: 16,
    fontWeight: 700,
    color: '#333',
    cursor: 'pointer',
  },
  titleWrap: {
    background: '#FFF6C9',
    border: '3px solid #F5B042',
    padding: '10px 32px',
  },
  titleText: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#4a4a4a',
  },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    margin: 0,
    paddingBottom: 8,
    borderBottom: '2px solid #F5B042',
    fontSize: 17,
    fontWeight: 700,
    color: '#333',
  },
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  groupRow: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    flexShrink: 0,
  },
  groupInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#333',
    overflowWrap: 'anywhere',
  },
  groupMeta: {
    fontSize: 11,
    color: '#777',
  },
  memberAddButton: {
    minWidth: 92,
    height: 32,
    padding: '0 10px',
    border: '1px solid #F5B042',
    borderRadius: 6,
    background: '#fff',
    color: '#B66A00',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  field: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#444',
  },
  input: {
    width: '100%',
    height: 42,
    padding: '0 12px',
    paddingRight: 58,
    border: '1px solid #bbb',
    borderRadius: 6,
    background: '#fff',
    color: '#333',
    fontSize: 15,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 13,
    color: '#888',
    fontSize: 10,
  },
  colorFieldset: {
    margin: 0,
    padding: 0,
    border: 0,
  },
  colorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    border: '3px solid transparent',
    borderRadius: '50%',
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
  },
  memberFieldset: {
    margin: 0,
    padding: 0,
    border: 0,
  },
  ownerNote: {
    margin: '6px 0 10px',
    color: '#777',
    fontSize: 12,
  },
  friendList: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #eee',
  },
  friendRow: {
    minHeight: 58,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '7px 4px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  },
  checkbox: {
    width: 20,
    height: 20,
    margin: 0,
    accentColor: '#F5B042',
    flexShrink: 0,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#d4d4d4',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flexShrink: 0,
  },
  friendName: {
    minWidth: 0,
    color: '#333',
    fontSize: 15,
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  emptyArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  emptyMessage: {
    margin: 0,
    color: '#777',
    fontSize: 13,
  },
  textButton: {
    padding: 0,
    border: 0,
    background: 'transparent',
    color: '#D27000',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  message: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  createButton: {
    alignSelf: 'center',
    minWidth: 180,
    height: 44,
    padding: '0 24px',
    border: 0,
    borderRadius: 6,
    background: '#F5B042',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #C98421',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'rgba(255,255,255,0.7)',
    boxSizing: 'border-box',
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    maxHeight: 'min(520px, 80vh)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '20px 18px',
    border: '1px solid #888',
    borderRadius: 8,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
    boxSizing: 'border-box',
  },
  modalTitle: {
    margin: 0,
    color: '#333',
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
  },
  modalGroupName: {
    margin: 0,
    color: '#B66A00',
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },
  modalFriendList: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    borderTop: '1px solid #eee',
  },
  modalMessage: {
    margin: 0,
    color: '#C53A3A',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    minWidth: 100,
    height: 38,
    border: '1px solid #bbb',
    borderRadius: 6,
    background: '#fff',
    color: '#555',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  confirmButton: {
    minWidth: 100,
    height: 38,
    border: 0,
    borderRadius: 6,
    background: '#F5B042',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
