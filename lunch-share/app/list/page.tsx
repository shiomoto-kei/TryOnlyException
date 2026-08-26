'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import ShopCard from '../components/ShopCard';
import type { Shop } from './action';
import { supabase } from '../lib/supabaseClient';
import ShopPlacePicker, { type PlaceSelection } from './ShopPlacePicker';

const MagnifyingGlass = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <g clipPath="url(#clip0_292_559)">
      <path
        d="M10.5625 5.28125C10.5625 6.44668 10.1842 7.52324 9.54688 8.39668L12.7613 11.6137C13.0787 11.9311 13.0787 12.4465 12.7613 12.7639C12.4439 13.0813 11.9285 13.0813 11.6111 12.7639L8.39668 9.54688C7.52324 10.1867 6.44668 10.5625 5.28125 10.5625C2.36387 10.5625 0 8.19863 0 5.28125C0 2.36387 2.36387 0 5.28125 0C8.19863 0 10.5625 2.36387 10.5625 5.28125ZM5.28125 8.9375C5.7614 8.9375 6.23684 8.84293 6.68044 8.65918C7.12403 8.47544 7.52709 8.20612 7.86661 7.86661C8.20612 7.52709 8.47544 7.12403 8.65918 6.68044C8.84293 6.23684 8.9375 5.7614 8.9375 5.28125C8.9375 4.8011 8.84293 4.32566 8.65918 3.88206C8.47544 3.43847 8.20612 3.0354 7.86661 2.69589C7.52709 2.35638 7.12403 2.08706 6.68044 1.90332C6.23684 1.71957 5.7614 1.625 5.28125 1.625C4.8011 1.625 4.32566 1.71957 3.88206 1.90332C3.43847 2.08706 3.0354 2.35638 2.69589 2.69589C2.35638 3.0354 2.08706 3.43847 1.90332 3.88206C1.71957 4.32566 1.625 4.8011 1.625 5.28125C1.625 5.7614 1.71957 6.23684 1.90332 6.68044C2.08706 7.12403 2.35638 7.52709 2.69589 7.86661C3.0354 8.20612 3.43847 8.47544 3.88206 8.65918C4.32566 8.84293 4.8011 8.9375 5.28125 8.9375Z"
        fill="#878787"
      />
    </g>
    <defs>
      <clipPath id="clip0_292_559">
        <rect width="13" height="13" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SHOP_IMAGES_BUCKET = 'shop-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getShopImagePath(imageUrl?: string) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const bucketPath = `/storage/v1/object/public/${SHOP_IMAGES_BUCKET}/`;
    const bucketIndex = url.pathname.indexOf(bucketPath);

    if (bucketIndex === -1) return null;

    return decodeURIComponent(
      url.pathname.slice(bucketIndex + bucketPath.length)
    );
  } catch {
    return null;
  }
}

