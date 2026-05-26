import { useRouter } from 'expo-router';
import { useOnboarding } from '../src/contexts/OnboardingContext';
import OnboardingScreen from '../src/screens/OnboardingScreen';

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  async function handleComplete() {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }

  return <OnboardingScreen onComplete={handleComplete} />;
}
