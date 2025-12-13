import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Logo } from '../components/ui';
import { Users, UtensilsCrossed, Shield, ArrowLeft } from 'lucide-react';
import type { UserRole } from '../types';
import { authAPI } from '../services/api';

interface AuthPageProps {
  onLogin: (role: UserRole, name: string, token: string, userId: string) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, initialMode = 'signin' }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
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
          response = await authAPI.login(formData.email, formData.password);

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
      setError(err.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-teal-100 to-cyan-100 py-16 px-4 flex items-center justify-center">
      <div className="container mx-auto max-w-lg">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-6 font-medium transition-colors group"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform" />
            <span className="ml-2">Back to Home</span>
          </button>
          <div className="mb-4 flex justify-center">
            <Logo size="xl" variant="color" showText={false} iconOnly={true} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            {isSignUp ? 'Join FoodShare' : 'Welcome Back!'}
          </h1>
          <p className="text-lg text-gray-600">
            {isSignUp ? 'Create your account and start making a difference' : 'Sign in to continue your journey'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-10">
            {/* Role Selection */}
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Select your role:
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('USER')}
                  className={`p-5 rounded-2xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'USER'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <Users size={32} className="mb-2" />
                  <div className="text-sm font-semibold">User</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('RESTAURANT')}
                  className={`p-5 rounded-2xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'RESTAURANT'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <UtensilsCrossed size={32} className="mb-2" />
                  <div className="text-sm font-semibold">Restaurant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-5 rounded-2xl border-2 transition-all transform hover:scale-105 flex flex-col items-center ${selectedRole === 'ADMIN'
                    ? 'border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                    : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-md'
                    }`}
                >
                  <Shield size={32} className="mb-2" />
                  <div className="text-sm font-semibold">Admin</div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
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

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />

                  <Input
                    label="Address (Optional)"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </>
              )}

              <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-8 text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-2">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-600 hover:text-emerald-700 text-base font-semibold hover:underline transition-all"
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
