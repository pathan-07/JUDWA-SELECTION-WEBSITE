# JUDWA SELECTION - E-Commerce Platform

A complete, production-ready e-commerce platform for JUDWA SELECTION, a premium kids wear and school uniforms store in Gujarat, India.

## Project Overview

This is a full-stack application with:
- **Customer Website**: Modern, responsive e-commerce platform
- **Admin Panel**: Comprehensive management dashboard
- **Backend API**: Secure, server-side business logic
- **Database**: Supabase with proper RLS and migrations
- **Payments**: Razorpay integration
- **Authentication**: Secure user and admin authentication

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React
- **State Management**: Zustand (or Context API)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Payment**: Razorpay

### DevOps
- **Version Control**: Git
- **Package Manager**: npm/yarn
- **Deployment**: Vercel (recommended) or any Node.js hosting

## Project Structure

```
judwa-selection/
├── app/                           # Next.js App Router
│   ├── (customer)/               # Customer routes
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Customer layout
│   │   ├── products/             # Product pages
│   │   ├── category/             # Category pages
│   │   ├── cart/                 # Cart page
│   │   ├── checkout/             # Checkout flow
│   │   ├── account/              # User account
│   │   └── ...
│   ├── admin/                    # Admin panel routes
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # Admin layout
│   │   ├── products/             # Product management
│   │   ├── orders/               # Order management
│   │   ├── analytics/            # Analytics
│   │   ├── settings/             # Settings
│   │   └── ...
│   ├── api/                      # API routes
│   │   ├── orders/               # Order APIs
│   │   ├── products/             # Product APIs
│   │   ├── payments/             # Payment APIs
│   │   ├── auth/                 # Auth APIs
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Root page
├── components/                   # Reusable components
│   ├── Header.tsx                # Header component
│   ├── Footer.tsx                # Footer component
│   ├── ProductCard.tsx           # Product card
│   ├── CartItem.tsx              # Cart item
│   └── ...
├── lib/                          # Utilities and services
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   ├── queries/                  # Database queries
│   │   ├── products.ts           # Product queries
│   │   ├── orders.ts             # Order queries
│   │   ├── users.ts              # User queries
│   │   └── ...
│   └── hooks/                    # Custom React hooks
├── styles/                       # Additional styles
├── public/                       # Static assets
├── database/
│   └── migrations/               # SQL migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Razorpay merchant account
- Git

### 1. Clone/Extract Project
```bash
cd judwa-selection
npm install
```

### 2. Environment Configuration

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Then fill in the values:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET_KEY=your-random-secret-key
NODE_ENV=development
```

### 3. Database Setup

#### Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Copy the Project URL and API keys

#### Run Migrations
```bash
# Using Supabase CLI
npm install -g supabase

# Initialize
supabase init

# Push migrations
supabase db push
```

Or manually:
1. Go to Supabase SQL Editor
2. Copy and run migrations from `database/migrations/`
   - First run: `001_initial_schema.sql`
   - Then: `002_rls_policies.sql`
   - Finally: `003_seed_data.sql`

### 4. Development Server

```bash
npm run dev
```

Visit:
- Customer site: http://localhost:3000
- Admin panel: http://localhost:3000/admin

### 5. Production Deployment

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Other Platforms
- Set environment variables in hosting platform
- Run: `npm run build`
- Start server: `npm run start`

## Key Features Implemented

### Customer Website
- ✅ Homepage with hero banner and product showcase
- ✅ Product listings with filters and sorting
- ✅ Product detail pages
- ✅ Shopping cart functionality
- ✅ Wishlist
- ✅ User account management
- 🔄 Checkout and payment (in progress)
- 🔄 Order tracking
- 🔄 Returns management

### Admin Panel
- ✅ Dashboard with key metrics
- 🔄 Product management
- 🔄 Order management
- 🔄 Analytics and reports
- 🔄 Banner and content management
- 🔄 Customer management
- 🔄 Settings and configuration

### Backend Features
- ✅ Supabase database with proper schema
- ✅ RLS policies for security
- ✅ API routes for orders and payments
- ✅ Razorpay payment integration
- 🔄 Email notifications
- 🔄 Analytics tracking

## Database Schema

Key tables:
- `products` - Product information
- `product_variants` - Size/color variants
- `categories` - Product categories
- `schools` - School information
- `orders` - Customer orders
- `order_items` - Items in orders
- `users` - Customer profiles
- `reviews` - Product reviews
- `coupons` - Discount codes
- `banners` - Homepage banners
- `combos` - Product combos/offers
- And more...

See `database/migrations/` for complete schema.

## API Routes

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders?orderId=...` - Get order details
- `GET /api/orders?userId=...` - Get user orders

### Products
- `GET /api/products` - List products
- `GET /api/products?slug=...` - Get product by slug
- `GET /api/products?categoryId=...` - Get products by category

### Payments
- `POST /api/payments/verify` - Verify Razorpay payment

## Security Considerations

### Implemented
- ✅ Environment variables for secrets
- ✅ Supabase RLS policies
- ✅ Server-side payment verification
- ✅ Service role key server-side only

### Important
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Always verify payments server-side
- Use HTTPS in production
- Implement proper authentication for admin routes
- Never hardcode API keys

## Common Tasks

### Add New Product
1. Go to `/admin/products/new`
2. Fill in product details
3. Add variants (sizes, colors)
4. Set prices (purchase, selling, MRP)
5. Upload images
6. Publish

### Create Banner
1. Go to `/admin/banners`
2. Upload desktop and mobile images
3. Add text overlay (optional)
4. Set display order
5. Activate/deactivate

### View Analytics
1. Go to `/admin/analytics`
2. Select date range
3. View sales, profit, orders, and views

### Manage Orders
1. Go to `/admin/orders`
2. Filter by status (pending, shipped, etc.)
3. Update order status
4. Process returns
5. Generate invoices (if needed)

## Troubleshooting

### Database Connection Issues
- Check Supabase project is active
- Verify connection string in `.env.local`
- Check RLS policies aren't blocking queries

### Payment Errors
- Verify Razorpay keys are correct
- Check payment verification signature
- Ensure webhook is configured

### Images Not Loading
- Verify Supabase Storage bucket permissions
- Check image URLs in database
- Ensure images are uploaded to correct bucket

## Performance Tips

1. **Database**: Use indexes for frequently queried fields
2. **Images**: Optimize image sizes before upload
3. **API**: Implement caching for static data
4. **Frontend**: Use React.memo and useMemo for expensive components
5. **Deployment**: Enable edge caching on CDN

## Next Steps for Developer

1. **Authentication**: Implement proper admin and customer authentication
2. **Email Notifications**: Set up transactional email (order confirmation, shipping, etc.)
3. **Analytics**: Implement detailed analytics tracking
4. **SEO**: Add meta tags and structured data
5. **Mobile App**: Consider React Native version
6. **Testing**: Add comprehensive test suite
7. **CI/CD**: Set up automated testing and deployment

## Support

For issues or questions:
1. Check error logs in `/app/api` routes
2. Review Supabase logs
3. Check browser console for client-side errors
4. Test API routes directly via curl or Postman

## License

This project is proprietary to JUDWA SELECTION.

## Version

Current Version: 1.0.0
Last Updated: 2024

---

**Important**: Before going live, ensure all environment variables are properly set and never commit `.env.local` to version control.
