/**
 * tRPC context creation
 * Extracts user ID from Supabase JWT token
 */

import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { createClient } from '@supabase/supabase-js';
import { getDatabase, type Database } from '@fin-health/db';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const db = getDatabase(databaseUrl);

export interface Context {
  db: Database;
  userId: string | null;
  supabase: typeof supabase;
}

export async function createContext({
  req,
}: CreateExpressContextOptions): Promise<Context> {
  // Extract access token from Authorization header
  const authHeader = req.headers.authorization;
  let userId: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      // Verify the JWT with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.warn('Auth verification failed:', error?.message);
      } else {
        userId = user.id;
      }
    } catch (error) {
      console.error('Error verifying auth token:', error);
    }
  }

  return {
    db,
    userId,
    supabase,
  };
}
