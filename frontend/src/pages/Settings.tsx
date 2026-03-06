import { useState } from 'react';
import { LogOut, User, KeyRound, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import api, { parseError } from '@/lib/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('preferredCurrency') || 'USD',
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await api.put('/auth/password', { currentPassword, newPassword });
      if (data.token) localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(parseError(err).message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveCurrency = () => {
    localStorage.setItem('preferredCurrency', currency);
    toast.success('Currency preference saved');
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
          {initial}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{user?.name ?? 'User'}</p>
          <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
        </div>
      </div>

      {/* Section: Account Info */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Account Info
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user?.name ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Section: Display Preferences */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Display Preferences
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Customize how data is displayed in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Appearance</Label>
            <div className="inline-flex rounded-lg border border-border p-1 gap-1">
              {[
                { value: 'light' as const, icon: Sun, label: 'Light' },
                { value: 'dark' as const, icon: Moon, label: 'Dark' },
                { value: 'system' as const, icon: Monitor, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    theme === value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <div className="flex gap-2">
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                className="max-w-[120px]"
              />
              <Button onClick={handleSaveCurrency}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a currency code (e.g., USD, EUR, GBP)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section: Account Actions */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Account Actions
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Button variant="destructive" onClick={logout}>
            <LogOut className="size-4" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
