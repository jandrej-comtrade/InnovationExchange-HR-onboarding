import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingHub from '@/components/OnboardingHub';
import DebugInfo from '@/components/DebugInfo';

export default function HomePage() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-hr-50 to-primary-50">
        <div className="container mx-auto px-4 py-8">
          <OnboardingHub />
        </div>
        <DebugInfo />
      </div>
    </OnboardingProvider>
  );
}
