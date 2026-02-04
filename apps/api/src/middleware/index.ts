/**
 * Export middleware and create protected procedure
 */

import { publicProcedure } from '../trpc.js';
import { isAuthenticated } from './auth.js';

export const protectedProcedure = publicProcedure.use(isAuthenticated);

export { isAuthenticated };
