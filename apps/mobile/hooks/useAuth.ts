/**
 * Auth hook for managing authentication state
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Store token in AsyncStorage for tRPC
      if (session?.access_token) {
        AsyncStorage.setItem('auth_token', session.access_token);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Update token in AsyncStorage
      if (session?.access_token) {
        AsyncStorage.setItem('auth_token', session.access_token);
      } else {
        AsyncStorage.removeItem('auth_token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('auth_token');
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
