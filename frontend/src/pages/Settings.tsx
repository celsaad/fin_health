import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  LogOut,
  User,
  KeyRound,
  Sun,
  Moon,
  Monitor,
  CreditCard,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';
import api, { parseError } from '@/lib/api';

export default function Settings() {
  const { t } = useTranslation();
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isPro, isFree, isTrialing, isCanceling, currentPeriodEnd, trialEndsAt } = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('preferredCurrency') || 'USD',
  );
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [upgrading, setUpgrading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle checkout redirect
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;

    if (checkout === 'success') {
      toast.success(t('billing.checkoutSuccess'));
      refreshUser();
    } else if (checkout === 'cancel') {
      toast.info(t('billing.checkoutCancel'));
    }

    // Clean the URL
    searchParams.delete('checkout');
    setSearchParams(searchParams, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { data } = await api.post<{ url: string }>('/billing/checkout', {
        interval: billingInterval,
      });
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(parseError(err).message);
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const { data } = await api.get<{ url: string }>('/billing/portal');
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(parseError(err).message);
      setManagingBilling(false);
    }
  };

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
            <p className="text-xs text-muted-foreground">{t('settings.currencyHint')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Section: Subscription */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('billing.sectionTitle')}
      </p>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" aria-hidden="true" />
            {t('billing.currentPlan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isPro ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {isPro
                ? t('billing.proBadge')
                : isTrialing
                  ? t('billing.trialBadge')
                  : t('billing.freeBadge')}
            </span>
            {isCanceling && (
              <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-semibold">
                {t('billing.cancelingBadge')}
              </span>
            )}
          </div>
          {isTrialing && trialEndsAt && (
            <p className="text-sm text-muted-foreground">
              {t('billing.trialEndsOn', { date: new Date(trialEndsAt).toLocaleDateString() })}
            </p>
          )}
          {isPro && currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {isCanceling
                ? t('billing.endsOn', { date: new Date(currentPeriodEnd).toLocaleDateString() })
                : t('billing.renewsOn', { date: new Date(currentPeriodEnd).toLocaleDateString() })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upgrade card (free users) */}
      {isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" aria-hidden="true" />
              {t('billing.upgradeTitle')}
            </CardTitle>
            <CardDescription>{t('billing.upgradeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="inline-flex rounded-lg border border-border p-1 gap-1">
                {(
                  [
                    { value: 'monthly' as const, label: t('billing.monthly') },
                    { value: 'yearly' as const, label: t('billing.yearly') },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setBillingInterval(value)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      billingInterval === value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                    {value === 'yearly' && (
                      <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {t('billing.yearlySavings')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-2xl font-bold">
                {billingInterval === 'monthly'
                  ? t('billing.monthlyPrice')
                  : t('billing.yearlyPrice')}
              </p>
            </div>
            <Button onClick={handleUpgrade} disabled={upgrading} className="w-full sm:w-auto">
              <CreditCard className="size-4" aria-hidden="true" />
              {upgrading ? t('billing.upgrading') : t('billing.upgradeCta')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manage subscription card (pro users) */}
      {isPro && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">{t('billing.manageDesc')}</p>
            <Button variant="outline" onClick={handleManageBilling} disabled={managingBilling}>
              <CreditCard className="size-4" aria-hidden="true" />
              {managingBilling ? t('billing.managing') : t('billing.manageCta')}
            </Button>
          </CardContent>
        </Card>
      )}

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
