import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ArrowRight, Users, UtensilsCrossed, Star, CheckCircle, Package, Sparkles, Search, Award, TrendingUp, Heart, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-linear-to-br from-emerald-100 via-teal-100 to-cyan-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold animate-pulse">
            🌍 Join 10,000+ People Making a Difference
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Reduce Food Waste,
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Feed Communities</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto px-4">
            Connect restaurants with surplus food to people who need it most. Together, we're building a sustainable future while fighting hunger in our communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center px-4">
            <Button size="lg" onClick={() => navigate('/auth/signup/user')} className="w-full sm:w-auto shadow-xl">
              <Sparkles size={20} className="mr-2" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth/signin/user')} className="w-full sm:w-auto">
              <Search size={20} className="mr-2" />
              Sign In to Browse Food
            </Button>
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-4">No credit card required  •  Free forever  •  Make an impact today</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 sm:mb-3">10,847</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Meals Saved</div>
              <div className="text-xs text-gray-500 mt-1 sm:mt-2">This Month</div>
            </div>
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3">523</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Partner Restaurants</div>
              <div className="text-xs text-gray-500 mt-1 sm:mt-2">And Growing</div>
            </div>
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3">5,234</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Active Users</div>
              <div className="text-xs text-gray-500 mt-1 sm:mt-2">Helping Daily</div>
            </div>
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-linear-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-3">12.4K</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">KG CO₂ Saved</div>
              <div className="text-xs text-gray-500 mt-1 sm:mt-2">Environmental Impact</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">How It Works</h2>
          <p className="text-lg sm:text-xl text-gray-600 px-4">Simple steps to make a huge impact</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="relative">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-emerald-100">
              <div className="absolute -top-6 left-6 sm:left-8 w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">1</div>
              <UtensilsCrossed size={40} className="sm:w-12 sm:h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-2">Restaurants List Food</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Restaurants easily post surplus food with details about quantity, quality, pickup times, and exact location through our intuitive dashboard.
              </p>
              <ul className="mt-4 space-y-2 text-xs sm:text-sm text-gray-500">
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-emerald-500 flex-shrink-0" />Quick listing process</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-emerald-500 flex-shrink-0" />Set pickup windows</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-emerald-500 flex-shrink-0" />Manage inventory</li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-blue-100">
              <div className="absolute -top-6 left-6 sm:left-8 w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">2</div>
              <Users size={40} className="sm:w-12 sm:h-12 text-blue-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-2">Users Browse & Request</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Users discover available food nearby, filter by preferences, and submit instant requests for items they need with just a few clicks.
              </p>
              <ul className="mt-4 space-y-2 text-xs sm:text-sm text-gray-500">
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-blue-500 flex-shrink-0" />Location-based search</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-blue-500 flex-shrink-0" />Real-time availability</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-blue-500 flex-shrink-0" />Instant notifications</li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-purple-100">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">3</div>
              <Package size={48} className="text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Connect & Collect</h3>
              <p className="text-gray-600 leading-relaxed">
                Restaurants approve requests quickly, users receive confirmation, and pick up fresh food at the designated time, reducing waste together.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-purple-500" />Fast approval system</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-purple-500" />GPS navigation</li>
                <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-purple-500" />Pickup verification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-linear-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Join FoodShare?</h2>
            <p className="text-xl text-gray-600">Benefits for everyone in the community</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <UtensilsCrossed size={32} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 ml-4">For Restaurants</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-emerald-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Reduce Food Waste</span>
                    <p className="text-gray-600 text-sm">Cut disposal costs by 40% and help the environment</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Award size={20} className="text-emerald-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Brand Enhancement</span>
                    <p className="text-gray-600 text-sm">Build reputation through social responsibility</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <TrendingUp size={20} className="text-emerald-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Tax Benefits</span>
                    <p className="text-gray-600 text-sm">Claim deductions for food donations</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield size={20} className="text-emerald-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Easy Management</span>
                    <p className="text-gray-600 text-sm">Intuitive dashboard with real-time tracking</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Heart size={20} className="text-emerald-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Community Impact</span>
                    <p className="text-gray-600 text-sm">Make a difference in your local community</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users size={32} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 ml-4">For Users</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Package size={20} className="text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Quality Food Access</span>
                    <p className="text-gray-600 text-sm">Get fresh meals at no cost from top restaurants</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Search size={20} className="text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Location-Based</span>
                    <p className="text-gray-600 text-sm">Find food near you with GPS-powered search</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Heart size={20} className="text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Environmental Hero</span>
                    <p className="text-gray-600 text-sm">Reduce waste and carbon footprint together</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Sparkles size={20} className="text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Simple Process</span>
                    <p className="text-gray-600 text-sm">Browse, request, and pickup in just 3 clicks</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield size={20} className="text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">No Hidden Costs</span>
                    <p className="text-gray-600 text-sm">100% free platform, no subscriptions needed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">What People Are Saying</h2>
          <p className="text-xl text-gray-600">Real stories from our community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">👨‍🍳</div>
              <div className="ml-3">
                <div className="font-bold text-gray-900">Chef Michael</div>
                <div className="text-sm text-gray-500">Green Bistro</div>
              </div>
            </div>
            <p className="text-gray-600 italic">"We've reduced our food waste by 60% since joining FoodShare. It's amazing to see our surplus food helping families instead of going to waste."</p>
            <div className="mt-4 flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600 text-sm">(5/5)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-gray-700">SJ</div>
              <div className="ml-3">
                <div className="font-bold text-gray-900">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Community User</div>
              </div>
            </div>
            <p className="text-gray-600 italic">"This app has been a lifesaver for my family. The quality of food is excellent and the pickup process is so easy. Thank you FoodShare!"</p>
            <div className="mt-4 flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600 text-sm">(5/5)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-gray-700">DL</div>
              <div className="ml-3">
                <div className="font-bold text-gray-900">David Lee</div>
                <div className="text-sm text-gray-500">Restaurant Owner</div>
              </div>
            </div>
            <p className="text-gray-600 italic">"Not only are we saving money on disposal costs, but we're also building a stronger connection with our community. It's a win-win!"</p>
            <div className="mt-4 flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600 text-sm">(5/5)</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold mb-6">Ready to Make a Difference?</h2>
            <p className="text-2xl mb-10 text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Join thousands of restaurants and users working together to reduce waste and feed communities. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button size="lg" variant="outline" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl border-2 border-white" onClick={() => navigate('/auth/signup/user')}>
                <Sparkles size={20} className="mr-2" />
                Sign Up Now - It's Free
              </Button>
              <Button size="lg" className="bg-emerald-900 hover:bg-emerald-950 shadow-xl" onClick={() => navigate('/auth/signin/user')}>
                <ArrowRight size={20} className="mr-2" />
                Sign In to Explore Food
              </Button>
            </div>
            <p className="mt-8 text-emerald-100 text-sm">Join our growing community • No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
};
