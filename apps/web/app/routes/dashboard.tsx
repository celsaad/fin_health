/**
 * Dashboard layout with navigation
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';
import { createTRPCClient } from '~/lib/trpc.server';
import { Button } from '~/components/ui/Button';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const user = await trpc.auth.me.query();

  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Fin Health</h1>
              <nav className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Budget
                </Link>
                <Link
                  to="/dashboard/categories"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Categories
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Form method="post" action="/logout">
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
