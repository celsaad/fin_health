/**
 * tRPC context creation
 * Extracts user ID from Supabase JWT token
 */

import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDatabase, type Database } from '@fin-health/db';

let supabase: SupabaseClient;
let db: Database;

function initializeClients() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!databaseUrl) missing.push('DATABASE_URL');

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        `In local development: ensure .env file exists in monorepo root\n` +
        `In Docker: ensure environment variables are set in docker-compose.yml`
      );
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
    db = getDatabase();
  }
}

export interface Context {
  db: Database;
  userId: string | null;
  supabase: typeof supabase;
}

export async function createContext({
  req,
}: CreateExpressContextOptions): Promise<Context> {
  // Initialize clients if not already done
  initializeClients();

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
