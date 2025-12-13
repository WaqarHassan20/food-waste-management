import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Logo } from '../components/ui';
import { Users, UtensilsCrossed, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';
import { authAPI } from '../services/api';

interface AuthPageProps {
  onLogin: (role: UserRole, name: string, token: string, userId: string) => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: UserRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, initialMode = 'signin', initialRole }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    adminPasscode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setIsLoading(false);
          return;
        }

        let response: any;

        if (selectedRole === 'RESTAURANT') {
          // Use restaurant registration endpoint
          response = await authAPI.restaurantRegister({
            email: formData.email,
            password: formData.password,
            restaurantName: formData.name,
            description: '',
            address: formData.address || '',
            phone: formData.phone || '',
          });

          // Backend returns { success, message, data: { restaurant, token } }
          // Axios interceptor extracts response.data, so we get { success, message, data }
          const { restaurant, token } = response.data || response;

          if (!restaurant || !token) {
            throw new Error('Invalid response from server');
          }

          // Save token and restaurant data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify({
            ...restaurant,
            role: 'RESTAURANT',
            name: restaurant.restaurantName,
          }));

          onLogin('RESTAURANT', restaurant.restaurantName, token, restaurant.id);
        } else {
          // Use regular user registration endpoint
          response = await authAPI.register({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: selectedRole,
            phone: formData.phone || undefined,
            address: formData.address || undefined,
            adminPasscode: selectedRole === 'ADMIN' ? formData.adminPasscode : undefined,
          });

          // Backend returns { success, message, data: { user, token } }
          // Axios interceptor extracts response.data, so we get { success, message, data }
          const { user, token } = response.data || response;

          if (!user || !token) {
            throw new Error('Invalid response from server');
          }

          // Save token to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          onLogin(user.role, user.name, token, user.id);
        }
      } else {
        // Login logic
        let response: any;

        if (selectedRole === 'RESTAURANT') {
          response = await authAPI.restaurantLogin(formData.email, formData.password);

          // Backend returns { success, message, data: { restaurant, token } }
          // Axios interceptor extracts response.data, so we get { success, message, data }
          const { restaurant, token } = response.data || response;

          if (!restaurant || !token) {
            throw new Error('Invalid response from server');
          }

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify({
            ...restaurant,
            role: 'RESTAURANT',
            name: restaurant.restaurantName,
          }));

          onLogin('RESTAURANT', restaurant.restaurantName, token, restaurant.id);
        } else {
          response = await authAPI.login(
            formData.email,
            formData.password,
            selectedRole === 'ADMIN' ? formData.adminPasscode : undefined
          );

          // Backend returns { success, message, data: { user, token } }
          // Axios interceptor extracts response.data, so we get { success, message, data }
          const { user, token } = response.data || response;

          if (!user || !token) {
            throw new Error('Invalid response from server');
          }

          // Save token to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          onLogin(user.role, user.name, token, user.id);
        }
      }
    } catch (err: any) {
      // Extract error message from various possible error structures
      let errorMessage = 'Authentication failed. Please try again.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-screen bg-linear-to-br from-emerald-100 via-teal-100 to-cyan-100 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto py-4">
        {/* Header - More compact */}
        <div className="text-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-3 font-medium transition-colors group text-sm"
          >
            <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1">Back to Home</span>
          </button>
          <div className="mb-2 flex justify-center">
            <Logo size="lg" variant="color" showText={false} iconOnly={true} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
            {isSignUp ? 'Join FoodShare' : 'Welcome Back!'}
          </h1>
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Create your account and start making a difference' : 'Sign in to continue your journey'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Role Selection - More compact */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Select your role:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('USER')}
                  className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'USER'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <Users size={24} className="mb-1" />
                  <div className="text-xs font-semibold">User</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('RESTAURANT')}
                  className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'RESTAURANT'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <UtensilsCrossed size={24} className="mb-1" />
                  <div className="text-xs font-semibold">Restaurant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'ADMIN'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <Shield size={24} className="mb-1" />
                  <div className="text-xs font-semibold">Admin</div>
                </button>
              </div>
            </div>

            {/* Form - More compact spacing */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-2 animate-shake">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-xs">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              {isSignUp && (
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />

              {selectedRole === 'ADMIN' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <Input
                    label="Admin Passcode"
                    type="password"
                    name="adminPasscode"
                    value={formData.adminPasscode}
                    onChange={handleInputChange}
                    placeholder="Enter admin passcode"
                    required
                  />
                  <p className="text-xs text-amber-700 mt-1">
                    ⚠️ Admin access requires a special passcode.
                  </p>
                </div>
              )}

              {isSignUp && (
                <>
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                  />

                  {/* Optional fields in a collapsible section for signup */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Phone (Optional)"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                    />

                    <Input
                      label="Address (Optional)"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-4 text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-xs mb-1">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold hover:underline transition-all"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
