import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ToastContainer, ConfirmDialog, Loader, Modal } from '../components/ui';
import { BarChart3, Users, UtensilsCrossed, Trash2, Eye, Clock } from 'lucide-react';
import { adminAPI } from '../services/api';
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
  const [allListings, setAllListings] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');
  const [restaurantVerificationFilter, setRestaurantVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'EXPIRED'>('all');
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
  const [listingDetailsModal, setListingDetailsModal] = useState<{
    isOpen: boolean;
    listing: any;
  }>({ isOpen: false, listing: null });
  const [listingDeleteDialog, setListingDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({ isOpen: false, id: '', title: '' });
  const [listingStatusDialog, setListingStatusDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    newStatus: string;
  }>({ isOpen: false, id: '', title: '', newStatus: '' });

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview') {
      loadAllListingsData();
    }
  }, [listingStatusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        await Promise.all([loadDashboardStats(), loadAllListingsData()]);
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

  const loadAllListingsData = async () => {
    try {
      const params: any = { limit: 100 };
      if (listingStatusFilter !== 'all') {
        params.status = listingStatusFilter;
      }
      const response: any = await adminAPI.getAllFoodListings(params);
      console.log('All Food Listings Response:', response);
      const data = response.data || response;
      setAllListings(data.listings || []);
    } catch (error: any) {
      console.error('Failed to load all listings:', error);
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

  const handleViewListingDetails = (listing: any) => {
    setListingDetailsModal({ isOpen: true, listing });
  };

  const handleDeleteListing = (listingId: string, listingTitle: string) => {
    setListingDeleteDialog({ isOpen: true, id: listingId, title: listingTitle });
  };

  const confirmDeleteListing = async () => {
    try {
      await adminAPI.deleteFoodListing(listingDeleteDialog.id);
      toast.success('Listing deleted successfully');
      await loadAllListingsData();
      await loadDashboardStats();
      setListingDeleteDialog({ isOpen: false, id: '', title: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const handleForceExpireListing = (listingId: string, listingTitle: string) => {
    setListingStatusDialog({ isOpen: true, id: listingId, title: listingTitle, newStatus: 'EXPIRED' });
  };

  const confirmUpdateListingStatus = async () => {
    try {
      await adminAPI.updateFoodListingStatus(listingStatusDialog.id, listingStatusDialog.newStatus);
      toast.success(`Listing status updated to ${listingStatusDialog.newStatus}`);
      await loadAllListingsData();
      await loadDashboardStats();
      setListingStatusDialog({ isOpen: false, id: '', title: '', newStatus: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing status');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">Monitor and manage the FoodShare platform</p>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-md scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'overview'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BarChart3 size={18} className="sm:w-5 sm:h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'users'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Users size={18} className="sm:w-5 sm:h-5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'restaurants'
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">📋 Food Listings Management</h3>
                  <div className="flex items-center flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setListingStatusFilter('all')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${listingStatusFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setListingStatusFilter('AVAILABLE')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${listingStatusFilter === 'AVAILABLE'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => setListingStatusFilter('RESERVED')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${listingStatusFilter === 'RESERVED'
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Reserved
                    </button>
                    <button
                      onClick={() => setListingStatusFilter('CLAIMED')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${listingStatusFilter === 'CLAIMED'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Claimed
                    </button>
                    <button
                      onClick={() => setListingStatusFilter('EXPIRED')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${listingStatusFilter === 'EXPIRED'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Expired
                    </button>
                  </div>
                </div>
                {loading ? (<div className="py-8"><Loader size="md" variant="pulse" text="Loading listings..." /></div>) : allListings.length === 0 ? (<div className="text-center py-8 text-gray-600">No listings found</div>) : (
                  <div className="space-y-4">{allListings.map((listing: any) => (<div key={listing.id} className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"><div className="flex-1 w-full"><div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2"><div className="flex-1"><p className="text-gray-900 font-bold text-lg">{listing.title}</p><p className="text-sm text-gray-600">{listing.restaurant?.restaurantName}</p></div><div className="flex gap-2"><Badge variant={listing.status === 'AVAILABLE' ? 'success' : listing.status === 'RESERVED' ? 'warning' : listing.status === 'CLAIMED' ? 'default' : 'error'}>{listing.status}</Badge>{!listing.restaurant?.isVerified && <Badge variant="error">Unverified Restaurant</Badge>}</div></div><p className="text-sm text-gray-700 line-clamp-2">{listing.description}</p><div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600"><span>📦 {listing.quantity} {listing.unit}</span><span>⏰ Expires: {new Date(listing.expiryDate).toLocaleDateString()}</span><span>📅 Listed: {new Date(listing.createdAt).toLocaleDateString()}</span>{listing._count?.foodRequests > 0 && <span className="text-blue-600 font-medium">👥 {listing._count.foodRequests} requests</span>}</div></div><div className="flex sm:flex-col gap-2 w-full sm:w-auto"><Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-600 transition-colors flex-1 sm:flex-initial" onClick={() => handleViewListingDetails(listing)}><Eye size={16} className="mr-1" /> View</Button>{listing.status === 'AVAILABLE' && (<Button size="sm" variant="outline" className="hover:bg-orange-50 hover:text-orange-600 transition-colors flex-1 sm:flex-initial" onClick={() => handleForceExpireListing(listing.id, listing.title)}><Clock size={16} className="mr-1" /> Expire</Button>)}<Button size="sm" variant="ghost" className="hover:bg-red-50 hover:text-red-600 transition-colors flex-1 sm:flex-initial" onClick={() => handleDeleteListing(listing.id, listing.title)}><Trash2 size={16} /></Button></div></div>))}</div>
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'users' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setUserRoleFilter('all')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${userRoleFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      All Users
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('ADMIN')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${userRoleFilter === 'ADMIN'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Admins
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('USER')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${userRoleFilter === 'USER'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Regular Users
                    </button>
                  </div>
                  <Button variant="outline" onClick={loadUsers} size="sm" className="w-full sm:w-auto">
                    Refresh
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="py-12"><Loader size="lg" variant="spinner" text="Loading users..." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {user.name}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                                {user.email}
                              </td>
                              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                                {user.phone || 'N/A'}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}
                                >
                                  {user.role || user.type}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <Badge variant={user.isActive ? 'success' : 'error'}>
                                  {user.isActive ? 'Active' : 'Suspended'}
                                </Badge>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors w-full sm:w-auto"
                                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                  >
                                    {user.isActive ? 'Suspend' : 'Activate'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors w-full sm:w-auto"
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Restaurant Management</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setRestaurantVerificationFilter('all')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${restaurantVerificationFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      All Restaurants
                    </button>
                    <button
                      onClick={() => setRestaurantVerificationFilter('verified')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${restaurantVerificationFilter === 'verified'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setRestaurantVerificationFilter('unverified')}
                      className={`shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${restaurantVerificationFilter === 'unverified'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Unverified
                    </button>
                  </div>
                  <Button variant="outline" onClick={loadRestaurants} size="sm" className="w-full sm:w-auto">
                    Refresh
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="py-12"><Loader size="lg" variant="spinner" text="Loading restaurants..." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {restaurant.restaurantName}
                              </td>
                              <td className="hidden lg:table-cell px-6 py-4 text-gray-600">{restaurant.address}</td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                                {restaurant.phone}
                              </td>
                              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-gray-900">
                                {restaurant.rating?.toFixed(1) || 'N/A'} ⭐
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(restaurant.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.isVerified
                                    ? 'bg-green-600 text-white'
                                    : 'bg-orange-600 text-white'
                                    }`}
                                >
                                  {restaurant.isVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    size="sm"
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors w-full sm:w-auto"
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
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors w-full sm:w-auto"
                                    onClick={() =>
                                      handleDeleteRestaurant(restaurant.id, restaurant.restaurantName)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
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

      <ConfirmDialog
        isOpen={listingDeleteDialog.isOpen}
        onClose={() => setListingDeleteDialog({ isOpen: false, id: '', title: '' })}
        onConfirm={confirmDeleteListing}
        title="Delete Food Listing"
        message={`Are you sure you want to delete "${listingDeleteDialog.title}"? This will notify the restaurant and cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmDialog
        isOpen={listingStatusDialog.isOpen}
        onClose={() => setListingStatusDialog({ isOpen: false, id: '', title: '', newStatus: '' })}
        onConfirm={confirmUpdateListingStatus}
        title="Update Listing Status"
        message={`Are you sure you want to mark "${listingStatusDialog.title}" as ${listingStatusDialog.newStatus}? The restaurant will be notified.`}
        confirmText="Yes, Update"
        cancelText="Cancel"
        type="warning"
      />

      <Modal
        isOpen={listingDetailsModal.isOpen}
        onClose={() => setListingDetailsModal({ isOpen: false, listing: null })}
        title="Listing Details"
      >
        {listingDetailsModal.listing && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-lg text-gray-900 mb-2">{listingDetailsModal.listing.title}</h4>
              <Badge variant={listingDetailsModal.listing.status === 'AVAILABLE' ? 'success' : listingDetailsModal.listing.status === 'RESERVED' ? 'warning' : listingDetailsModal.listing.status === 'CLAIMED' ? 'default' : 'error'}>
                {listingDetailsModal.listing.status}
              </Badge>
            </div>

            <div>
              <h5 className="font-semibold text-gray-700 mb-1">Description</h5>
              <p className="text-gray-600">{listingDetailsModal.listing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Quantity</h5>
                <p className="text-gray-600">{listingDetailsModal.listing.quantity} {listingDetailsModal.listing.unit}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Category</h5>
                <p className="text-gray-600">{listingDetailsModal.listing.category || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Expiry Date</h5>
                <p className="text-gray-600">{new Date(listingDetailsModal.listing.expiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Pickup Time</h5>
                <p className="text-gray-600">{listingDetailsModal.listing.pickupTime || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-2">Restaurant Information</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {listingDetailsModal.listing.restaurant?.restaurantName}</p>
                <p><span className="font-medium">Address:</span> {listingDetailsModal.listing.restaurant?.address}</p>
                <p><span className="font-medium">Phone:</span> {listingDetailsModal.listing.restaurant?.phone}</p>
                <p><span className="font-medium">Verified:</span> {listingDetailsModal.listing.restaurant?.isVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>

            {listingDetailsModal.listing.allergens && listingDetailsModal.listing.allergens.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Allergens</h5>
                <div className="flex flex-wrap gap-2">
                  {listingDetailsModal.listing.allergens.map((allergen: string, idx: number) => (
                    <Badge key={idx} variant="error">{allergen}</Badge>
                  ))}
                </div>
              </div>
            )}

            {listingDetailsModal.listing.dietaryInfo && listingDetailsModal.listing.dietaryInfo.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-1">Dietary Info</h5>
                <div className="flex flex-wrap gap-2">
                  {listingDetailsModal.listing.dietaryInfo.map((info: string, idx: number) => (
                    <Badge key={idx} variant="default">{info}</Badge>
                  ))}
                </div>
              </div>
            )}

            {listingDetailsModal.listing._count?.foodRequests > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-1">Active Requests</h5>
                <p className="text-gray-600">{listingDetailsModal.listing._count.foodRequests} users have requested this item</p>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-4 border-t">
              <p>Listed on: {new Date(listingDetailsModal.listing.createdAt).toLocaleString()}</p>
              <p>Last updated: {new Date(listingDetailsModal.listing.updatedAt).toLocaleString()}</p>
            </div>

            <div className="flex gap-3 pt-4">
              {listingDetailsModal.listing.status === 'AVAILABLE' && (
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={() => {
                    handleForceExpireListing(listingDetailsModal.listing.id, listingDetailsModal.listing.title);
                    setListingDetailsModal({ isOpen: false, listing: null });
                  }}
                >
                  <Clock size={16} className="mr-2" />
                  Force Expire
                </Button>
              )}
              <Button
                variant="ghost"
                className="flex-1 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => {
                  handleDeleteListing(listingDetailsModal.listing.id, listingDetailsModal.listing.title);
                  setListingDetailsModal({ isOpen: false, listing: null });
                }}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Listing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
