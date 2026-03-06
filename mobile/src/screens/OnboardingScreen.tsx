import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
  navigation?: any;
}

const pages = [
  {
    Icon: BarChart3,
    iconBg: '#0d9488',
    title: 'Take Control of Your Finances',
    subtitle:
      'Track every penny, set smart budgets, and reach your savings goals faster with FinHealth.',
    button: 'Next',
  },
  {
    Icon: LayoutDashboard,
    iconBg: '#6366f1',
    title: 'Smart Insights, Better Habits',
    subtitle:
      'Get automated spending breakdowns and alerts when you are close to your limits.',
    button: 'Next',
  },
  {
    Icon: ShieldCheck,
    iconBg: '#6366f1',
    title: 'Secure & Always in Sync',
    subtitle:
      'Your data is encrypted and accessible across all your devices. We use bank-level security to keep your finances safe.',
    button: 'Get Started',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  function goNext() {
    if (activeIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onComplete();
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.logo, { color: colors.primary }]}>FinHealth</Text>
        {activeIndex < pages.length - 1 && (
          <TouchableOpacity onPress={onComplete}>
            <Text style={[styles.skip, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={[styles.illustrationCard, { backgroundColor: item.iconBg + '15' }]}>
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <item.Icon size={48} color="#ffffff" />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button title={pages[activeIndex].button} onPress={goNext} />
        {activeIndex === pages.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.signInLink}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Sign In Instead</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  logo: { fontSize: FontSize.sectionHeader, fontWeight: '700' },
  skip: { fontSize: FontSize.body, fontWeight: '500' },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  illustrationCard: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.lg + 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.pageTitle,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.body + 1,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  signInLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkText: {
    fontSize: FontSize.body,
    fontWeight: '500',
  },
});
