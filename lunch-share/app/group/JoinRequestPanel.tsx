'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  getOwnerJoinRequests,
  requestToJoinGroup,
  reviewJoinRequest,
  searchGroups,
} from './joinAction';
import type {
  GroupSearchResult,
  OwnerJoinRequest,
} from './joinAction';

export const GROUP_MEMBERS_UPDATED_EVENT = 'group-members-updated';

type JoinRequestPanelProps = {
  onApproved: (groupId: string, userId: string) => void;
};

function getRequestButtonLabel(group: GroupSearchResult): string {
  switch (group.requestStatus) {
    case 'member':
      return '参加済み';
    case 'pending':
      return '申請中';
    case 'approved':
      return '承認済み';
    case 'rejected':
      return '再申請';
    default:
      return '参加申請';
  }
}

export default function JoinRequestPanel({
  onApproved,
}: JoinRequestPanelProps) {
  const [ownerRequests, setOwnerRequests] = useState<OwnerJoinRequest[]>([]);
  const [ownerMessage, setOwnerMessage] = useState('');
  const [isOwnerMessageError, setIsOwnerMessageError] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GroupSearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [isSearchMessageError, setIsSearchMessageError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [requestingGroupId, setRequestingGroupId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      const { data } = await supabase.auth.getSession();
      const result = await getOwnerJoinRequests(
        data.session?.access_token,
      );

      if (!isMounted) return;
      setOwnerRequests(result.requests);
      setOwnerMessage(result.message);
      setIsOwnerMessageError(!result.ok);
    };

    loadRequests();
    window.addEventListener(GROUP_MEMBERS_UPDATED_EVENT, loadRequests);

    return () => {
      isMounted = false;
      window.removeEventListener(GROUP_MEMBERS_UPDATED_EVENT, loadRequests);
    };
  }, []);

  const handleSearch = async () => {
    if (isSearching) return;

    setIsSearching(true);
    setSearchMessage('');
    setIsSearchMessageError(false);

    try {
      const { data } = await supabase.auth.getSession();
      const result = await searchGroups(query, data.session?.access_token);

      setSearchResults(result.groups);
      setSearchMessage(result.message);
      setIsSearchMessageError(!result.ok);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequest = async (groupId: string) => {
    if (requestingGroupId) return;

    setRequestingGroupId(groupId);
    setSearchMessage('');
    setIsSearchMessageError(false);

    try {
      const { data } = await supabase.auth.getSession();
      const result = await requestToJoinGroup(
        groupId,
        data.session?.access_token,
      );

      setSearchMessage(result.message);
      setIsSearchMessageError(!result.ok);
      if (!result.ok) return;

      setSearchResults((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                requestStatus: 'pending',
              }
            : group,
        ),
      );
    } finally {
      setRequestingGroupId(null);
    }
  };

  const handleReview = async (
    request: OwnerJoinRequest,
    decision: 'approved' | 'rejected',
  ) => {
    if (reviewingRequestId) return;

    setReviewingRequestId(request.id);
    setOwnerMessage('');
    setIsOwnerMessageError(false);

    try {
      const { data } = await supabase.auth.getSession();
      const result = await reviewJoinRequest(
        {
          requestId: request.id,
          decision,
        },
        data.session?.access_token,
      );

      setOwnerMessage(result.message);
      setIsOwnerMessageError(!result.ok);
      if (!result.ok) return;

      setOwnerRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );

      if (decision === 'approved') {
        onApproved(request.groupId, request.userId);
      }
    } finally {
      setReviewingRequestId(null);
    }
  };

  return (
    <>
      {(ownerRequests.length > 0 || ownerMessage) && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>届いた参加申請</h2>

          <div style={styles.requestList}>
            {ownerRequests.map((request) => {
              const isReviewing = reviewingRequestId === request.id;

              return (
                <div key={request.id} style={styles.requestRow}>
                  <div style={styles.requestIdentity}>
                    <span
                      style={{
                        ...styles.avatar,
                        backgroundImage: request.userAvatarUrl
                          ? `url(${request.userAvatarUrl})`
                          : undefined,
                      }}
                    />
                    <div style={styles.requestInfo}>
                      <span style={styles.requesterName}>
                        {request.userName}
                      </span>
                      <span style={styles.requestGroupName}>
                        {request.groupName}
                      </span>
                    </div>
                  </div>

                  <div style={styles.reviewButtons}>
                    <button
                      type="button"
                      onClick={() => handleReview(request, 'rejected')}
                      style={styles.rejectButton}
                      disabled={Boolean(reviewingRequestId)}
                    >
                      却下
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(request, 'approved')}
                      style={{
                        ...styles.approveButton,
                        opacity: isReviewing ? 0.6 : 1,
                      }}
                      disabled={Boolean(reviewingRequestId)}
                    >
                      {isReviewing ? '処理中...' : '承認'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {ownerMessage && (
            <p
              style={{
                ...styles.message,
                color: isOwnerMessageError ? '#C53A3A' : '#267A4A',
              }}
              role="status"
            >
              {ownerMessage}
            </p>
          )}
        </section>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>グループを探す</h2>

        <form
          style={styles.searchRow}
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={30}
            placeholder="グループ名を入力"
            aria-label="グループ名"
            style={styles.searchInput}
            disabled={isSearching}
          />
          <button
            type="submit"
            style={styles.searchButton}
            disabled={isSearching}
          >
            {isSearching ? '検索中...' : '検索'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={styles.searchResultList}>
            {searchResults.map((group) => {
              const canRequest =
                group.requestStatus === null ||
                group.requestStatus === 'rejected';
              const isRequesting = requestingGroupId === group.id;

              return (
                <div key={group.id} style={styles.searchResultRow}>
                  <span
                    style={{
                      ...styles.groupIcon,
                      background: group.iconColor,
                    }}
                  />
                  <div style={styles.groupInfo}>
                    <span style={styles.groupName}>{group.name}</span>
                    <span style={styles.groupMeta}>
                      オーナー: {group.ownerName}・{group.memberCount}人
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequest(group.id)}
                    style={{
                      ...styles.requestButton,
                      opacity: canRequest && !requestingGroupId ? 1 : 0.6,
                    }}
                    disabled={!canRequest || Boolean(requestingGroupId)}
                  >
                    {isRequesting
                      ? '送信中...'
                      : getRequestButtonLabel(group)}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {searchMessage && (
          <p
            style={{
              ...styles.message,
              color: isSearchMessageError ? '#C53A3A' : '#267A4A',
            }}
            role="status"
          >
            {searchMessage}
          </p>
        )}
      </section>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionTitle: {
    margin: 0,
    paddingBottom: 8,
    borderBottom: '2px solid #F5B042',
    color: '#333',
    fontSize: 17,
    fontWeight: 700,
  },
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #eee',
  },
  requestRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  requestIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#d4d4d4',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flexShrink: 0,
  },
  requestInfo: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  requesterName: {
    color: '#333',
    fontSize: 15,
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  requestGroupName: {
    color: '#777',
    fontSize: 11,
    overflowWrap: 'anywhere',
  },
  reviewButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  rejectButton: {
    minWidth: 74,
    height: 32,
    border: '1px solid #aaa',
    borderRadius: 6,
    background: '#fff',
    color: '#555',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  approveButton: {
    minWidth: 74,
    height: 32,
    border: 0,
    borderRadius: 6,
    background: '#62C59A',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 76px',
    gap: 8,
  },
  searchInput: {
    minWidth: 0,
    height: 40,
    padding: '0 10px',
    border: '1px solid #bbb',
    borderRadius: 6,
    background: '#fff',
    color: '#333',
    fontSize: 14,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  searchButton: {
    width: 76,
    height: 40,
    border: 0,
    borderRadius: 6,
    background: '#F5B042',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  searchResultList: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #eee',
  },
  searchResultRow: {
    minHeight: 58,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    flexShrink: 0,
  },
  groupInfo: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  groupName: {
    color: '#333',
    fontSize: 14,
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  groupMeta: {
    color: '#777',
    fontSize: 11,
  },
  requestButton: {
    minWidth: 78,
    height: 32,
    padding: '0 8px',
    border: '1px solid #F5B042',
    borderRadius: 6,
    background: '#fff',
    color: '#B66A00',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  message: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.5,
    textAlign: 'center',
  },
};
