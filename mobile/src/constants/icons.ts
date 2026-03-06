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
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export const IconMap: Record<string, LucideIcon> = {
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
};

export const DefaultIcon = Wallet;

// Build a case-insensitive lookup
const iconMapLower: Record<string, LucideIcon> = {};
for (const [key, value] of Object.entries(IconMap)) {
  iconMapLower[key.toLowerCase()] = value;
}

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return DefaultIcon;
  return IconMap[iconName] ?? iconMapLower[iconName.toLowerCase()] ?? DefaultIcon;
}
