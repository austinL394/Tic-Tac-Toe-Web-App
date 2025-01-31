// src/components/features/Register/Register.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LoginLayout from '@/components/Layout/LoginLayout';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

type FormInputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigate = useNavigate();
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'validate',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      const response = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      console.log("@@ register response", response);

      login(response.user, response.token);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || error.message || 'Registration failed',
      });
    }
  };

  return (
    <LoginLayout>
      <div className="flex justify-center min-h-screen py-8">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Create Account</h2>

          {errors.root && (
            <div className="mb-6 text-center text-white bg-red-500/20 py-2 rounded-lg" data-testid="error-message">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="h-24">
              <label className="block">
                <span className="block text-sm text-white text-left mb-1">Username</span>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Username can only contain letters, numbers, underscores and dashes',
                    },
                  })}
                />
                <div className="h-5 mt-1">
                  {errors.username && <p className="text-sm text-white">{errors.username.message}</p>}
                </div>
              </label>
            </div>

            <div className="h-24">
              <label className="block">
                <span className="block text-sm text-white text-left mb-1">Email</span>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <div className="h-5 mt-1">
                  {errors.email && <p className="text-sm text-white">{errors.email.message}</p>}
                </div>
              </label>
            </div>

            <div className="h-24">
              <label className="block">
                <span className="block text-sm text-white text-left mb-1">Password</span>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                    },
                  })}
                />
                <div className="h-5 mt-1">
                  {errors.password && <p className="text-sm text-white">{errors.password.message}</p>}
                </div>
              </label>
            </div>

            <div className="h-24">
              <label className="block">
                <span className="block text-sm text-white text-left mb-1">Confirm Password</span>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match',
                  })}
                />
                <div className="h-5 mt-1">
                  {errors.confirmPassword && <p className="text-sm text-white">{errors.confirmPassword.message}</p>}
                </div>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center text-white text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300">
                Login here
              </a>
            </div>
          </form>
        </div>
      </div>
    </LoginLayout>
  );
};

export default Register;
