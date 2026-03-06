import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      toast.error(t('settings.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordsNoMatch'));
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await api.put('/auth/password', { currentPassword, newPassword });
      if (data.token) localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      toast.success(t('settings.passwordUpdated'));
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
    toast.success(t('settings.currencySaved'));
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
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
        {t('settings.accountInfoSection')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            {t('settings.accountInfoTitle')}
          </CardTitle>
          <CardDescription>{t('settings.accountInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.name')}</Label>
            <Input value={user?.name ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.email')}</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            {t('settings.changePasswordTitle')}
          </CardTitle>
          <CardDescription>{t('settings.changePasswordDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('settings.currentPasswordPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('settings.newPasswordPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('settings.confirmNewPasswordPlaceholder')}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? t('settings.updatingPassword') : t('settings.updatePassword')}
          </Button>
        </CardContent>
      </Card>

      {/* Section: Display Preferences */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('settings.displayPreferencesSection')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.displayPreferencesTitle')}</CardTitle>
          <CardDescription>{t('settings.displayPreferencesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.appearance')}</Label>
            <div className="inline-flex rounded-lg border border-border p-1 gap-1">
              {[
                { value: 'light' as const, icon: Sun, label: t('settings.themeLight') },
                { value: 'dark' as const, icon: Moon, label: t('settings.themeDark') },
                { value: 'system' as const, icon: Monitor, label: t('settings.themeSystem') },
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
            <Label htmlFor="currency">{t('settings.currency')}</Label>
            <div className="flex gap-2">
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                className="max-w-[120px]"
              />
              <Button onClick={handleSaveCurrency}>{t('common.save')}</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.currencyHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section: Account Actions */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('settings.accountActionsSection')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.accountActionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Button variant="destructive" onClick={logout}>
            <LogOut className="size-4" />
            {t('common.logOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