export default function ShopListPage() {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [mapPosition, setMapPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [message, setMessage] = useState('');
  const createImageInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);
  const googleMapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  const handlePlaceQueryChange = useCallback((value: string) => {
    setShopName(value);
    setAddress('');
    setMapPosition(null);
    setMessage('');
  }, []);

  const handlePlaceSelect = useCallback((place: PlaceSelection) => {
    setShopName(place.name);
    setAddress(place.address);
    setMapPosition(place.position);
    setMessage('');
  }, []);

  const handlePlaceError = useCallback((errorMessage: string) => {
    setMessage(errorMessage);
  }, []);

  const clearCreateImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });

    if (createImageInputRef.current) {
      createImageInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const selectCreateImage = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('画像ファイルを選択してください');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage('画像は5MB以内にしてください');
      return;
    }

    setImageFile(file);
    setImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
    setMessage('');
  };

  const uploadShopImage = async ({
    file,
    shopId,
    userId,
  }: {
    file: File;
    shopId: string;
    userId: string;
  }) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/${shopId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(SHOP_IMAGES_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(SHOP_IMAGES_BUCKET).getPublicUrl(filePath);

    return publicUrl;
  };

  const updateShopImage = async (shopId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('画像ファイルを選択してください');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage('画像は5MB以内にしてください');
      return;
    }

    setIsUploadingImage(true);
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('ログインが必要です');
        return;
      }

      const imageUrl = await uploadShopImage({
        file,
        shopId,
        userId: user.id,
      });

      const { data, error } = await supabase
        .from('shops')
        .update({ image_url: imageUrl })
        .eq('id', shopId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedImageUrl = data.image_url ?? imageUrl;
      const previousImagePath = getShopImagePath(selectedShop?.imageUrl);

      if (previousImagePath) {
        await supabase.storage
          .from(SHOP_IMAGES_BUCKET)
          .remove([previousImagePath]);
      }

      setShops((prev) =>
        prev.map((shop) =>
          shop.id === shopId ? { ...shop, imageUrl: updatedImageUrl } : shop
        )
      );
      setSelectedShop((current) =>
        current?.id === shopId
          ? { ...current, imageUrl: updatedImageUrl }
          : current
      );
      setMessage('');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '画像の更新に失敗しました'
      );
    } finally {
      setIsUploadingImage(false);

      if (editImageInputRef.current) {
        editImageInputRef.current.value = '';
      }
    }
  };

  const deleteShopImage = async (shop: Shop) => {
    if (!shop.imageUrl || isDeletingImage) return;
    if (!window.confirm('この写真を削除しますか？')) return;

    setIsDeletingImage(true);
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage('ログインが必要です');
        return;
      }

      const previousImagePath = getShopImagePath(shop.imageUrl);

      const { error } = await supabase
        .from('shops')
        .update({ image_url: null })
        .eq('id', shop.id)
        .eq('user_id', user.id);

      if (error) throw error;

      if (previousImagePath) {
        await supabase.storage
          .from(SHOP_IMAGES_BUCKET)
          .remove([previousImagePath]);
      }

      setShops((prev) =>
        prev.map((currentShop) =>
          currentShop.id === shop.id
            ? { ...currentShop, imageUrl: undefined }
            : currentShop
        )
      );
      setSelectedShop((current) =>
        current?.id === shop.id ? { ...current, imageUrl: undefined } : current
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '画像の削除に失敗しました'
      );
    } finally {
      setIsDeletingImage(false);
    }
  };

  useEffect(() => {
  const loadShops = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 未ログインなら空の一覧
    if (!user) {
      setShops([]);
      return;
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(`店舗一覧の取得に失敗しました: ${error.message}`);
      return;
    }

    // DBの snake_case を画面用の camelCase に変換
    setShops(
      (data ?? []).map((shop) => ({
        id: shop.id,
        name: shop.name,
        postalCode: shop.postal_code ?? '',
        address: shop.address ?? '',
        category: shop.category ?? '',
        comment: shop.comment ?? '',
        imageUrl: shop.image_url ?? undefined,
        latitude: shop.latitude ?? undefined,
        longitude: shop.longitude ?? undefined,
        createdAt: shop.created_at ?? '',
      }))
    );
  };

  loadShops();
}, []);

  const handleDelete = async (shopToDelete: Shop) => {
  if (!window.confirm('このお店をリストから削除しますか？')) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('ログインが必要です');
      return;
    }

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopToDelete.id)
      .eq('user_id', user.id);

    if (error) throw error;

    const imagePath = getShopImagePath(shopToDelete.imageUrl);

    if (imagePath) {
      await supabase.storage
        .from(SHOP_IMAGES_BUCKET)
        .remove([imagePath]);
    }

    // 削除成功後に画面からも消す
    setShops((prev) => prev.filter((shop) => shop.id !== shopToDelete.id));
    setSelectedShop((current) =>
      current?.id === shopToDelete.id ? null : current
    );
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : '削除に失敗しました'
    );
  }
};

  const handleSubmit = async () => {
  if (isSubmitting) return;

  const name = shopName.trim();

  if (!name) {
    setMessage('お店の名前を入力してください');
    return;
  }

  try {
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('ログインが必要です');
      return;
    }

    const { data, error } = await supabase
      .from('shops')
      .insert({
        // これが「このユーザーが登録した店舗」にするための重要な値
        user_id: user.id,
        name,
        category: category.trim(),
        address: address.trim(),
        comment: comment.trim(),
        latitude: mapPosition?.lat ?? null,
        longitude: mapPosition?.lng ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await uploadShopImage({
        file: imageFile,
        shopId: data.id,
        userId: user.id,
      });

      const { data: updatedData, error: updateError } = await supabase
        .from('shops')
        .update({ image_url: imageUrl })
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      data.image_url = updatedData.image_url ?? imageUrl;
    }

    const createdShop: Shop = {
      id: data.id,
      name: data.name,
      postalCode: data.postal_code ?? '',
      address: data.address ?? '',
      category: data.category ?? '',
      comment: data.comment ?? '',
      imageUrl: data.image_url ?? imageUrl,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      createdAt: data.created_at ?? '',
    };

    setShops((prev) => [...prev, createdShop]);
    setShopName('');
    setCategory('');
    setAddress('');
    setMapPosition(null);
    setComment('');
    clearCreateImage();
    setMessage('');
    setIsModalOpen(false);
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : '登録に失敗しました'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const filteredShops = shops.filter((shop) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      shop.name.toLowerCase().includes(q) ||
      (shop.category ?? '').toLowerCase().includes(q) ||
      (shop.address ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        {/* Search bar + Add button row */}
        <div style={styles.actionRow}>
          <div style={styles.searchBar}>
            <MagnifyingGlass />
            <input
              type="text"
              placeholder="検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="お店を検索"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={styles.addButton}
          >
            お店の追加
          </button>
        </div>

        <section style={styles.cardList} aria-label="お店一覧">
          {filteredShops.map((shop) => (
            <ShopCard
              key={shop.id}
              name={shop.name}
              postalCode={shop.postalCode}
              address={shop.address}
              category={shop.category}
              latitude={shop.latitude}
              longitude={shop.longitude}
              googleMapsApiKey={googleMapsApiKey}
              imageUrl={shop.imageUrl}
              onSelect={() => setSelectedShop(shop)}
              onDelete={() => handleDelete(shop)}
            />
          ))}
        </section>

        {isModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="お店を追加"
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.placeSearchBlock}>
                <label style={styles.label}>行きたいお店：</label>
                <ShopPlacePicker
                  apiKey={googleMapsApiKey}
                  query={shopName}
                  position={mapPosition}
                  onQueryChange={handlePlaceQueryChange}
                  onPlaceSelect={handlePlaceSelect}
                  onError={handlePlaceError}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>カテゴリ：</span>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.underlineInput}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>住所：</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="候補を選ぶと自動入力されます"
                  style={styles.underlineInput}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>画像：</span>
                <input
                  ref={createImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    selectCreateImage(event.target.files?.[0] ?? null)
                  }
                  style={styles.fileInput}
                />
                <button
                  type="button"
                  onClick={() => createImageInputRef.current?.click()}
                  style={styles.photoButton}
                >
                  写真を追加
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={clearCreateImage}
                    style={styles.textButton}
                  >
                    クリア
                  </button>
                )}
              </div>

              {imagePreviewUrl && (
                <div
                  aria-label="選択した写真のプレビュー"
                  role="img"
                  style={{
                    ...styles.imagePreview,
                    backgroundImage: `url("${imagePreviewUrl}")`,
                  }}
                />
              )}

              <div style={styles.commentRow}>
                <span
                  style={{
                    ...styles.label,
                    alignSelf: 'flex-start',
                    paddingTop: 4,
                  }}
                >
                  コメント：
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              {message && <p style={styles.message}>{message}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  ...styles.submitButton,
                  ...(isSubmitting ? styles.disabledButton : null),
                }}
              >
                {isSubmitting ? '追加中' : '追加'}
              </button>
            </section>
          </div>
        )}
        {selectedShop && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setSelectedShop(null)}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="お店の詳細"
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={styles.detailTitle}>{selectedShop.name}</h2>

              <div style={styles.detailRow}>
                <span style={styles.label}>カテゴリ：</span>
                <span style={styles.detailText}>
                  {selectedShop.category || '未登録'}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>郵便番号：</span>
                <span style={styles.detailText}>
                  {selectedShop.postalCode || '未登録'}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>住所：</span>
                <span style={styles.detailText}>
                  {selectedShop.address || '未登録'}
                </span>
              </div>

              <div style={styles.detailCommentBlock}>
                <span style={styles.label}>口コミ：</span>
                <p style={styles.detailComment}>
                  {selectedShop.comment || '口コミはまだありません'}
                </p>
              </div>

              {selectedShop.imageUrl && (
                <img
                  src={selectedShop.imageUrl}
                  alt={`${selectedShop.name}の画像`}
                  style={styles.detailImage}
                />
              )}

              <div style={styles.detailImageActions}>
                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && selectedShop) {
                      updateShopImage(selectedShop.id, file);
                    }
                  }}
                  style={styles.fileInput}
                />
                <button
                  type="button"
                  onClick={() => editImageInputRef.current?.click()}
                  disabled={isUploadingImage || isDeletingImage}
                  style={{
                    ...styles.photoButton,
                    ...(isUploadingImage || isDeletingImage
                      ? styles.disabledButton
                      : null),
                  }}
                >
                  {selectedShop.imageUrl ? '写真を変更' : '写真を追加'}
                </button>

                {selectedShop.imageUrl && (
                  <button
                    type="button"
                    onClick={() => deleteShopImage(selectedShop)}
                    disabled={isUploadingImage || isDeletingImage}
                    style={{
                      ...styles.dangerButton,
                      ...(isUploadingImage || isDeletingImage
                        ? styles.disabledButton
                        : null),
                    }}
                  >
                    {isDeletingImage ? '削除中' : '写真を削除'}
                  </button>
                )}
              </div>

              {message && <p style={styles.message}>{message}</p>}

              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                style={styles.submitButton}
              >
                閉じる
              </button>
            </section>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    paddingTop: 72,
    paddingBottom: 72,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 18px 96px',
    boxSizing: 'border-box',
    position: 'relative',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    padding: '0 10px',
    background: '#F2F2F2',
    border: '1px solid #DEDEDE',
    boxSizing: 'border-box',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    color: '#333',
    outline: 'none',
  },
  addButton: {
    flexShrink: 0,
    height: 35,
    padding: '0 12px',
    background: '#9EC9FF',
    border: '1px solid #1F1F1F',
    borderRadius: 1,
    color: '#111',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #264A7A',
    whiteSpace: 'nowrap',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 33,
    maxWidth: 270,
    margin: '0 auto',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.55)',
    zIndex: 5,
  },
  modalCard: {
    width: 'min(80vw, 320px)',
    maxHeight: 'calc(100dvh - 120px)',
    padding: '20px 18px 16px',
    border: '1px solid #888',
    borderRadius: 14,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxSizing: 'border-box',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  placeSearchBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderBottom: '1px solid #ddd',
    paddingBottom: 6,
  },
  label: {
    color: '#555',
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  underlineInput: {
    flex: 1,
    minWidth: 0,
    height: 20,
    padding: '2px 0',
    border: 'none',
    background: 'transparent',
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box',
  },
  photoButton: {
    padding: '3px 10px',
    background: '#fff',
    border: '1px solid #bbb',
    borderRadius: 4,
    fontSize: 11,
    color: '#444',
    cursor: 'pointer',
  },
  textButton: {
    border: 'none',
    background: 'transparent',
    color: '#777',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  imagePreview: {
    width: '100%',
    height: 120,
    border: '1px solid #ddd',
    borderRadius: 6,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#f2f2f2',
  },
  commentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  textarea: {
    flex: 1,
    minWidth: 0,
    height: 72,
    padding: '4px 6px',
    border: '1px solid #bbb',
    borderRadius: 4,
    background: '#fff',
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    resize: 'none',
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  message: {
    color: '#e00',
    fontSize: 11,
    margin: 0,
  },
  submitButton: {
    alignSelf: 'center',
    minWidth: 58,
    height: 24,
    marginTop: 2,
    padding: '0 14px',
    border: 'none',
    borderRadius: 4,
    background: '#F5B042',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #C98421',
  },
  detailTitle: {
    margin: '0 0 4px',
    color: '#333',
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    borderBottom: '1px solid #eee',
    paddingBottom: 6,
  },
  detailText: {
    flex: 1,
    minWidth: 0,
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  detailCommentBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  detailComment: {
    minHeight: 72,
    margin: 0,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: 4,
    color: '#333',
    background: '#fffdf5',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  detailImage: {
    width: '100%',
    maxHeight: 180,
    objectFit: 'cover',
    borderRadius: 6,
  },
  detailImageActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dangerButton: {
    padding: '3px 10px',
    background: '#fff',
    border: '1px solid #d48a8a',
    borderRadius: 4,
    color: '#b33',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  disabledButton: {
    opacity: 0.55,
    cursor: 'wait',
  },
};
