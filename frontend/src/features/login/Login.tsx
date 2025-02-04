import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

type FormInputs = {
  username: string;
  password: string;
};

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    try {
      const { user, token } = await authService.login(data);
      login(user, token);

      navigate(from, { replace: true });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Invalid credentials',
      });
    }
  };

  return (
    <div className="flex justify-center min-h-screen py-8">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Login to Your Account</h2>

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
                })}
              />
              <div className="h-5 mt-1">
                {errors.username && <p className="text-sm text-white">{errors.username.message}</p>}
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
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <div className="h-5 mt-1">
                {errors.password && <p className="text-sm text-white">{errors.password.message}</p>}
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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
          <div className="text-center text-white text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300">
              Register here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
