import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ToastContainer, ConfirmDialog } from '../components/ui';
import { BarChart3, Users, UtensilsCrossed, Trash2 } from 'lucide-react';
import { adminAPI, foodAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'restaurants'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalRestaurants: 0,
    activeListings: 0,
    totalRequests: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');
  const [restaurantVerificationFilter, setRestaurantVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'user' | 'restaurant' | null;
    id: string;
    name: string;
  }>({ isOpen: false, type: null, id: '', name: '' });
  const [suspendDialog, setSuspendDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    currentStatus: boolean;
  }>({ isOpen: false, id: '', name: '', currentStatus: false });

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        await Promise.all([loadDashboardStats(), loadRecentListingsData()]);
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'restaurants') {
        await loadRestaurants();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response: any = await adminAPI.getDashboardStats();
      console.log('Dashboard Stats Response:', response);
      const data = response.data || response;
      setStats({
        totalUsers: data.totalUsers || 0,
        totalRestaurants: data.totalRestaurants || 0,
        activeListings: data.activeListings || 0,
        totalRequests: data.totalRequests || 0,
      });
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentListingsData = async () => {
    try {
      const response: any = await foodAPI.getAllFood({ limit: 5 });
      console.log('Food Listings Response:', response);
      const data = response.data || response;
      setRecentListings(data.foodListings || data.listings || data || []);
    } catch (error: any) {
      console.error('Failed to load listings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response: any = await adminAPI.getAllUsers({ limit: 100 });
      console.log('Users API Response:', response);
      // Response structure: { success, message, data: { users, pagination } }
      const users = response.data?.users || response.users || [];
      console.log('Parsed users:', users);
      setUsers(users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error(error?.error || error?.message || 'Failed to load users');
    }
  };

  const loadRestaurants = async () => {
    try {
      const response: any = await adminAPI.getAllRestaurants({ limit: 100 });
      console.log('Restaurants API Response:', response);
      // Response structure: { success, message, data: { restaurants, pagination } }
      const restaurants = response.data?.restaurants || response.restaurants || [];
      console.log('Parsed restaurants:', restaurants);
      setRestaurants(restaurants);
    } catch (error: any) {
      console.error('Failed to load restaurants:', error);
      toast.error(error?.error || error?.message || 'Failed to load restaurants');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteDialog({ isOpen: true, type: 'user', id: userId, name: userName });
  };

  const handleDeleteRestaurant = (restaurantId: string, restaurantName: string) => {
    setDeleteDialog({ isOpen: true, type: 'restaurant', id: restaurantId, name: restaurantName });
  };

  const confirmDelete = async () => {
    try {
      if (deleteDialog.type === 'user') {
        await adminAPI.deleteUser(deleteDialog.id);
        toast.success('User deleted successfully');
        await loadUsers();
      } else if (deleteDialog.type === 'restaurant') {
        await adminAPI.deleteRestaurant(deleteDialog.id);
        toast.success('Restaurant and all its listings deleted successfully');
        await loadRestaurants();
      }
      setDeleteDialog({ isOpen: false, type: null, id: '', name: '' });
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${deleteDialog.type}`);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setSuspendDialog({ isOpen: true, id: userId, name: '', currentStatus });
  };

  const confirmSuspend = async () => {
    try {
      await adminAPI.updateUserStatus(suspendDialog.id, { isActive: !suspendDialog.currentStatus });
      toast.success(`User ${!suspendDialog.currentStatus ? 'activated' : 'suspended'} successfully`);
      await loadUsers();
      setSuspendDialog({ isOpen: false, id: '', name: '', currentStatus: false });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleToggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    try {
      await adminAPI.verifyRestaurant(restaurantId, !currentStatus);
      toast.success(`Restaurant ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      await loadRestaurants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update restaurant status');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor and manage the FoodShare platform</p>
            </div>
          </div>
        </div>

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
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card><div className="p-6 text-center hover:shadow-xl transition-shadow"><div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div><div className="text-gray-600">Total Users</div></div></Card>
              <Card><div className="p-6 text-center hover:shadow-xl transition-shadow"><div className="text-3xl font-bold text-gray-900">{stats.totalRestaurants.toLocaleString()}</div><div className="text-gray-600">Restaurants</div></div></Card>
              <Card><div className="p-6 text-center hover:shadow-xl transition-shadow"><div className="text-3xl font-bold text-gray-900">{stats.activeListings}</div><div className="text-gray-600">Active Listings</div></div></Card>
              <Card><div className="p-6 text-center hover:shadow-xl transition-shadow"><div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div><div className="text-gray-600">Total Requests</div></div></Card>
            </div>
            <Card>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">📋 Recent Listings</h3>
                {loading ? (<div className="text-center py-8 text-gray-600">Loading...</div>) : recentListings.length === 0 ? (<div className="text-center py-8 text-gray-600">No recent listings</div>) : (
                  <div className="space-y-4">{recentListings.map((listing: any) => (<div key={listing.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"><div className="flex-1"><div className="flex justify-between items-start mb-2"><div><p className="text-gray-900 font-bold text-lg">{listing.title}</p><p className="text-sm text-gray-600">{listing.restaurant?.restaurantName}</p></div><Badge variant={listing.status === 'AVAILABLE' ? 'success' : 'warning'}>{listing.status}</Badge></div><p className="text-sm text-gray-700">{listing.description}</p><div className="flex items-center space-x-4 mt-2 text-sm text-gray-600"><span>📦 {listing.quantity} {listing.unit}</span><span>⏰ Expires: {new Date(listing.expiryDate).toLocaleDateString()}</span><span>📅 Listed: {new Date(listing.createdAt).toLocaleDateString()}</span></div></div></div>))}</div>
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'users' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setUserRoleFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userRoleFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      All Users
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('ADMIN')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userRoleFilter === 'ADMIN'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Admins
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('USER')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userRoleFilter === 'USER'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Regular Users
                    </button>
                  </div>
                  <Button variant="outline" onClick={loadUsers}>
                    Refresh
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-600">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter((user) => userRoleFilter === 'all' || user.role === userRoleFilter)
                        .length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users
                          .filter((user) => userRoleFilter === 'all' || user.role === userRoleFilter)
                          .map((user: any) => (
                            <tr
                              key={user.id}
                              className={`hover:bg-gray-50 ${user.role === 'ADMIN' ? 'bg-purple-50' : 'bg-blue-50'
                                }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {user.phone || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}
                                >
                                  {user.role || user.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={user.isActive ? 'success' : 'error'}>
                                  {user.isActive ? 'Active' : 'Suspended'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                >
                                  {user.isActive ? 'Suspend' : 'Activate'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'restaurants' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Restaurant Management</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setRestaurantVerificationFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${restaurantVerificationFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      All Restaurants
                    </button>
                    <button
                      onClick={() => setRestaurantVerificationFilter('verified')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${restaurantVerificationFilter === 'verified'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setRestaurantVerificationFilter('unverified')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${restaurantVerificationFilter === 'unverified'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Unverified
                    </button>
                  </div>
                  <Button variant="outline" onClick={loadRestaurants}>
                    Refresh
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-600">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {restaurants
                        .filter((restaurant) =>
                          restaurantVerificationFilter === 'all'
                            ? true
                            : restaurantVerificationFilter === 'verified'
                              ? restaurant.isVerified
                              : !restaurant.isVerified
                        )
                        .length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                            No restaurants found
                          </td>
                        </tr>
                      ) : (
                        restaurants
                          .filter((restaurant) =>
                            restaurantVerificationFilter === 'all'
                              ? true
                              : restaurantVerificationFilter === 'verified'
                                ? restaurant.isVerified
                                : !restaurant.isVerified
                          )
                          .map((restaurant: any) => (
                            <tr
                              key={restaurant.id}
                              className={`hover:bg-gray-50 ${restaurant.isVerified ? 'bg-green-50' : 'bg-orange-50'
                                }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {restaurant.restaurantName}
                              </td>
                              <td className="px-6 py-4 text-gray-600">{restaurant.address}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {restaurant.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                {restaurant.rating?.toFixed(1) || 'N/A'} ⭐
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(restaurant.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.isVerified
                                    ? 'bg-green-600 text-white'
                                    : 'bg-orange-600 text-white'
                                    }`}
                                >
                                  {restaurant.isVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <Button
                                  size="sm"
                                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                  variant="outline"
                                  onClick={() =>
                                    handleToggleRestaurantStatus(
                                      restaurant.id,
                                      restaurant.isVerified
                                    )
                                  }
                                >
                                  {restaurant.isVerified ? 'Unverify' : 'Verify'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                  onClick={() =>
                                    handleDeleteRestaurant(restaurant.id, restaurant.restaurantName)
                                  }
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: null, id: '', name: '' })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteDialog.type === 'user' ? 'User' : 'Restaurant'}`}
        message={`Are you sure you want to delete ${deleteDialog.name}? ${deleteDialog.type === 'restaurant' ? 'This will also delete all listings from this restaurant. ' : ''}This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmDialog
        isOpen={suspendDialog.isOpen}
        onClose={() => setSuspendDialog({ isOpen: false, id: '', name: '', currentStatus: false })}
        onConfirm={confirmSuspend}
        title={suspendDialog.currentStatus ? 'Suspend User' : 'Activate User'}
        message={
          suspendDialog.currentStatus
            ? 'Are you sure you want to suspend this user? They will not be able to access their account until reactivated.'
            : 'Are you sure you want to activate this user? They will regain access to their account.'
        }
        confirmText={suspendDialog.currentStatus ? 'Yes, Suspend' : 'Yes, Activate'}
        cancelText="Cancel"
        type={suspendDialog.currentStatus ? 'danger' : 'info'}
      />
    </div>
  );
};
