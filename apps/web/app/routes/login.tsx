/**
 * Login route
 */

import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { createTRPCClient } from '~/lib/trpc.server';
import { createUserSession, getAuthToken } from '~/lib/auth.server';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getAuthToken(request);

  if (token) {
    return redirect('/dashboard');
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const trpc = createTRPCClient();
    const result = await trpc.auth.signIn.mutate({
      email: email.toString(),
      password: password.toString(),
    });

    return createUserSession(result.session.access_token, '/dashboard');
  } catch (error) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          {actionData?.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {actionData.error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-sm font-medium text-blue-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
