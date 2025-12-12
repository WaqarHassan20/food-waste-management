import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { BarChart3, Users, UtensilsCrossed, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'restaurants' | 'reports'>('overview');

  const stats = {
    totalUsers: 5234,
    usersGrowth: '+12%',
    totalRestaurants: 523,
    restaurantsGrowth: '+8%',
    mealsDonated: 10456,
    mealsGrowth: '+24%',
    activeListings: 234,
    listingsGrowth: '+15%',
  };

  // Mock data
  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER', joinedAt: 'Jan 15, 2024', status: 'Active' as const },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', joinedAt: 'Jan 14, 2024', status: 'Active' as const },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'USER', joinedAt: 'Jan 13, 2024', status: 'Active' as const },
    { id: 4, name: 'Sarah Lee', email: 'sarah@example.com', role: 'USER', joinedAt: 'Jan 12, 2024', status: 'Suspended' as const },
  ];

  const recentRestaurants = [
    { id: 1, name: 'Green Bistro', email: 'contact@greenbistro.com', listings: 12, donations: 156, status: 'Active' as const },
    { id: 2, name: 'Healthy Bites', email: 'hello@healthybites.com', listings: 8, donations: 89, status: 'Pending' as const },
    { id: 3, name: 'Pizza Palace', email: 'info@pizzapalace.com', listings: 24, donations: 340, status: 'Active' as const },
  ];

  const recentActivity = [
    { id: 1, type: 'user' as const, message: 'New user registered: John Doe', time: '5 mins ago' },
    { id: 2, type: 'restaurant' as const, message: 'Restaurant pending approval: Healthy Bites', time: '15 mins ago' },
    { id: 3, type: 'donation' as const, message: 'New donation: 20 pizzas by Pizza Palace', time: '1 hour ago' },
    { id: 4, type: 'user' as const, message: 'User report: Spam content flagged', time: '2 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor and manage the FoodShare platform</p>
            </div>
            <Button className="hidden md:block">
              <FileText size={18} className="mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'overview'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BarChart3 size={20} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'users'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Users size={20} />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'restaurants'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <UtensilsCrossed size={20} />
            <span>Restaurants</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'reports'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FileText size={20} />
            <span>Reports</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <Badge variant="success" className="mb-2">{stats.usersGrowth}</Badge>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-gray-600">Total Users</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <Badge variant="success" className="mb-2">{stats.restaurantsGrowth}</Badge>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalRestaurants.toLocaleString()}</div>
                  <div className="text-gray-600">Restaurants</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <Badge variant="success" className="mb-2">{stats.mealsGrowth}</Badge>
                  <div className="text-3xl font-bold text-gray-900">{stats.mealsDonated.toLocaleString()}</div>
                  <div className="text-gray-600">Meals Donated</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <Badge variant="success" className="mb-2">{stats.listingsGrowth}</Badge>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeListings}</div>
                  <div className="text-gray-600">Active Listings</div>
                </div>
              </Card>
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">🔔 Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-600">
                          {activity.type === 'user' && 'U'}
                          {activity.type === 'restaurant' && 'R'}
                          {activity.type === 'donation' && 'D'}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{activity.message}</p>
                          <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">⏳ Pending Approvals</h3>
                  <div className="space-y-3">
                    {recentRestaurants
                      .filter((r) => r.status === 'Pending')
                      .map((restaurant) => (
                        <div key={restaurant.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-gray-900">{restaurant.name}</div>
                              <div className="text-sm text-gray-600">{restaurant.email}</div>
                            </div>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <CheckCircle size={16} className="mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <AlertCircle size={16} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
                <Button variant="outline">Search Users</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="default">{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.joinedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="ghost">Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Restaurant Management</h3>
                <Button variant="outline">Search Restaurants</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRestaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{restaurant.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{restaurant.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{restaurant.listings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{restaurant.donations}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              restaurant.status === 'Active' ? 'success' : restaurant.status === 'Pending' ? 'warning' : 'error'
                            }
                          >
                            {restaurant.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          {restaurant.status === 'Pending' && <Button size="sm">Approve</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-1">85%</div>
                    <div className="text-gray-700">Platform Growth (YTD)</div>
                  </div>
                  <div className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
                    <div className="text-gray-700">Average Rating</div>
                  </div>
                  <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-1">92%</div>
                    <div className="text-gray-700">Success Rate</div>
                  </div>
                  <div className="p-6 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-1">18 mins</div>
                    <div className="text-gray-700">Avg Response Time</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Export Reports</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-between">
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Restaurant Performance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Donation Statistics Report
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Financial Summary Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
