import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Home,
  Heart,
  GraduationCap,
  Plane,
  Gift,
  Dumbbell,
  Smartphone,
  Briefcase,
  TrendingUp,
  DollarSign,
  Wallet,
  PawPrint,
  Landmark,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Film', icon: Film },
  { name: 'FileText', icon: FileText },
  { name: 'Home', icon: Home },
  { name: 'Heart', icon: Heart },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Plane', icon: Plane },
  { name: 'Gift', icon: Gift },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Wallet', icon: Wallet },
  { name: 'PawPrint', icon: PawPrint },
  { name: 'Landmark', icon: Landmark },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Wrench', icon: Wrench },
];

export const COLOR_OPTIONS: {
  name: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
}[] = [
  {
    name: 'orange',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-950',
  },
  { name: 'blue', color: 'text-blue-600', bgColor: 'bg-blue-100', darkBgColor: 'dark:bg-blue-950' },
  {
    name: 'purple',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-950',
  },
  { name: 'pink', color: 'text-pink-600', bgColor: 'bg-pink-100', darkBgColor: 'dark:bg-pink-950' },
  {
    name: 'emerald',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  {
    name: 'amber',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-950',
  },
  { name: 'red', color: 'text-red-600', bgColor: 'bg-red-100', darkBgColor: 'dark:bg-red-950' },
  { name: 'cyan', color: 'text-cyan-600', bgColor: 'bg-cyan-100', darkBgColor: 'dark:bg-cyan-950' },
  { name: 'teal', color: 'text-teal-600', bgColor: 'bg-teal-100', darkBgColor: 'dark:bg-teal-950' },
  {
    name: 'indigo',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-950',
  },
];

const iconByName: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((opt) => [opt.name, opt.icon]),
);

export function getIconByName(name: string): LucideIcon {
  return iconByName[name] ?? Wallet;
}

const colorByName: Record<string, { color: string; bgColor: string; darkBgColor: string }> =
  Object.fromEntries(
    COLOR_OPTIONS.map((opt) => [
      opt.name,
      { color: opt.color, bgColor: opt.bgColor, darkBgColor: opt.darkBgColor },
    ]),
  );

const categoryIconMap: Record<string, CategoryIconConfig> = {
  food: {
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-950',
  },
  'food & dining': {
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-950',
  },
  dining: {
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-950',
  },
  groceries: {
    icon: ShoppingBag,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-950',
  },
  transport: {
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-950',
  },
  transportation: {
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-950',
  },
  shopping: {
    icon: ShoppingBag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-950',
  },
  entertainment: {
    icon: Film,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    darkBgColor: 'dark:bg-pink-950',
  },
  bills: {
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  'bills & utilities': {
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  utilities: {
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  housing: {
    icon: Home,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-950',
  },
  rent: {
    icon: Home,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-950',
  },
  health: {
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-950',
  },
  healthcare: {
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-950',
  },
  education: {
    icon: GraduationCap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-950',
  },
  travel: {
    icon: Plane,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    darkBgColor: 'dark:bg-cyan-950',
  },
  gifts: {
    icon: Gift,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    darkBgColor: 'dark:bg-rose-950',
  },
  'gifts & donations': {
    icon: Gift,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    darkBgColor: 'dark:bg-rose-950',
  },
  fitness: {
    icon: Dumbbell,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    darkBgColor: 'dark:bg-teal-950',
  },
  subscriptions: {
    icon: Smartphone,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    darkBgColor: 'dark:bg-violet-950',
  },
  salary: {
    icon: Briefcase,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  investment: {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-950',
  },
  investments: {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-950',
  },
  freelance: {
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-950',
  },
  income: {
    icon: Wallet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-950',
  },
  insurance: {
    icon: FileText,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    darkBgColor: 'dark:bg-sky-950',
  },
};

const defaultConfig: CategoryIconConfig = {
  icon: Wallet,
  color: 'text-gray-600',
  bgColor: 'bg-gray-100',
  darkBgColor: 'dark:bg-gray-800',
};

export function getCategoryIcon(
  categoryName: string,
  dbIcon?: string | null,
  dbColor?: string | null,
): CategoryIconConfig {
  // If user has set icon/color in the database, use those
  if (dbIcon || dbColor) {
    const fallback = categoryIconMap[categoryName.toLowerCase().trim()] ?? defaultConfig;
    const resolvedIcon = dbIcon ? getIconByName(dbIcon) : fallback.icon;
    const resolvedColor =
      dbColor && colorByName[dbColor]
        ? colorByName[dbColor]
        : { color: fallback.color, bgColor: fallback.bgColor, darkBgColor: fallback.darkBgColor };

    return {
      icon: resolvedIcon,
      color: resolvedColor.color,
      bgColor: resolvedColor.bgColor,
      darkBgColor: resolvedColor.darkBgColor,
    };
  }

  // Fall back to static name-based map
  const key = categoryName.toLowerCase().trim();
  return categoryIconMap[key] ?? defaultConfig;
}
