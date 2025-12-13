import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input, ToastContainer, ConfirmDialog } from '../components/ui';
import { BarChart3, Package, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import { foodAPI, requestAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

interface RestaurantDashboardProps {
  restaurantName: string;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ restaurantName }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'requests'>('stats');
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

  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'pieces',
    expiryDate: '',
    pickupTime: '',
    category: 'prepared-food',
    imageData: '',
    imageMimeType: '',
    imageUrl: '',
  }); const [myListings, setMyListings] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const stats = {
    totalListings: myListings.length,
    activeDonations: myListings.filter(l => l.status === 'AVAILABLE').length,
    completedDonations: 45,
    totalImpact: '320 meals saved',
    thisMonth: 28,
    thisWeek: 7,
  };

  // Handle create/update listing
  const handleSaveListing = async () => {
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
        category: 'prepared-food',
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
      setMyListings(response.data || response || []);
    } catch (err: any) {
      console.error('Error loading listings:', err);
    }
  };

  // Load pending requests
  const loadPendingRequests = async () => {
    try {
      const response = await requestAPI.getRestaurantRequests('PENDING');
      // Axios interceptor already extracts response.data
      // Backend returns { success, message, data: [...] }
      setPendingRequests(response.data || response || []);
    } catch (err: any) {
      console.error('Error loading requests:', err);
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (id: string) => {
    setDeleteDialog({ isOpen: true, listingId: id });
  };

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{restaurantName}</h1>
              <p className="text-lg text-gray-600">Manage your donations and make an impact</p>
            </div>
            <Button className="hidden md:flex items-center" onClick={() => setShowNewListingModal(true)}>
              <Plus size={20} className="mr-2" />
              <span>New Listing</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-md flex-wrap">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-max py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'stats'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BarChart3 size={20} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 min-w-max py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'listings'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Package size={20} />
            <span>My Listings</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 min-w-max py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${activeTab === 'requests'
              ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Clock size={20} />
            <span>Requests ({pendingRequests.length})</span>
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-gray-900">{stats.activeDonations}</div>
                  <div className="text-gray-600">Active Listings</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-gray-900">{stats.completedDonations}</div>
                  <div className="text-gray-600">Completed</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-gray-900">{stats.thisMonth}</div>
                  <div className="text-gray-600">This Month</div>
                </div>
              </Card>
              <Card>
                <div className="p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="text-2xl font-bold text-emerald-600">{stats.totalImpact}</div>
                  <div className="text-gray-600">Total Impact</div>
                </div>
              </Card>
            </div>

            {/* Impact Chart */}
            <Card>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Impact Overview</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">This Week</span>
                      <span className="text-emerald-600 font-bold">{stats.thisWeek} meals</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-linear-to-r from-emerald-500 to-teal-500 h-4 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">This Month</span>
                      <span className="text-teal-600 font-bold">{stats.thisMonth} meals</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-linear-to-r from-teal-500 to-cyan-500 h-4 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">All Time</span>
                      <span className="text-cyan-600 font-bold">{stats.totalImpact}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-linear-to-r from-cyan-500 to-blue-500 h-4 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {myListings.map((listing) => (
              <Card key={listing.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                      <p className="text-gray-600">Quantity: {listing.quantity} {listing.unit}</p>
                      {listing.description && <p className="text-gray-600 text-sm">{listing.description}</p>}
                    </div>
                    <Badge
                      variant={
                        listing.status === 'AVAILABLE'
                          ? 'success'
                          : listing.status === 'RESERVED'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Expires:</span> {new Date(listing.expiryDate).toLocaleString()}
                      <span className="ml-4 font-semibold">Pickup:</span> {listing.pickupTime}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => {
                        setEditingId(listing.id);
                        setFormData({
                          title: listing.title,
                          description: listing.description,
                          quantity: listing.quantity.toString(),
                          unit: listing.unit,
                          expiryDate: listing.expiryDate,
                          pickupTime: listing.pickupTime,
                          category: listing.category || 'prepared-food',
                          imageData: '',
                          imageMimeType: '',
                          imageUrl: listing.imageUrl || '',
                        });
                        setShowNewListingModal(true);
                      }}>Edit</Button>
                      <Button className="hover:bg-red-500/20 hover:text-red-600 hover:border-red-300 transition-all" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {myListings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No listings yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{request.foodListing?.title || 'Food Item'}</h3>
                      <p className="text-gray-600">Requested by: {request.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">Quantity: {request.quantity} • {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="warning">{request.status}</Badge>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-red-500/20 hover:text-red-600 hover:border-red-300 transition-all"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={isLoading}
                    >
                      <XCircle size={18} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No pending requests</p>
              </div>
            )}
          </div>
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
            category: 'prepared-food',
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
                <Input
                  type="text"
                  placeholder="e.g., prepared-food, raw-ingredients, bakery..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
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
                    category: 'prepared-food',
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
                {isLoading ? 'Saving...' : editingId ? 'Update Listing' : 'Create Listing'}
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
      </div>
    </div>
  );
};
