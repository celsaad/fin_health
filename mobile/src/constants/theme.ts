export interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  income: string;
  incomeBg: string;
  expense: string;
  expenseBg: string;
  inputBg: string;
  tabBar: string;
  destructive: string;
  amber: string;
  amberBg: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    background: 'hsl(220, 14%, 96%)',
    card: '#ffffff',
    text: 'hsl(224, 71%, 4%)',
    textSecondary: 'hsl(220, 9%, 46%)',
    border: 'hsl(220, 13%, 91%)',
    income: '#16a34a',
    incomeBg: '#f0fdf4',
    expense: '#dc2626',
    expenseBg: '#fef2f2',
    inputBg: 'hsl(220, 14%, 96%)',
    tabBar: '#ffffff',
    destructive: '#dc2626',
    amber: '#d97706',
    amberBg: '#fffbeb',
  },
  dark: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    background: '#0f1729',
    card: 'hsl(222, 47%, 11%)',
    text: 'hsl(210, 40%, 98%)',
    textSecondary: 'hsl(215, 20%, 65%)',
    border: 'hsl(217, 33%, 20%)',
    income: '#16a34a',
    incomeBg: '#052e16',
    expense: '#dc2626',
    expenseBg: '#450a0a',
    inputBg: 'hsl(222, 47%, 14%)',
    tabBar: 'hsl(222, 47%, 11%)',
    destructive: '#dc2626',
    amber: '#d97706',
    amberBg: '#451a03',
  },
};

export const CategoryColors: Record<string, { icon: string; bgLight: string; bgDark: string }> = {
  orange: { icon: '#ea580c', bgLight: '#fff7ed', bgDark: '#431407' },
  blue: { icon: '#2563eb', bgLight: '#eff6ff', bgDark: '#172554' },
  purple: { icon: '#7c3aed', bgLight: '#f5f3ff', bgDark: '#2e1065' },
  pink: { icon: '#db2777', bgLight: '#fdf2f8', bgDark: '#500724' },
  emerald: { icon: '#059669', bgLight: '#ecfdf5', bgDark: '#022c22' },
  amber: { icon: '#d97706', bgLight: '#fffbeb', bgDark: '#451a03' },
  red: { icon: '#dc2626', bgLight: '#fef2f2', bgDark: '#450a0a' },
  cyan: { icon: '#0891b2', bgLight: '#ecfeff', bgDark: '#083344' },
  teal: { icon: '#0d9488', bgLight: '#f0fdfa', bgDark: '#042f2e' },
  indigo: { icon: '#4f46e5', bgLight: '#eef2ff', bgDark: '#1e1b4b' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const FontSize = {
  caption: 12,
  body: 14,
  label: 14,
  sectionHeader: 18,
  pageTitle: 24,
  display: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
