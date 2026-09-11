import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

/** Sign up with email + password */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
}

/** Sign in with email + password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/** Sign out */
export async function signOut() {
  await supabase.auth.signOut();
}

/** Get current user */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Get user profile from profiles table */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.warn("[supabase] getProfile:", error.message);
    return null;
  }
  return data;
}

/** Listen to auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
