# 🎨 Frontend Documentation

Complete documentation for the Food Waste Reduction Platform frontend built with React and Vite.

## 📚 Documentation Files

### Quick Start
- **[00_START_HERE.md](./00_START_HERE.md)** - Start here! Overview of all documentation
- **[AUTH_QUICK_SUMMARY.md](./AUTH_QUICK_SUMMARY.md)** - Quick authentication summary

### Understanding Authentication
- **[AUTH_AND_STATE_GUIDE.md](./AUTH_AND_STATE_GUIDE.md)** - Complete guide to authentication and state management
- **[AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md)** - Quick reference for auth implementation
- **[AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md)** - Visual diagrams of authentication flows
- **[AUTH_CODE_EXAMPLES.md](./AUTH_CODE_EXAMPLES.md)** - Code examples for common auth patterns
- **[README_AUTH.md](./README_AUTH.md)** - Detailed authentication documentation

### Component Development
- **[COMPONENT_PROPS_MAP.md](./COMPONENT_PROPS_MAP.md)** - Components and their props specification

### Backend Integration
- **[FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)** - How to integrate with backend (API service, examples)
- **[FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md)** - Page-by-page requirements checklist

---

## 🚀 Quick Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📋 What's Here

### By Role

**Frontend Developer?**
1. Read [AUTH_QUICK_SUMMARY.md](./AUTH_QUICK_SUMMARY.md)
2. Read [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
3. Check [FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md) for page requirements
4. Reference [COMPONENT_PROPS_MAP.md](./COMPONENT_PROPS_MAP.md) for UI components

**Building Pages?**
1. Open [FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md)
2. Pick a page from the checklist
3. Reference [COMPONENT_PROPS_MAP.md](./COMPONENT_PROPS_MAP.md) for components
4. Use [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) for API calls

**Need Auth Help?**
1. Read [AUTH_QUICK_SUMMARY.md](./AUTH_QUICK_SUMMARY.md) - 5 minutes
2. Read [AUTH_AND_STATE_GUIDE.md](./AUTH_AND_STATE_GUIDE.md) - Deep dive
3. Check [AUTH_CODE_EXAMPLES.md](./AUTH_CODE_EXAMPLES.md) for examples
4. See [AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md) for visual flows

**Team Lead?**
1. Review [FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md) for scope
2. Check [COMPONENT_PROPS_MAP.md](./COMPONENT_PROPS_MAP.md) for components
3. Plan based on pages and components needed

---

## 🔑 Key Documentation Highlights

### Technology Stack
- React 18+
- Vite for bundling
- TypeScript
- State management (Context API or Redux)
- Authentication with JWT

### Pages to Build
1. **Authentication Pages**
   - Register
   - Login

2. **User Pages**
   - Home/Browse
   - Food Listings
   - My Requests
   - Notifications
   - Profile

3. **Restaurant Pages**
   - Dashboard
   - Create Food Listing
   - Manage Listings
   - View Requests
   - Profile

4. **Admin Pages**
   - Dashboard with Statistics
   - User Management
   - Restaurant Verification
   - Request Monitoring

### Component Structure
- Layout components (Navbar, Footer)
- UI components (Button, Card, Input, Modal, Badge)
- Page components
- Feature components

---

## 📖 Navigation

- [Start with 00_START_HERE.md](./00_START_HERE.md)
- [Go to FE folder README](./README.md) ← You are here
- [Go to BE folder README](../BE/README.md)
- [Go back to docs root](../README.md)

---

## ✅ Completion Status

- ⏳ Layout (Navbar, Footer)
- ⏳ Authentication pages (Register, Login)
- ⏳ User pages (Browse, Requests, Profile)
- ⏳ Restaurant pages (Dashboard, Listings, Requests)
- ⏳ Admin pages (Dashboard, Management)
- ⏳ API integration
- ⏳ State management

**Status: 0% Complete** - See [FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md) for detailed checklist

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Setup API service: Copy from [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
4. ✅ Setup authentication: Follow [AUTH_AND_STATE_GUIDE.md](./AUTH_AND_STATE_GUIDE.md)
5. ✅ Build pages: Use [FRONTEND_BACKEND_REQUIREMENTS.md](./FRONTEND_BACKEND_REQUIREMENTS.md) as checklist
6. ✅ Test integration: Verify with [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)

---

## 📚 API Integration Quick Start

The backend API is at `http://localhost:3000/api/v1` with these endpoints:

**Public Endpoints**
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /food` - List all food
- `GET /restaurants` - List restaurants

**Protected Endpoints**
- `GET /auth/profile` - Get current user
- `POST /requests` - Create food request
- `GET /requests/my` - Get my requests
- And many more...

See [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) for complete details and code examples.

---

**Need help?** Check the relevant documentation file above or see [00_START_HERE.md](./00_START_HERE.md) for guidance
