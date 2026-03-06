import { BarChart3, LayoutDashboard, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface OnboardingSlide {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: 'Take Control of Your Finances',
    description:
      'Track your income, expenses, and budgets all in one place. Gain a clear picture of where your money goes.',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    title: 'Smart Insights, Better Habits',
    description:
      'Visualize your spending patterns with beautiful charts and breakdowns. Build better financial habits over time.',
    icon: LayoutDashboard,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Secure & Always in Sync',
    description:
      'Your data is encrypted and securely stored. Access your finances from any device, anytime.',
    icon: ShieldCheck,
    gradient: 'from-amber-500 to-orange-600',
  },
];
