import { trpcClient } from '../lib/trpc';

export async function changePassword(currentPassword: string, newPassword: string) {
  return trpcClient.auth.changePassword.mutate({ currentPassword, newPassword });
}
