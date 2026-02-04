/**
 * Authentication utilities for Remix
 */

import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create session storage for auth tokens
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET || 'default-secret-change-in-production'],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export { sessionStorage };

/**
 * Get session from request
 */
export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

/**
 * Commit session to response headers
 */
export async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.commitSession(session);
}

/**
 * Destroy session
 */
export async function destroySession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.destroySession(session);
}

/**
 * Get auth token from session
 */
export async function getAuthToken(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get('token') || null;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(request: Request) {
  const token = await getAuthToken(request);

  if (!token) {
    throw redirect('/login');
  }

  // Verify token with Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw redirect('/login');
  }

  return { user, token };
}

/**
 * Create session and return Set-Cookie header
 */
export async function createUserSession(token: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('token', token);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

/**
 * Logout user and destroy session
 */
export async function logout(request: Request) {
  const session = await getSession(request);

  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
