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

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'browse') {
        const response: any = await foodAPI.getAllFood({ limit: 20 });
        // Handle both response.data.foodListings (from interceptor) and response.foodListings (direct)
        const data = response.data || response;
        const listings = data.foodListings || data || [];
        setAvailableFood(listings);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableFood.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-600">
                    No food available at the moment
                  </div>
                ) : (
                  availableFood.map((food) => (
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
            )}

            {/* My Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {myRequests.length === 0 ? (
                  <Card>
                    <div className="p-12 text-center text-gray-600">
                      No active requests
                    </div>
                  </Card>
                ) : (
                  myRequests.map((request) => (
                    <Card key={request.id}>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {request.foodListing?.title}
                            </h3>
                            <p className="text-gray-600">
                              {request.foodListing?.restaurant?.restaurantName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              request.status === 'APPROVED'
                                ? 'success'
                                : request.status === 'PENDING'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div>Quantity: {request.quantity} {request.foodListing?.unit}</div>
                          {request.pickupDate && (
                            <div className="font-semibold text-emerald-600">
                              Pickup: {new Date(request.pickupDate).toLocaleString()}
                            </div>
                          )}
                          <div className="text-gray-500">
                            Requested: {formatDate(request.createdAt)}
                          </div>
                        </div>
                        {request.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Pickup History</h3>
                  <div className="space-y-4">
                    {completedRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">
                        No completed requests yet
                      </div>
                    ) : (
                      completedRequests.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.foodListing?.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.foodListing?.restaurant?.restaurantName} • {item.quantity} {item.foodListing?.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="success">✓ {item.status}</Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
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
