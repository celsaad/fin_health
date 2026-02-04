/**
 * Index route - redirect to dashboard or login
 */

import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { getAuthToken } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getAuthToken(request);

  if (token) {
    return redirect('/dashboard');
  }

  return redirect('/login');
}
