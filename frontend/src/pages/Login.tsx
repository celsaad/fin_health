import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { parseError } from '@/lib/api';
import { Heart, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error: unknown) {
      toast.error(parseError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <TrendingUp className="size-7" strokeWidth={2.5} />
            <Heart className="size-4 -ml-1.5 mt-3" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">FinHealth</h1>
            <p className="text-sm text-muted-foreground">Welcome back to your financial health</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-muted/50 rounded-xl"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="bg-muted/50 rounded-xl pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase">
            Or continue with
          </span>
        </div>

        {/* Social auth placeholders */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-full" type="button" disabled>
            Google
          </Button>
          <Button variant="outline" className="rounded-full" type="button" disabled>
            Apple
          </Button>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
