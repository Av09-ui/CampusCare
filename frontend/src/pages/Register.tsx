import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Alert } from '../components/Alert';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateForm } = useForm<RegisterForm>(
    { email: '', password: '', confirmPassword: '' },
    (values) => {
      const errors: Partial<Record<keyof RegisterForm, string>> = {};
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (values.password && values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (values.confirmPassword && values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
      return errors;
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Join CampusCare to report and track issues</p>
      </div>

      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="College Email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          autoComplete="email"
          placeholder="student@college.edu"
          disabled={isLoading}
          helperText="Use your college email address"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isLoading}
          helperText="At least 8 characters"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}