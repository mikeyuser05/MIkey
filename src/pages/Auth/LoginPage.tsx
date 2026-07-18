import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity, Loader2 } from 'lucide-react';
import { loginWithEmail } from '@services/firebase/authService';
import { ROUTES } from '@constants/routes.constants';
import { APP_NAME } from '@constants/app.constants';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage(): ReactElement {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: 'onBlur' });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      await loginWithEmail(values.email, values.password);
      toast.success('Signed in successfully');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background-light px-4 dark:bg-background-dark">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Activity className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{APP_NAME}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="focus-ring rounded-xl border border-border-light bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-border-dark dark:text-slate-100"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            {errors.email && <p className="text-xs text-status-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="focus-ring rounded-xl border border-border-light bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-border-dark dark:text-slate-100"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {errors.password && (
              <p className="text-xs text-status-danger">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
