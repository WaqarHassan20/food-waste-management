import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ToastContainer, ConfirmDialog } from '../components/ui';
import { Search, Users, Clock, MapPin, Package, CheckCircle, ShoppingBag } from 'lucide-react';
import { foodAPI, requestAPI } from '../services/api';
import type { FoodListing, FoodRequest } from '../types';
import { useToast } from '../hooks/useToast';

interface UserDashboardProps {
  userName: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ userName }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'history'>('browse');
  const [availableFood, setAvailableFood] = useState<FoodListing[]>([]);
  const [filteredFood, setFilteredFood] = useState<FoodListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [myRequests, setMyRequests] = useState<FoodRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    available: 0,
    pending: 0,
    completed: 0,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: '' });

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Filter food by category
  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredFood(availableFood);
    } else {
      setFilteredFood(availableFood.filter(food => food.category === selectedCategory));
    }
  }, [selectedCategory, availableFood]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'browse') {
        const response: any = await foodAPI.getAllFood({ limit: 20 });
        // Handle both response.data.foodListings (from interceptor) and response.foodListings (direct)
        const data = response.data || response;
        let listings = data.foodListings || data || [];

        // Get all user's active requests (only pending and approved) to filter them out
        const myRequestsResponse: any = await requestAPI.getMyRequests();
        const allMyRequests = myRequestsResponse.data || myRequestsResponse || [];
        // Only filter out food items where user has PENDING or APPROVED requests
        // REJECTED and CANCELLED requests should allow the food to appear again
        const myActiveRequestedFoodIds = new Set(
          allMyRequests
            .filter((r: FoodRequest) => r.status === 'PENDING' || r.status === 'APPROVED')
            .map((r: FoodRequest) => r.foodListingId)
        );

        // Filter out foods that:
        // 1. User has an active (pending/approved) request for
        // 2. Have status RESERVED or CLAIMED (approved by restaurant for someone else)
        listings = listings.filter((food: FoodListing) =>
          !myActiveRequestedFoodIds.has(food.id) &&
          food.status === 'AVAILABLE'
        );

        setAvailableFood(listings);
        setFilteredFood(listings);
        setStats(prev => ({ ...prev, available: listings.length }));
      } else if (activeTab === 'requests') {
        const response: any = await requestAPI.getMyRequests();
        // Handle both response.data (from interceptor) and response (direct)
        const requests = response.data || response || [];
        const pending = requests.filter((r: FoodRequest) => r.status === 'PENDING' || r.status === 'APPROVED');
        setMyRequests(pending);
        setStats(prev => ({ ...prev, pending: pending.length }));
      } else if (activeTab === 'history') {
        const response: any = await requestAPI.getMyRequests('COMPLETED');
        // Handle both response.data (from interceptor) and response (direct)
        const requests = response.data || response || [];
        setCompletedRequests(requests);
        setStats(prev => ({ ...prev, completed: requests.length }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFood = async (foodListingId: string, quantity: number) => {
    try {
      await requestAPI.createRequest({
        foodListingId,
        quantity,
        message: 'I would like to request this food',
      });
      toast.success('Request sent successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setConfirmDialog({ isOpen: true, requestId });
  };

  const confirmCancelRequest = async () => {
    try {
      await requestAPI.cancelRequest(confirmDialog.requestId);
      toast.success('Request cancelled successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back, {userName}! 👋</h1>
              <p className="text-lg text-gray-600">Discover available food and manage your requests</p>
            </div>
            <div className="hidden md:block">
              <div className="text-center p-6 bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Meals Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.available}</div>
              <div className="text-gray-600">Available Items</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-gray-600">Pending Requests</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-md">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'browse'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Search size={20} />
            <span>Browse Food</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'requests'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Clock size={20} />
            <span>My Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'history'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <CheckCircle size={20} />
            <span>History</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Browse Food Tab */}
            {activeTab === 'browse' && (
              <>
                {/* Category Filter */}
                <div className="mb-6 bg-white p-4 rounded-2xl shadow-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-700 mr-2">Filter by Category:</span>
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'ALL'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory('PREPARED_FOOD')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'PREPARED_FOOD'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Prepared Food
                    </button>
                    <button
                      onClick={() => setSelectedCategory('RAW_INGREDIENTS')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'RAW_INGREDIENTS'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Raw Ingredients
                    </button>
                    <button
                      onClick={() => setSelectedCategory('BAKERY')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'BAKERY'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Bakery
                    </button>
                    <button
                      onClick={() => setSelectedCategory('DAIRY')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'DAIRY'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Dairy
                    </button>
                    <button
                      onClick={() => setSelectedCategory('FRUITS_VEGETABLES')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'FRUITS_VEGETABLES'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Fruits & Vegetables
                    </button>
                    <button
                      onClick={() => setSelectedCategory('BEVERAGES')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'BEVERAGES'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Beverages
                    </button>
                    <button
                      onClick={() => setSelectedCategory('PACKAGED_FOOD')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'PACKAGED_FOOD'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Packaged Food
                    </button>
                    <button
                      onClick={() => setSelectedCategory('FROZEN_FOOD')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'FROZEN_FOOD'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Frozen Food
                    </button>
                    <button
                      onClick={() => setSelectedCategory('OTHER')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'OTHER'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Other
                    </button>
                  </div>
                </div>

                {/* Food Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFood.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-600">
                      {selectedCategory === 'ALL'
                        ? 'No food available at the moment'
                        : `No ${selectedCategory.toLowerCase().replace('_', ' ')} available`
                      }
                    </div>
                  ) : (
                    filteredFood.map((food) => (
                      <Card key={food.id}>
                        <div className="p-6 hover:shadow-xl transition-shadow">
                          {/* Food Image */}
                          {food.imageUrl || food.imageData ? (
                            <div className="mb-4 rounded-lg overflow-hidden">
                              <img
                                src={food.imageUrl || `http://localhost:3000/api/v1/food/${food.id}/image`}
                                alt={food.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 h-48 flex items-center justify-center">
                              <span className="text-gray-500">No image available</span>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{food.title}</h3>
                            <Badge variant="success">{food.status}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{food.description}</p>
                          <div className="space-y-2 mb-6 text-sm">
                            <div className="flex items-center text-gray-700">
                              <Users size={18} className="mr-2 text-emerald-600 shrink-0" />
                              <span>{food.restaurant?.restaurantName}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <Package size={18} className="mr-2 text-blue-600 shrink-0" />
                              <span>{food.quantity} {food.unit}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <Clock size={18} className="mr-2 text-orange-600 shrink-0" />
                              <span>{food.pickupTime}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <MapPin size={18} className="mr-2 text-red-600 shrink-0" />
                              <span>{food.restaurant?.address}</span>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleRequestFood(food.id, Math.min(food.quantity, 1))}
                          >
                            <ShoppingBag size={18} className="mr-2" />
                            Request Food
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}

            {/* My Requests Tab */}
            {activeTab === 'requests' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRequests.length === 0 ? (
                  <Card className="col-span-full">
                    <div className="p-12 text-center text-gray-600">
                      <Clock size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">No active requests</p>
                      <p className="text-sm mt-2">Request food from the Browse tab to see them here</p>
                    </div>
                  </Card>
                ) : (
                  myRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Food Image */}
                      <div className="relative">
                        {request.foodListing?.imageUrl || request.foodListing?.imageData ? (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                request.foodListing.imageUrl ||
                                `http://localhost:3000/api/v1/food/${request.foodListing.id}/image`
                              }
                              alt={request.foodListing.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <Package size={64} className="text-emerald-300" />
                          </div>
                        )}

                        {/* Status Badge Overlay */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant={
                              request.status === 'APPROVED'
                                ? 'success'
                                : request.status === 'PENDING'
                                  ? 'warning'
                                  : 'default'
                            }
                            className="shadow-lg"
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {request.foodListing?.title}
                        </h3>

                        {request.foodListing?.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {request.foodListing.description}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Users size={16} className="mr-2 text-emerald-600 shrink-0" />
                            <span className="font-semibold">Restaurant:</span>
                            <span className="ml-1 truncate">{request.foodListing?.restaurant?.restaurantName}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-700">
                            <Package size={16} className="mr-2 text-blue-600 shrink-0" />
                            <span className="font-semibold">Quantity:</span>
                            <span className="ml-1">{request.quantity} {request.foodListing?.unit}</span>
                          </div>

                          {request.pickupDate && (
                            <div className="flex items-center text-sm text-emerald-600 font-semibold">
                              <Clock size={16} className="mr-2 shrink-0" />
                              <span>Pickup: {new Date(request.pickupDate).toLocaleDateString()}</span>
                            </div>
                          )}

                          {request.foodListing?.pickupTime && (
                            <div className="flex items-center text-sm text-gray-700">
                              <Clock size={16} className="mr-2 text-orange-600 shrink-0" />
                              <span>{request.foodListing.pickupTime}</span>
                            </div>
                          )}

                          {request.foodListing?.restaurant?.address && (
                            <div className="flex items-center text-sm text-gray-700">
                              <MapPin size={16} className="mr-2 text-red-600 shrink-0" />
                              <span className="truncate">{request.foodListing.restaurant.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                          Requested {formatDate(request.createdAt)}
                        </div>

                        {/* Action Buttons */}
                        {request.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            Cancel Request
                          </Button>
                        )}

                        {request.status === 'APPROVED' && (
                          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 text-center">
                            <p className="text-emerald-700 font-semibold text-sm">
                              ✓ Approved! Ready for pickup
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {completedRequests.length === 0 ? (
                  <Card>
                    <div className="p-12 text-center text-gray-600">
                      <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">No completed pickups yet</p>
                      <p className="text-sm mt-2">Your pickup history will appear here</p>
                    </div>
                  </Card>
                ) : (
                  completedRequests.map((item) => (
                    <Card key={item.id} className="hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {item.foodListing?.title}
                            </h3>
                            <p className="text-gray-600">
                              {item.foodListing?.restaurant?.restaurantName}
                            </p>
                          </div>
                          <Badge variant="success">
                            <CheckCircle size={14} className="mr-1" />
                            {item.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center text-gray-700">
                            <Package size={16} className="mr-2 text-emerald-600 shrink-0" />
                            <span>Quantity: {item.quantity} {item.foodListing?.unit}</span>
                          </div>

                          {item.pickupDate && (
                            <div className="flex items-center text-gray-700">
                              <Clock size={16} className="mr-2 text-blue-600 shrink-0" />
                              <span>Picked up: {new Date(item.pickupDate).toLocaleDateString()}</span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-500 text-xs">
                            <Clock size={14} className="mr-2 shrink-0" />
                            <span>Completed: {new Date(item.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {item.foodListing?.description && (
                          <p className="text-sm text-gray-600 italic border-l-4 border-emerald-500 pl-3 py-1">
                            {item.foodListing.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, requestId: '' })}
        onConfirm={confirmCancelRequest}
        title="Cancel Request"
        message="Are you sure you want to cancel this request? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        type="warning"
      />
    </div>
  );
};
