import api from './api';

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.put('/auth/password', { currentPassword, newPassword });
  return data;
}
