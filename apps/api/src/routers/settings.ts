/**
 * User settings router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas } from '@fin-health/domain';

export const settingsRouter = router({
  /**
   * Get current user settings
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.userId,
      },
      select: {
        currency: true,
        timezone: true,
        monthStartDay: true,
      },
    });

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
      const updatedUser = await ctx.db.user.update({
        where: {
          id: ctx.userId,
        },
        data: input,
        select: {
          currency: true,
          timezone: true,
          monthStartDay: true,
        },
      });

      return updatedUser;
    }),
});
