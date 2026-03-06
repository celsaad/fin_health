import { BarChart3, LayoutDashboard, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface OnboardingSlide {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  gradient: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    icon: LayoutDashboard,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    icon: ShieldCheck,
    gradient: 'from-amber-500 to-orange-600',
  },
];
