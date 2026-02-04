/**
 * User settings router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas } from '@fin-health/domain';
import { users } from '@fin-health/db';
import { eq } from 'drizzle-orm';

export const settingsRouter = router({
  /**
   * Get current user settings
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        currency: users.currency,
        timezone: users.timezone,
        monthStartDay: users.monthStartDay,
      })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  /**
   * Update user settings
   */
  update: protectedProcedure
    .input(schemas.updateSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.currency !== undefined) {
        updateData.currency = input.currency;
      }
      if (input.timezone !== undefined) {
        updateData.timezone = input.timezone;
      }
      if (input.monthStartDay !== undefined) {
        updateData.monthStartDay = input.monthStartDay;
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.userId))
        .returning({
          currency: users.currency,
          timezone: users.timezone,
          monthStartDay: users.monthStartDay,
        });

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return updatedUser;
    }),
});
