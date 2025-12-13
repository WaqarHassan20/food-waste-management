#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"

echo "======================================"
echo "Food Waste Management API Test Suite"
echo "======================================"
echo ""

# Test 1: Restaurant Registration
echo "TEST 1: Restaurant Registration"
RESPONSE=$(curl -X POST $API_URL/auth/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{"email":"restaurant1@test.com","password":"securePass123","restaurantName":"Test Restaurant 1","description":"Test restaurant","address":"123 Test St","phone":"+1234567890","latitude":40.7128,"longitude":-74.0060}' \
  -s)
RESTAURANT_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
RESTAURANT_ID=$(echo $RESPONSE | jq -r '.data.restaurant.id')
if [ "$RESTAURANT_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Restaurant registered successfully"
  echo "  Token: ${RESTAURANT_TOKEN:0:50}..."
else
  echo -e "${RED}✗ FAILED${NC} - Restaurant registration failed"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 2: Restaurant Login
echo "TEST 2: Restaurant Login"
RESPONSE=$(curl -X POST $API_URL/auth/restaurant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"restaurant1@test.com","password":"securePass123"}' \
  -s)
LOGIN_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
if [ "$LOGIN_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Restaurant login successful"
  RESTAURANT_TOKEN=$LOGIN_TOKEN
else
  echo -e "${RED}✗ FAILED${NC} - Restaurant login failed"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 3: Get Restaurant Profile
echo "TEST 3: Get Restaurant Profile"
RESPONSE=$(curl -X GET $API_URL/auth/restaurant/profile \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -s)
PROFILE_EMAIL=$(echo $RESPONSE | jq -r '.data.email')
if [ "$PROFILE_EMAIL" = "restaurant1@test.com" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Restaurant profile retrieved"
else
  echo -e "${RED}✗ FAILED${NC} - Failed to get restaurant profile"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 4: User Registration
echo "TEST 4: User Registration"
RESPONSE=$(curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"userPass123","name":"Test User","phone":"+1234567890","role":"USER","address":"456 User St"}' \
  -s)
USER_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
USER_ID=$(echo $RESPONSE | jq -r '.data.user.id')
if [ "$USER_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - User registered successfully"
  echo "  Token: ${USER_TOKEN:0:50}..."
else
  echo -e "${RED}✗ FAILED${NC} - User registration failed"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 5: User Login
echo "TEST 5: User Login"
RESPONSE=$(curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"userPass123"}' \
  -s)
USER_LOGIN_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
if [ "$USER_LOGIN_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - User login successful"
  USER_TOKEN=$USER_LOGIN_TOKEN
else
  echo -e "${RED}✗ FAILED${NC} - User login failed"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 6: Create Food Listing (Restaurant)
echo "TEST 6: Create Food Listing (Restaurant only)"
EXPIRY_DATE=$(date -u -d "+1 day" +"%Y-%m-%dT%H:%M:%SZ")
RESPONSE=$(curl -X POST $API_URL/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -d "{\"title\":\"Pizza Slices\",\"description\":\"Leftover pepperoni pizza from today\",\"quantity\":20,\"unit\":\"slices\",\"expiryDate\":\"$EXPIRY_DATE\",\"pickupTime\":\"5:00 PM - 8:00 PM\",\"category\":\"prepared-food\"}" \
  -s)
FOOD_LISTING_ID=$(echo $RESPONSE | jq -r '.data.id')
if [ "$FOOD_LISTING_ID" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Food listing created"
  echo "  Listing ID: $FOOD_LISTING_ID"
else
  echo -e "${RED}✗ FAILED${NC} - Failed to create food listing"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 7: Get All Food Listings (Public)
echo "TEST 7: Get All Food Listings (Public)"
RESPONSE=$(curl -X GET $API_URL/food -s)
LISTINGS_COUNT=$(echo $RESPONSE | jq '.data.listings | length')
if [ "$LISTINGS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Retrieved $LISTINGS_COUNT food listings"
else
  echo -e "${YELLOW}⚠ WARNING${NC} - No food listings found"
fi
echo ""

# Test 8: Get My Listings (Restaurant)
echo "TEST 8: Get My Listings (Restaurant only)"
RESPONSE=$(curl -X GET $API_URL/food/my/listings \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -s)
MY_LISTINGS_COUNT=$(echo $RESPONSE | jq '.data | length')
if [ "$MY_LISTINGS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Retrieved $MY_LISTINGS_COUNT listings for restaurant"
else
  echo -e "${YELLOW}⚠ WARNING${NC} - No listings found for restaurant"
fi
echo ""

# Test 9: Create Food Request (User)
echo "TEST 9: Create Food Request (User only)"
RESPONSE=$(curl -X POST $API_URL/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{\"foodListingId\":\"$FOOD_LISTING_ID\",\"quantity\":5,\"message\":\"Need this for family dinner\"}" \
  -s)
REQUEST_ID=$(echo $RESPONSE | jq -r '.data.id')
if [ "$REQUEST_ID" != "null" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Food request created"
  echo "  Request ID: $REQUEST_ID"
else
  echo -e "${RED}✗ FAILED${NC} - Failed to create food request"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 10: Get Restaurant Requests
echo "TEST 10: Get Restaurant Requests"
RESPONSE=$(curl -X GET "$API_URL/requests/restaurant?status=PENDING" \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -s)
REQUESTS_COUNT=$(echo $RESPONSE | jq '.data | length')
if [ "$REQUESTS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Retrieved $REQUESTS_COUNT pending requests"
else
  echo -e "${YELLOW}⚠ WARNING${NC} - No pending requests found"
fi
echo ""

# Test 11: Approve Request (Restaurant)
echo "TEST 11: Approve Request (Restaurant only)"
PICKUP_DATE=$(date -u -d "+1 day" +"%Y-%m-%dT18:00:00Z")
RESPONSE=$(curl -X PUT "$API_URL/requests/$REQUEST_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -d "{\"status\":\"APPROVED\",\"pickupDate\":\"$PICKUP_DATE\"}" \
  -s)
REQUEST_STATUS=$(echo $RESPONSE | jq -r '.data.status')
if [ "$REQUEST_STATUS" = "APPROVED" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Request approved successfully"
else
  echo -e "${RED}✗ FAILED${NC} - Failed to approve request"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 12: Get My Requests (User)
echo "TEST 12: Get My Requests (User)"
RESPONSE=$(curl -X GET "$API_URL/requests/my" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -s)
USER_REQUESTS_COUNT=$(echo $RESPONSE | jq '.data | length')
if [ "$USER_REQUESTS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Retrieved $USER_REQUESTS_COUNT requests for user"
else
  echo -e "${YELLOW}⚠ WARNING${NC} - No requests found for user"
fi
echo ""

# Test 13: Update Food Listing (Restaurant)
echo "TEST 13: Update Food Listing (Restaurant only)"
RESPONSE=$(curl -X PUT "$API_URL/food/$FOOD_LISTING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RESTAURANT_TOKEN" \
  -d '{"quantity":15,"status":"AVAILABLE"}' \
  -s)
UPDATED_QUANTITY=$(echo $RESPONSE | jq -r '.data.quantity')
if [ "$UPDATED_QUANTITY" = "15" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Food listing updated successfully"
else
  echo -e "${RED}✗ FAILED${NC} - Failed to update food listing"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 14: Zod Validation - Missing Fields
echo "TEST 14: Zod Validation - Missing Restaurant Name"
RESPONSE=$(curl -X POST $API_URL/auth/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"pass123"}' \
  -s)
ERROR_MESSAGE=$(echo $RESPONSE | jq -r '.message')
if [[ "$ERROR_MESSAGE" == *"Restaurant name"* ]] || [[ "$ERROR_MESSAGE" == *"required"* ]]; then
  echo -e "${GREEN}✓ PASSED${NC} - Validation error caught: $ERROR_MESSAGE"
else
  echo -e "${RED}✗ FAILED${NC} - Validation not working properly"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 15: Zod Validation - Invalid Email
echo "TEST 15: Zod Validation - Invalid Email"
RESPONSE=$(curl -X POST $API_URL/auth/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"securePass123","restaurantName":"Test","address":"123 St","phone":"+1234567890"}' \
  -s)
ERROR_MESSAGE=$(echo $RESPONSE | jq -r '.message')
if [[ "$ERROR_MESSAGE" == *"email"* ]] || [[ "$ERROR_MESSAGE" == *"Invalid"* ]]; then
  echo -e "${GREEN}✓ PASSED${NC} - Email validation working: $ERROR_MESSAGE"
else
  echo -e "${RED}✗ FAILED${NC} - Email validation not working"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 16: Authorization - User tries to create food listing
echo "TEST 16: Authorization - User cannot create food listing"
RESPONSE=$(curl -X POST $API_URL/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{\"title\":\"Invalid\",\"description\":\"Should fail\",\"quantity\":10,\"unit\":\"items\",\"expiryDate\":\"$EXPIRY_DATE\",\"pickupTime\":\"5PM\"}" \
  -s)
SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "false" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - User correctly denied from creating food listing"
else
  echo -e "${RED}✗ FAILED${NC} - Authorization not working properly"
fi
echo ""

echo "======================================"
echo "Test Suite Complete!"
echo "======================================"
