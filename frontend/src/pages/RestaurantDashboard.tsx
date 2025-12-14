import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, ToastContainer, ConfirmDialog } from '../components/ui';
import { BarChart3, Package, Clock, Plus, CheckCircle, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { foodAPI, requestAPI, authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { getCategoryLabel, type FoodCategory } from '../types';

interface RestaurantDashboardProps {
  restaurantName: string;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ restaurantName }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'requests' | 'history'>('stats');
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadType, setImageUploadType] = useState<'upload' | 'url'>('upload');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    listingId: string;
  }>({ isOpen: false, listingId: '' });
  const [restaurantProfile, setRestaurantProfile] = useState<any>(null);

  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'pieces',
    expiryDate: '',
    pickupTime: '',
    category: 'PREPARED_FOOD',
    imageData: '',
    imageMimeType: '',
    imageUrl: '',
  });

  const [myListings, setMyListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [completedListings, setCompletedListings] = useState<any[]>([]);
  const [filteredCompletedListings, setFilteredCompletedListings] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [completedRequests, setCompletedRequests] = useState<any[]>([]);

  // Calculate dynamic stats based on actual data
  // Impact should be based on completed REQUESTS (actual pickups), not listings
  const stats = {
    totalListings: myListings.length,
    activeDonations: myListings.filter(l => l.status === 'AVAILABLE' || l.status === 'RESERVED').length,
    completedDonations: completedRequests.length,
    totalImpactItems: completedRequests.reduce((sum, r) => sum + (r.quantity || 0), 0),
    totalImpact: `${completedRequests.reduce((sum, r) => sum + (r.quantity || 0), 0)} items saved`,
    thisMonthListings: completedRequests.filter(r => {
      const createdDate = new Date(r.createdAt);
      const now = new Date();
      const isThisMonth = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      return isThisMonth;
    }),
    thisMonth: completedRequests.filter(r => {
      const createdDate = new Date(r.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length,
    thisWeekListings: completedRequests.filter(r => {
      const createdDate = new Date(r.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const isThisWeek = createdDate >= oneWeekAgo;
      return isThisWeek;
    }),
    thisWeek: completedRequests.filter(r => {
      const createdDate = new Date(r.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdDate >= oneWeekAgo;
    }).length,
  };

  // Calculate impact quantities for each period (based on completed requests)
  const thisWeekImpact = stats.thisWeekListings.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const thisMonthImpact = stats.thisMonthListings.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const allTimeImpact = stats.totalImpactItems;

  // Calculate percentages for progress bars (relative to max)
  const maxImpact = Math.max(thisWeekImpact, thisMonthImpact, allTimeImpact, 1); // Avoid division by zero
  const weekPercentage = (thisWeekImpact / maxImpact) * 100;
  const monthPercentage = (thisMonthImpact / maxImpact) * 100;
  const allTimePercentage = (allTimeImpact / maxImpact) * 100;

  // Load data on mount
  useEffect(() => {
    loadRestaurantProfile();
    loadMyListings();
    loadPendingRequests();
    loadCompletedRequests();
  }, []);

  // Fetch restaurant profile
  const loadRestaurantProfile = async () => {
    try {
      const response: any = await authAPI.getRestaurantProfile();
      const profile = response.data || response;
      setRestaurantProfile(profile);
    } catch (error) {
      console.error('Error loading restaurant profile:', error);
    }
  };

  // Filter listings by category
  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredListings(myListings);
      setFilteredCompletedListings(completedListings);
    } else {
      setFilteredListings(myListings.filter(l => l.category === selectedCategory));
      setFilteredCompletedListings(completedListings.filter(l => l.category === selectedCategory));
    }
  }, [selectedCategory, myListings, completedListings]);

  // Handle create/update listing
  const handleSaveListing = async () => {
    // Check if restaurant is verified
    if (!restaurantProfile?.isVerified) {
      toast.error('Your restaurant needs to be verified before you can create listings.');
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      // Convert expiryDate to ISO format
      const expiryDateISO = new Date(formData.expiryDate).toISOString();

      const listingData: any = {
        title: formData.title,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        expiryDate: expiryDateISO,
        pickupTime: formData.pickupTime,
        category: formData.category,
      };

      // Add image data if present (binary upload)
      if (formData.imageData) {
        listingData.imageData = formData.imageData;
        listingData.imageMimeType = formData.imageMimeType || 'image/jpeg';
      }

      // Add image URL if present (URL option)
      if (formData.imageUrl) {
        listingData.imageUrl = formData.imageUrl;
      }

      if (editingId) {
        await foodAPI.updateListing(editingId, listingData);
        toast.success('Listing updated successfully!');
      } else {
        await foodAPI.createListing(listingData);
        toast.success('Listing created successfully!');
      }

      // Reset form and close modal
      setShowNewListingModal(false);
      setEditingId(null);
      setImagePreview(null);
      setFormData({
        title: '',
        description: '',
        quantity: '',
        unit: 'pieces',
        expiryDate: '',
        pickupTime: '',
        category: 'PREPARED_FOOD',
        imageData: '',
        imageMimeType: '',
        imageUrl: '',
      });

      // Reload listings
      await loadMyListings();
    } catch (err: any) {
      // Handle field-specific errors if available
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.message || 'Failed to save listing');
      }
      console.error('Error saving listing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFieldErrors(prev => ({ ...prev, image: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Clear any previous error
    setFieldErrors(prev => ({ ...prev, image: '' }));

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData(prev => ({
        ...prev,
        imageData: base64String,
        imageMimeType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Load my listings
  const loadMyListings = async () => {
    try {
      const response = await foodAPI.getMyListings();
      // Axios interceptor already extracts response.data
      // Backend returns { success, message, data: [...] }
      const listings = response.data || response || [];

      // Separate active and completed listings
      const active = listings.filter((l: any) =>
        l.status === 'AVAILABLE' || l.status === 'RESERVED'
      );
      const completed = listings.filter((l: any) =>
        l.status === 'CLAIMED' || l.status === 'EXPIRED'
      );

      setMyListings(active);
      setCompletedListings(completed);
    } catch (err: any) {
      console.error('Error loading listings:', err);
    }
  };

  // Load pending requests
  const loadPendingRequests = async () => {
    try {
      // Get both PENDING and APPROVED requests
      const response = await requestAPI.getRestaurantRequests();
      // Axios interceptor already extracts response.data
      // Backend returns { success, message, data: [...] }
      const allRequests = response.data || response || [];
      // Filter to show only PENDING and APPROVED (ready for pickup)
      const activeRequests = allRequests.filter(
        (r: any) => r.status === 'PENDING' || r.status === 'APPROVED'
      );
      setPendingRequests(activeRequests);
    } catch (err: any) {
      console.error('Error loading requests:', err);
    }
  };

  // Load completed requests for impact calculation
  const loadCompletedRequests = async () => {
    try {
      const response = await requestAPI.getRestaurantRequests('COMPLETED');
      const requests = response.data || response || [];
      setCompletedRequests(requests);
      console.log('✅ Completed Requests Loaded:', {
        count: requests.length,
        totalQuantity: requests.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0),
        requests: requests.map((r: any) => ({
          id: r.id,
          quantity: r.quantity,
          foodTitle: r.foodListing?.title,
          completedAt: r.updatedAt
        }))
      });
    } catch (err: any) {
      console.error('Error loading completed requests:', err);
    }
  };

  // Confirm delete listing
  const confirmDeleteListing = async () => {
    setIsLoading(true);
    try {
      await foodAPI.deleteListing(deleteDialog.listingId);
      toast.success('Listing deleted successfully!');
      await loadMyListings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete listing');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approve request
  const handleApproveRequest = async (id: string) => {
    setIsLoading(true);
    try {
      await requestAPI.updateRequestStatus(id, 'APPROVED');
      toast.success('Request approved!');
      await loadPendingRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (id: string) => {
    setIsLoading(true);
    try {
      await requestAPI.updateRequestStatus(id, 'REJECTED');
      toast.success('Request rejected!');
      await loadPendingRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle complete request (mark as picked up)
  const handleCompleteRequest = async (id: string) => {
    setIsLoading(true);
    try {
      await requestAPI.updateRequestStatus(id, 'COMPLETED');
      toast.success('Request marked as completed!');
      await Promise.all([loadPendingRequests(), loadCompletedRequests(), loadMyListings()]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                {restaurantName}
                {restaurantProfile?.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <ShieldCheck size={16} className="mr-1" />
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600">Manage your donations and make an impact</p>
            </div>
            <Button
              className="hidden md:flex items-center"
              onClick={() => setShowNewListingModal(true)}
              disabled={!restaurantProfile?.isVerified}
            >
              <Plus size={20} className="mr-2" />
              <span>New Listing</span>
            </Button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {restaurantProfile && !restaurantProfile.isVerified && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-md">
            <div className="flex items-start">
              <AlertCircle className="text-amber-600 mr-3 mt-0.5 shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Account Verification Pending
                </h3>
                <p className="text-amber-800 mb-3">
                  Your restaurant account is currently under review by our admin team. You'll be able to create food listings once your account is verified.
                </p>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-gray-700 mb-2 font-medium">What happens next?</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Our admin team will review your restaurant information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>You'll receive a notification once your account is verified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Verification typically takes 24-48 hours</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-md scrollbar-hide">
          <button
            onClick={() => setActiveTab('stats')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'stats'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BarChart3 size={18} className="sm:w-5 sm:h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'listings'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Package size={18} className="sm:w-5 sm:h-5" />
            <span>My Listings</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'requests'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Clock size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Requests ({pendingRequests.length})</span>
            <span className="sm:hidden">Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`shrink-0 py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${activeTab === 'history'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
            <span>History</span>
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-all transform hover:scale-105 duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeDonations}</div>
                  <div className="text-gray-600 text-sm">Active Listings</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-all transform hover:scale-105 duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedDonations}</div>
                  <div className="text-gray-600 text-sm">Completed</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-all transform hover:scale-105 duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.thisMonth}</div>
                  <div className="text-gray-600 text-sm">This Month</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-all transform hover:scale-105 duration-300 bg-linear-to-br from-emerald-50 to-teal-50">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {stats.totalImpactItems} {stats.totalImpactItems === 1 ? 'item' : 'items'}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Total Impact</div>
                </div>
              </Card>
            </div>

            {/* Impact Chart */}
            <Card>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Impact Overview</h3>
                <div className="space-y-6">
                  {/* This Week */}
                  <div className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">This Week</span>
                      <span className="text-emerald-600 font-bold transition-transform group-hover:scale-110">
                        {thisWeekImpact} {thisWeekImpact === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-md relative overflow-hidden"
                        style={{ width: `${weekPercentage === 0 ? 0 : Math.max(weekPercentage, 2)}%` }}
                      >
                        {weekPercentage > 0 && (
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">This Month</span>
                      <span className="text-teal-600 font-bold transition-transform group-hover:scale-110">
                        {thisMonthImpact} {thisMonthImpact === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-linear-to-r from-teal-500 via-teal-400 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-md relative overflow-hidden"
                        style={{ width: `${monthPercentage === 0 ? 0 : Math.max(monthPercentage, 2)}%` }}
                      >
                        {monthPercentage > 0 && (
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* All Time */}
                  <div className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">All Time</span>
                      <span className="text-cyan-600 font-bold transition-transform group-hover:scale-110">
                        {allTimeImpact} {allTimeImpact === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-linear-to-r from-cyan-500 via-blue-400 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-md relative overflow-hidden"
                        style={{ width: `${allTimePercentage === 0 ? 0 : Math.max(allTimePercentage, 2)}%` }}
                      >
                        {allTimePercentage > 0 && (
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Empty State */}
                  {allTimeImpact === 0 && (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">Start creating listings to see your impact!</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <>
            {/* Category Filter */}
            <div className="mb-6 bg-white p-4 rounded-2xl shadow-md">
              <div className="mb-3">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Filter by Category:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedCategory === 'ALL'
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                        }}
                      />
                    ) : listing.imageData ? (
                      <img
                        src={`data:${listing.imageMimeType || 'image/jpeg'};base64,${listing.imageData}`}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-emerald-300" />
                      </div>
                    )}
                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          listing.status === 'AVAILABLE'
                            ? 'success'
                            : listing.status === 'RESERVED'
                              ? 'warning'
                              : 'default'
                        }
                        className="shadow-lg"
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    {/* Category Badge */}
                    {listing.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="default" className="bg-white/90 text-gray-800 shadow-lg text-xs">
                          {getCategoryLabel(listing.category)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {listing.title}
                    </h3>

                    {listing.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Package size={16} className="mr-2 text-emerald-600" />
                        <span className="font-semibold">Quantity:</span>
                        <span className="ml-1">{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock size={16} className="mr-2 text-emerald-600" />
                        <span className="font-semibold">Pickup:</span>
                        <span className="ml-1">{listing.pickupTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-2">📅</span>
                        <span className="font-semibold">Expires:</span>
                        <span className="ml-1">{new Date(listing.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingId(listing.id);
                          setFormData({
                            title: listing.title,
                            description: listing.description,
                            quantity: listing.quantity.toString(),
                            unit: listing.unit,
                            expiryDate: listing.expiryDate,
                            pickupTime: listing.pickupTime,
                            category: listing.category || 'PREPARED_FOOD',
                            imageData: '',
                            imageMimeType: '',
                            imageUrl: listing.imageUrl || '',
                          });
                          setShowNewListingModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 hover:bg-red-500/20 hover:text-red-600 hover:border-red-300 transition-all"
                        onClick={() => setDeleteDialog({ isOpen: true, listingId: listing.id })}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredListings.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg mb-4">
                    {selectedCategory === 'ALL'
                      ? 'No listings yet'
                      : `No ${getCategoryLabel(selectedCategory as FoodCategory)} listings found`}
                  </p>
                  <Button
                    onClick={() => setShowNewListingModal(true)}
                    disabled={!restaurantProfile?.isVerified}
                  >
                    <Plus size={20} className="mr-2" />
                    {restaurantProfile?.isVerified ? 'Create Your First Listing' : 'Verification Required'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
                  {request.foodListing?.imageUrl ? (
                    <img
                      src={request.foodListing.imageUrl}
                      alt={request.foodListing?.title || 'Food Item'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                      }}
                    />
                  ) : request.foodListing?.imageData ? (
                    <img
                      src={`data:${request.foodListing.imageMimeType || 'image/jpeg'};base64,${request.foodListing.imageData}`}
                      alt={request.foodListing?.title || 'Food Item'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={64} className="text-emerald-300" />
                    </div>
                  )}
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={request.status === 'APPROVED' ? 'success' : 'warning'}
                      className="shadow-lg"
                    >
                      {request.status}
                    </Badge>
                  </div>
                  {/* Category Badge */}
                  {request.foodListing?.category && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="default" className="bg-white/90 text-gray-800 shadow-lg text-xs">
                        {getCategoryLabel(request.foodListing.category)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {request.foodListing?.title || 'Food Item'}
                  </h3>

                  {/* Requested by Info */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      👤 Requested by: {request.user?.name || 'Unknown'}
                    </p>
                    {request.user?.phone && (
                      <p className="text-xs text-blue-700">📞 {request.user.phone}</p>
                    )}
                    {request.user?.email && (
                      <p className="text-xs text-blue-700">✉️ {request.user.email}</p>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package size={16} className="mr-2 shrink-0 text-emerald-600" />
                      <span className="font-semibold mr-1">Quantity:</span>
                      <span>{request.quantity}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2 shrink-0 text-emerald-600" />
                      <span className="font-semibold mr-1">Requested:</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'PENDING' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full"
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={isLoading}
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Approve Request
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full hover:bg-red-500/20 hover:text-red-600 hover:border-red-300 transition-all"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={isLoading}
                      >
                        <XCircle size={18} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.status === 'APPROVED' && (
                    <div className="space-y-2">
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 text-center">
                        <p className="text-emerald-700 font-semibold text-sm">
                          ✓ Approved - Waiting for pickup
                        </p>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleCompleteRequest(request.id)}
                        disabled={isLoading}
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Mark as Picked Up
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {pendingRequests.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No pending or approved requests</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompletedListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover opacity-75"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                        }}
                      />
                    ) : listing.imageData ? (
                      <img
                        src={`data:${listing.imageMimeType || 'image/jpeg'};base64,${listing.imageData}`}
                        alt={listing.title}
                        className="w-full h-full object-cover opacity-75"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-gray-300" />
                      </div>
                    )}
                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="shadow-lg bg-gray-600">
                        {listing.status}
                      </Badge>
                    </div>
                    {/* Category Badge */}
                    {listing.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="default" className="bg-white/90 text-gray-800 shadow-lg text-xs">
                          {getCategoryLabel(listing.category)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {listing.title}
                    </h3>

                    {listing.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Package size={16} className="mr-2 text-gray-500 shrink-0" />
                        <span className="font-semibold">Quantity:</span>
                        <span className="ml-1">{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock size={16} className="mr-2 text-gray-500 shrink-0" />
                        <span className="font-semibold">Pickup Time:</span>
                        <span className="ml-1">{listing.pickupTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-2">📅</span>
                        <span className="font-semibold">Created:</span>
                        <span className="ml-1">{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-emerald-600 font-semibold">
                        <CheckCircle size={16} className="mr-2 shrink-0" />
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredCompletedListings.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg mb-2">
                    {selectedCategory === 'ALL'
                      ? 'No completed donations yet'
                      : `No completed ${getCategoryLabel(selectedCategory as FoodCategory)} donations found`}
                  </p>
                  <p className="text-sm text-gray-500">Completed food donations will appear here</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* New/Edit Listing Modal */}
        <Modal isOpen={showNewListingModal} onClose={() => {
          setShowNewListingModal(false);
          setEditingId(null);
          setImagePreview(null);
          setFormData({
            title: '',
            description: '',
            quantity: '',
            unit: 'pieces',
            expiryDate: '',
            pickupTime: '',
            category: 'PREPARED_FOOD',
            imageData: '',
            imageMimeType: '',
            imageUrl: '',
          });
        }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {editingId ? 'Edit Listing' : 'Create New Listing'}
              </h2>
              <p className="text-gray-600">
                {editingId ? 'Update your food listing details' : 'Add a new food item to donate'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Item Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Pizza Slices, Sandwich, Salad..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <Input
                  type="number"
                  placeholder="e.g., 20, 5, 10..."
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                <Input
                  type="text"
                  placeholder="e.g., pieces, portions, bowls, kg..."
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                <Input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Time</label>
                <Input
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="PREPARED_FOOD">Prepared Food</option>
                  <option value="RAW_INGREDIENTS">Raw Ingredients</option>
                  <option value="BAKERY">Bakery Items</option>
                  <option value="DAIRY">Dairy Products</option>
                  <option value="FRUITS_VEGETABLES">Fruits & Vegetables</option>
                  <option value="BEVERAGES">Beverages</option>
                  <option value="PACKAGED_FOOD">Packaged Food</option>
                  <option value="FROZEN_FOOD">Frozen Food</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Describe the food items, any allergies, or special notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Image</label>

                {/* Toggle between upload and URL */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadType('upload');
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${imageUploadType === 'upload'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadType('url');
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, imageData: '', imageMimeType: '' }));
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${imageUploadType === 'url'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Image URL
                  </button>
                </div>

                <div className="space-y-3">
                  {imageUploadType === 'upload' ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                      {fieldErrors.image && (
                        <p className="text-sm text-red-600">{fieldErrors.image}</p>
                      )}
                      {imagePreview && (
                        <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, imageData: '', imageMimeType: '' }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                      {formData.imageUrl && (
                        <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, imageUrl: '' }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowNewListingModal(false);
                  setEditingId(null);
                  setImagePreview(null);
                  setFormData({
                    title: '',
                    description: '',
                    quantity: '',
                    unit: 'pieces',
                    expiryDate: '',
                    pickupTime: '',
                    category: 'PREPARED_FOOD',
                    imageData: '',
                    imageMimeType: '',
                    imageUrl: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveListing}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : editingId ? 'Update Listing' : 'Create Listing'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, listingId: '' })}
          onConfirm={confirmDeleteListing}
          title="Delete Listing"
          message="Are you sure you want to delete this food listing? This action cannot be undone and will remove all associated requests."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />

        {/* Floating Action Button for Mobile */}
        {restaurantProfile?.isVerified && (
          <button
            onClick={() => setShowNewListingModal(true)}
            className="md:hidden fixed bottom-6 right-6 bg-linear-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50"
            aria-label="Add new listing"
          >
            <Plus size={28} />
          </button>
        )}
      </div>
    </div>
  );
};
