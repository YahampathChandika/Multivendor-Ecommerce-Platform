# FashionHub - Multivendor E-commerce Platform

A modern, production-grade e-commerce platform built with Next.js, React, and TypeScript. This project demonstrates a complete multivendor marketplace with authentication, cart management, order processing, and responsive design.

## 🔗 Live Demo & Resources

- **🌐 Live Application:** [https://mvc-platform.vercel.app/](https://mvc-platform.vercel.app/)
- **📹 Demo Video:** [https://screenrec.com/share/0Vn4bpGS3z](https://screenrec.com/share/0Vn4bpGS3z)
- **💻 GitHub Repository:** [https://github.com/YahampathChandika/Multivendor-Ecommerce-Platform](https://github.com/YahampathChandika/Multivendor-Ecommerce-Platform)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Design Decisions](#-design-decisions)
- [Trade-offs](#-trade-offs)

## ✨ Features

### Frontend Features
- **🏠 Landing Page:** Hero section with featured products and call-to-action
- **🔍 Product Exploration:** Grid layout with category filters (All, Men, Women, Kids, Other)
- **📱 Responsive Design:** Mobile-first approach with seamless desktop experience
- **🛍️ Product Details:** Large images, size/color selection, add to cart functionality
- **🛒 Shopping Cart:** Real-time updates, quantity management, item removal
- **💳 Checkout Process:** Address selection, payment method simulation, order confirmation
- **📦 Order Management:** Order history, status tracking, detailed order views
- **🔐 Authentication:** Google OAuth integration with session management
- **🔒 Protected Routes:** Client and server-side route protection

### Backend Features
- **🗄️ Database Integration:** Supabase PostgreSQL with Row Level Security (RLS)
- **🔌 RESTful API:** Complete CRUD operations for products, cart, and orders
- **🔑 Authentication:** Supabase Auth with Google OAuth provider
- **📊 Type Safety:** Full TypeScript implementation with strict type checking
- **🛡️ Security:** Server-side validation and protected API routes
- **📄 Pagination:** Efficient product listing with pagination support
- **🔍 Search & Filtering:** Product search and category-based filtering

## 🛠 Tech Stack

### Required Technologies (As Specified)
- **React v19.1** - Modern React with latest features
- **Next.js v15.3.5** - Full-stack React framework with App Router
- **TypeScript v5.8** - Type-safe JavaScript development
- **Tailwind CSS v4.1** - Utility-first CSS framework
- **CSS Grid & Flexbox** - Modern layout techniques
- **Next.js API Routes** - Server-side logic and database operations

### Additional Technologies (Chosen)
- **Supabase** - Backend-as-a-Service for database and authentication
- **PostgreSQL** - Relational database via Supabase
- **Google OAuth** - Authentication provider
- **Vercel** - Deployment platform
- **Jest & Testing Library** - Testing framework
- **ESLint** - Code linting
- **Zustand** - State management
- **Lucide React** - Icon library

## 🏗 Architecture

### Frontend Architecture
```
app/
├── (auth)/           # Authentication pages (login)
├── cart/            # Shopping cart functionality
├── checkout/        # Checkout process
├── explore/         # Product discovery
├── orders/          # Order management
├── products/        # Product details
└── api/             # Next.js API routes
```

### State Management
- **Zustand Store:** Global authentication state
- **React State:** Component-level state management
- **Server State:** API data fetching and caching

### Database Schema
```sql
-- Core entities
users (id, email, full_name, avatar_url)
vendors (id, name, email, description, logo_url)
products (id, title, price, images, sizes, colors, category)
cart_items (user_id, product_id, quantity, selected_size, selected_color)
orders (id, user_id, total_amount, status, shipping_address)
order_items (order_id, product_id, quantity, unit_price)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm/yarn/pnpm** - Package manager
- **Git** - Version control
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Google Cloud Account** - For OAuth setup

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/YahampathChandika/Multivendor-Ecommerce-Platform.git
cd Multivendor-Ecommerce-Platform

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Environment Setup below)
cp .env.sample .env.local

# 4. Set up database (see Database Setup below)

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for project initialization (2-3 minutes)
4. Go to **Settings > API** to get your keys

### 2. Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

### 3. Set up Supabase Authentication
1. In Supabase Dashboard, go to **Authentication > Settings**
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 4. Environment Variables
Create `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Security Note:** Never commit `.env.local` to version control. The `.env.sample` file serves as a template.

## 🗄️ Database Setup

### 1. Run Database Migrations
Copy and execute the SQL schema in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (see supabase.sql file for complete schema)
-- Users, vendors, products, cart_items, orders, order_items
```

### 2. Set up Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Add security policies (see supabase.sql for complete policies)
```

### 3. Seed Sample Data (Optional)
```bash
# Upload sample images to Supabase Storage
npm run upload-images

# Seed products and vendors
npm run seed-tshirts

# Or run both commands
npm run setup-tshirt-store
```

## 💻 Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # Run tests for CI/CD

# Database
npm run seed         # Seed sample products
npm run upload-images # Upload sample images
npm run seed-tshirts # Seed t-shirt products
```

### Development Workflow
1. **Start development server:** `npm run dev`
2. **Make changes** to components/pages
3. **Run tests:** `npm test`
4. **Check types:** `npm run build`
5. **Lint code:** `npm run lint`

### Code Quality
- **TypeScript strict mode** enabled
- **ESLint** for code linting
- **Prettier** for code formatting (configured in ESLint)
- **Husky** pre-commit hooks (if configured)

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/       # Component unit tests
├── lib/             # Utility function tests
├── pages/           # Page integration tests
└── api/             # API route tests
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test auth-button.test.tsx
```

### Test Coverage
- **Unit Tests:** Component logic, utility functions, validation
- **Integration Tests:** API routes, authentication flow
- **Coverage Target:** 80%+ for critical business logic

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables:**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

3. **Update Supabase Settings:**
   - Add production domain to allowed origins
   - Update Google OAuth redirect URIs

### Alternative Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
out
```

#### Railway
```bash
# Dockerfile included for containerized deployment
docker build -t fashionhub .
```

#### Environment Variables for Production
Ensure these are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📚 API Documentation

### Products
```typescript
GET /api/products
Query params: ?category=men&page=1&limit=12&search=shirt

GET /api/products/[id]
Returns: Product details with vendor information
```

### Cart Management
```typescript
GET /api/cart
Returns: User's cart items with product details

POST /api/cart
Body: { product_id, quantity, selected_size?, selected_color? }
```

### Order Processing
```typescript
POST /api/orders
Body: { shipping_address, payment_method }
Returns: Created order with order number

GET /api/orders/[id]
Returns: Order details with items and status
```

### Authentication
- **Login:** Handled by Supabase Auth
- **Logout:** Client-side auth.signOut()
- **Session:** Automatic refresh via middleware

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   ├── cart/              # Cart pages
│   ├── checkout/          # Checkout flow
│   ├── explore/           # Product discovery
│   ├── orders/            # Order management
│   ├── products/          # Product details
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── cart/             # Cart-related components
│   ├── layout/           # Layout components
│   ├── products/         # Product components
│   └── ui/               # UI primitives
├── lib/                  # Utilities and configurations
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── supabase/         # Supabase client
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── __tests__/            # Test files
├── public/               # Static assets
└── scripts/              # Database seeding scripts
```

## 🤔 Design Decisions

### Technology Choices

**Supabase over Traditional Backend:**
- **Pros:** Rapid development, built-in auth, real-time capabilities, PostgreSQL
- **Cons:** Vendor lock-in, less control over infrastructure
- **Decision:** Chosen for development speed and production-ready features

**Google OAuth over Email/Password:**
- **Pros:** Better UX, no password management, trusted provider
- **Cons:** Dependency on Google, less control
- **Decision:** Prioritized user experience and security

**Zustand over Redux:**
- **Pros:** Minimal boilerplate, TypeScript friendly, simple API
- **Cons:** Less ecosystem, fewer dev tools
- **Decision:** Adequate for project scope, better developer experience

**Tailwind CSS over CSS Modules:**
- **Pros:** Rapid styling, consistent design system, smaller bundle
- **Cons:** Learning curve, HTML verbosity
- **Decision:** Matches project requirements and speeds development

### Architecture Decisions

**App Router over Pages Router:**
- Latest Next.js features and better performance
- Server Components for better SEO and loading

**TypeScript Strict Mode:**
- Catch errors early, better maintainability
- Slight development overhead for better long-term quality

**Component-First Design:**
- Reusable UI components using shadcn/ui
- Consistent design system across the application

## ⚖️ Trade-offs

### Performance vs Development Speed
- **Choice:** Prioritized development speed with production-ready defaults
- **Trade-off:** Some optimization opportunities left for future iterations
- **Mitigation:** Used Next.js built-in optimizations, Image component, etc.

### Feature Completeness vs Code Quality
- **Choice:** Balanced feature completeness with clean, maintainable code
- **Trade-off:** Some advanced features (wishlist, reviews) not implemented
- **Rationale:** Met all assignment requirements with room for extension

### Flexibility vs Simplicity
- **Choice:** Simple, straightforward implementation
- **Trade-off:** Less configuration options, opinionated structure
- **Benefit:** Easier to understand, maintain, and extend

### Real-time vs Simplicity
- **Choice:** Standard HTTP requests over WebSocket/real-time updates
- **Trade-off:** Cart updates not real-time across tabs
- **Rationale:** Assignment didn't require real-time, keeps complexity low

## 🐛 Troubleshooting

### Common Issues

**"Invalid API key" Error:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Ensure .env.local exists and has correct values
```

**Authentication Failed:**
```bash
# Verify Google OAuth setup
# Check redirect URIs match exactly
# Ensure Supabase Auth settings are correct
```

**Database Connection Issues:**
```bash
# Check Supabase project is active
# Verify RLS policies are set up
# Check network connectivity
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Getting Help
- **GitHub Issues:** [Report bugs or request features](https://github.com/YahampathChandika/Multivendor-Ecommerce-Platform/issues)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)

## 📄 License

This project is created for educational and demonstration purposes. Feel free to use it as a reference for your own projects.

## 🙏 Acknowledgments

- **Assignment Provider** for the comprehensive requirements
- **Vercel** for excellent deployment platform
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful UI components
- **Lucide** for consistent iconography

---

**Built with ❤️ by Yahampath Chandika** | **[Live Demo](https://mvc-platform.vercel.app/)** | **[Watch Demo Video](https://screenrec.com/share/0Vn4bpGS3z)**
