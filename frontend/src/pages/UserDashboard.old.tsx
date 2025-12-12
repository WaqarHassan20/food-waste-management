import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { Search, Users, Clock, MapPin, Package, CheckCircle, ShoppingBag } from 'lucide-react';

interface UserDashboardProps {
  userName: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ userName }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'history'>('browse');

  // Mock data
  const availableFood = [
    {
      id: 1,
      restaurant: 'Green Bistro',
      foodItem: 'Fresh Sandwiches',
      quantity: '10 pieces',
      pickupTime: '6:00 PM - 8:00 PM',
      location: '123 Main St',
      distance: '0.5 km',
      description: 'Assorted fresh sandwiches with various fillings',
    },
    {
      id: 2,
      restaurant: 'Healthy Bites',
      foodItem: 'Vegetable Salad Bowls',
      quantity: '15 bowls',
      pickupTime: '7:00 PM - 9:00 PM',
      location: '456 Oak Ave',
      distance: '1.2 km',
      description: 'Fresh vegetable salads with dressing',
    },
    {
      id: 3,
      restaurant: 'Pizza Palace',
      foodItem: 'Assorted Pizzas',
      quantity: '8 pizzas',
      pickupTime: '5:30 PM - 7:30 PM',
      location: '789 Elm St',
      distance: '2.0 km',
      description: 'Cheese, pepperoni, and veggie pizzas',
    },
  ];

  const myRequests = [
    {
      id: 1,
      restaurant: 'Pizza Palace',
      foodItem: 'Assorted Pizzas',
      quantity: '3 pizzas',
      status: 'PENDING' as const,
      requestedAt: '2 hours ago',
    },
    {
      id: 2,
      restaurant: 'Taco Town',
      foodItem: 'Vegetarian Tacos',
      quantity: '8 tacos',
      status: 'APPROVED' as const,
      pickupTime: 'Today, 6:00 PM',
      requestedAt: '1 day ago',
    },
  ];

  const history = [
    { id: 1, restaurant: 'Green Bistro', foodItem: 'Sandwiches', quantity: '5 pieces', date: '2024-12-01', status: 'COMPLETED' },
    { id: 2, restaurant: 'Healthy Bites', foodItem: 'Salad Bowls', quantity: '3 bowls', date: '2024-11-28', status: 'COMPLETED' },
    { id: 3, restaurant: 'Pizza Palace', foodItem: 'Pizzas', quantity: '2 pizzas', date: '2024-11-25', status: 'COMPLETED' },
  ];

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
                <div className="text-3xl font-bold text-emerald-600">15</div>
                <div className="text-sm text-gray-600">Meals Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-gray-600">Available Items</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-gray-600">Pending Requests</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">15</div>
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

        {/* Browse Food Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableFood.map((food) => (
              <Card key={food.id}>
                <div className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{food.foodItem}</h3>
                    <Badge variant="success">{food.distance}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{food.description}</p>
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Users size={18} className="mr-2 text-emerald-600 shrink-0" />
                      <span>{food.restaurant}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Package size={18} className="mr-2 text-blue-600 shrink-0" />
                      <span>{food.quantity}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock size={18} className="mr-2 text-orange-600 shrink-0" />
                      <span>{food.pickupTime}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin size={18} className="mr-2 text-red-600 shrink-0" />
                      <span>{food.location}</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <ShoppingBag size={18} className="mr-2" />
                    Request Food
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {myRequests.map((request) => (
              <Card key={request.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{request.foodItem}</h3>
                      <p className="text-gray-600">{request.restaurant}</p>
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
                    <div>Quantity: {request.quantity}</div>
                    {request.pickupTime && <div className="font-semibold text-emerald-600">Pickup: {request.pickupTime}</div>}
                    <div className="text-gray-500">Requested: {request.requestedAt}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Pickup History</h3>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">{item.foodItem}</div>
                      <div className="text-sm text-gray-600">{item.restaurant} • {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">✓ {item.status}</Badge>
                      <div className="text-xs text-gray-500 mt-1">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
