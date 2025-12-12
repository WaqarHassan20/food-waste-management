import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';
import { Search, MapPin, Package, Clock, Users, Filter, ShoppingBag } from 'lucide-react';

export const FoodBrowsePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
      description: 'Assorted fresh sandwiches including vegetarian options',
    },
    {
      id: 2,
      restaurant: 'Healthy Bites',
      foodItem: 'Vegetable Salad Bowls',
      quantity: '15 bowls',
      pickupTime: '7:00 PM - 9:00 PM',
      location: '456 Oak Ave',
      distance: '1.2 km',
      description: 'Fresh vegetable salad bowls with various dressings',
    },
    {
      id: 3,
      restaurant: 'Pizza Palace',
      foodItem: 'Assorted Pizzas',
      quantity: '8 pizzas',
      pickupTime: '5:30 PM - 7:30 PM',
      location: '789 Elm Street',
      distance: '2.1 km',
      description: 'Various pizza flavors including cheese, pepperoni, and veggie',
    },
    {
      id: 4,
      restaurant: 'Taco Town',
      foodItem: 'Vegetarian Tacos',
      quantity: '20 tacos',
      pickupTime: '6:30 PM - 8:30 PM',
      location: '321 Pine Road',
      distance: '1.8 km',
      description: 'Fresh vegetarian tacos with beans, rice, and vegetables',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Available Food</h1>
          <p className="text-gray-600">Find surplus food from restaurants near you</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for food items or restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="flex items-center space-x-2">
                <Search size={20} />
                <span>Search</span>
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Filter size={16} className="mr-1" />
                All
              </Button>
              <Button size="sm" variant="outline">
                <MapPin size={16} className="mr-1" />
                Nearby
              </Button>
              <Button size="sm" variant="outline">
                <Clock size={16} className="mr-1" />
                Available Now
              </Button>
              <Button size="sm" variant="outline">
                <Package size={16} className="mr-1" />
                Vegetarian
              </Button>
            </div>
          </div>
        </Card>

        {/* Food Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFood.map((food) => (
            <Card key={food.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{food.foodItem}</h3>
                  <Badge variant="success">{food.distance}</Badge>
                </div>

                <p className="text-gray-600 text-sm mb-4">{food.description}</p>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users size={18} className="mr-2 text-emerald-600 shrink-0" />
                    <span>{food.restaurant}</span>
                  </div>
                  <div className="flex items-center">
                    <Package size={18} className="mr-2 text-blue-600 shrink-0" />
                    <span>{food.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-orange-600 shrink-0" />
                    <span>{food.pickupTime}</span>
                  </div>
                  <div className="flex items-center">
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
      </div>
    </div>
  );
};
