import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onboardingSlides } from '@/lib/onboarding';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;

  const complete = (path: string) => {
    localStorage.setItem('hasOnboarded', 'true');
    navigate(path);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Illustration area */}
        <div
          className={`mx-auto flex size-48 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.gradient} shadow-lg`}
        >
          <slide.icon className="size-24 text-white" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
          <p className="text-muted-foreground">{slide.description}</p>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2">
          {onboardingSlides.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all ${
                i === step ? 'h-2.5 w-6 bg-primary' : 'size-2.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isLast ? (
            <>
              <Button className="w-full rounded-full" size="lg" onClick={() => complete('/signup')}>
                Get Started
                <ArrowRight className="size-4" />
              </Button>
              <button
                onClick={() => complete('/login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In Instead
              </button>
            </>
          ) : (
            <>
              <Button className="w-full rounded-full" size="lg" onClick={() => setStep(step + 1)}>
                Next
                <ArrowRight className="size-4" />
              </Button>
              <button
                onClick={() => complete('/login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip onboarding
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
