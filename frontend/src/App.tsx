import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Categories = lazy(() => import('@/pages/Categories'));
const Budgets = lazy(() => import('@/pages/Budgets'));
const RecurringTransactions = lazy(() => import('@/pages/RecurringTransactions'));
const Spending = lazy(() => import('@/pages/Spending'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <CardSkeleton />
    </div>
  );
}

function OnboardingGate() {
  const hasOnboarded = localStorage.getItem('hasOnboarded');
  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Login />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<OnboardingGate />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="spending" element={<Spending />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="recurring" element={<RecurringTransactions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
