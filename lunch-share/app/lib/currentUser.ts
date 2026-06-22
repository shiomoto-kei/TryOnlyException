import { supabase } from './supabaseClient';

const GUEST_USER_ID_KEY = 'lunch-share-guest-user-id';

export async function getOrCreateCurrentUser() {
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;

  if (authUser?.email) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();

    if (existingUser) return existingUser;

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: authUser.email.split('@')[0],
        email: authUser.email,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const guestUserId = localStorage.getItem(GUEST_USER_ID_KEY);

  if (guestUserId) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', guestUserId)
      .maybeSingle();

    if (existingUser) return existingUser;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: 'ゲストユーザー',
      email: '',
    })
    .select()
    .single();

  if (error) throw error;

  localStorage.setItem(GUEST_USER_ID_KEY, data.id);
  return data;
}