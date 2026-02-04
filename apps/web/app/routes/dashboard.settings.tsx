/**
 * Settings route
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';
import { createTRPCClient } from '~/lib/trpc.server';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const [user, settings] = await Promise.all([
    trpc.auth.me.query(),
    trpc.settings.get.query(),
  ]);

  return json({ user, settings });
}

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const formData = await request.formData();
  const currency = formData.get('currency');
  const timezone = formData.get('timezone');
  const monthStartDay = formData.get('monthStartDay');

  const updateData: {
    currency?: string;
    timezone?: string;
    monthStartDay?: number;
  } = {};

  if (currency) updateData.currency = currency.toString();
  if (timezone) updateData.timezone = timezone.toString();
  if (monthStartDay) updateData.monthStartDay = parseInt(monthStartDay.toString(), 10);

  try {
    await trpc.settings.update.mutate(updateData);
    return json({ success: true, message: 'Settings updated successfully!' });
  } catch (error) {
    return json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}

export default function Settings() {
  const { user, settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>

        {actionData?.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {actionData.message}
          </div>
        )}

        {actionData?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={settings.currency}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={settings.timezone}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>

          <div>
            <label htmlFor="monthStartDay" className="block text-sm font-medium text-gray-700 mb-1">
              Month Start Day
            </label>
            <select
              id="monthStartDay"
              name="monthStartDay"
              defaultValue={settings.monthStartDay}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              The day of the month when your budget period starts
            </p>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </Form>
      </Card>

      {/* About */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Version: 1.0.0</p>
          <p>Made with ❤️ using Claude Code</p>
        </div>
      </Card>
    </div>
  );
}
