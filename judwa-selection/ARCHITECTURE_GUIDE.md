# JUDWA SELECTION - Architecture & Integration Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Customer Web Browser                        │
│                   (Next.js 14 App)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
        ┌─────▼──────┐   │   ┌──────▼──────┐
        │localStorage│   │   │Razorpay SDK │
        │(Cart,      │   │   │(Payments)   │
        │Wishlist)   │   │   └──────┬──────┘
        └────────────┘   │          │
                         │
                    ┌────▼──────────▼────┐
                    │  Next.js API Routes│
                    │  /api/*            │
                    └────┬──────────┬────┘
                         │          │
              ┌──────────┘          └──────────┐
              │                                 │
         ┌────▼────────┐            ┌──────────▼──────┐
         │ Supabase    │            │ Razorpay API    │
         │ PostgreSQL  │            │ (Production)    │
         │ + RLS       │            └─────────────────┘
         │ + Storage   │
         └─────────────┘
```

---

## Data Flow Diagrams

### 1. Product Browsing Flow

```
User Access
    │
    ├─→ Homepage (/)
    │   └─→ Fetches: getProducts(8), getCategories()
    │       └─→ Displays featured products & categories
    │
    ├─→ Products Page (/products)
    │   └─→ Fetches: getProducts(limit, offset, filters)
    │       └─→ Apply filters: category, sort
    │
    └─→ Product Detail (/product/[slug])
        └─→ Fetches: getProductBySlug(slug), getProductVariants(id)
            └─→ Display: images, variants, pricing, reviews
```

### 2. Shopping Cart Flow

```
Add to Cart
    │
    └─→ Product Detail Page
        └─→ Select variant (size, color)
        └─→ Choose quantity
        └─→ Click "Add to Cart"
            └─→ Save to localStorage: judwa_cart
            └─→ Show toast notification
            └─→ Update badge count in Header
    │
    └─→ Cart Page (/cart)
        └─→ Load items from localStorage
        └─→ Display items with quantities
        └─→ Apply promo codes (local validation)
        └─→ Calculate totals (subtotal + shipping - discount)
        └─→ Proceed to Checkout
```

### 3. Checkout & Payment Flow

```
Checkout Process
    │
    ├─→ Step 1: Address Selection
    │   ├─→ Load saved addresses from localStorage
    │   ├─→ Add new address with validation
    │   └─→ Select delivery address
    │
    ├─→ Step 2: Shipping Method
    │   ├─→ Standard: Free (>₹999), ₹50 (<₹999), 3-5 days
    │   └─→ Express: ₹100, 1-2 days
    │
    ├─→ Step 3: Payment Method
    │   ├─→ COD: Cash on Delivery (₹100 charge)
    │   └─→ Online: Razorpay (Cards, UPI, Wallets)
    │
    └─→ Place Order
        ├─→ API: POST /api/orders
        │   ├─→ Create order record
        │   ├─→ Reduce product stock
        │   └─→ Return order_id & order_number
        │
        ├─→ If Payment = Online
        │   ├─→ Open Razorpay modal
        │   ├─→ User completes payment
        │   └─→ Razorpay returns: payment_id, signature
        │       └─→ API: POST /api/payments/verify
        │           ├─→ Verify HMAC signature
        │           ├─→ Update order payment_status → 'completed'
        │           └─→ Create payment record
        │
        ├─→ Clear localStorage cart & addresses
        └─→ Redirect to /order-confirmation/[orderNumber]
            └─→ Fetch order details via API
            └─→ Display confirmation with tracking
```

### 4. Admin Management Flow

```
Admin Dashboard
    │
    ├─→ Products Management
    │   ├─→ List Products: GET /api/products
    │   ├─→ Search & Filter
    │   ├─→ Add Product: POST /api/products
    │   ├─→ Edit Product: PUT /api/products/[id]
    │   └─→ Delete Product: DELETE /api/products/[id]
    │
    ├─→ Orders Management
    │   ├─→ List Orders: GET /api/orders
    │   ├─→ Search & Filter by status
    │   ├─→ View Order Details
    │   └─→ Update Order Status: PUT /api/orders/[id]
    │
    ├─→ Customers Management
    │   ├─→ List Customers: GET /api/customers
    │   ├─→ Search Customers
    │   └─→ View Customer Details & History
    │
    └─→ Analytics (Phase 3)
        ├─→ Sales Charts
        ├─→ Revenue Trends
        └─→ Inventory Status
```

---

## Database Entity Relationships

### Core Entities

```
CUSTOMERS
├─→ id (UUID primary key)
├─→ email
├─→ phone
├─→ name
└─→ created_at

CATEGORIES
├─→ id
├─→ name
├─→ slug
├─→ description
└─→ image_url

PRODUCTS
├─→ id
├─→ category_id (FK → CATEGORIES)
├─→ name
├─→ slug
├─→ sku
├─→ description
├─→ mrp (list price)
├─→ selling_price
├─→ is_active
└─→ created_at

PRODUCT_VARIANTS
├─→ id
├─→ product_id (FK → PRODUCTS)
├─→ size
├─→ color
├─→ sku_variant
├─→ stock
└─→ selling_price

ADDRESSES
├─→ id
├─→ customer_id (FK → CUSTOMERS)
├─→ full_name
├─→ phone
├─→ address_line1
├─→ city
├─→ state
├─→ pincode
└─→ is_default

ORDERS
├─→ id
├─→ customer_id (FK → CUSTOMERS)
├─→ order_number (unique)
├─→ total_amount
├─→ shipping_cost
├─→ order_status (enum)
├─→ payment_method
├─→ payment_status (enum)
└─→ created_at

ORDER_ITEMS
├─→ id
├─→ order_id (FK → ORDERS)
├─→ variant_id (FK → PRODUCT_VARIANTS)
├─→ quantity
└─→ total_price

PAYMENTS
├─→ id
├─→ order_id (FK → ORDERS)
├─→ razorpay_order_id
├─→ razorpay_payment_id
├─→ amount
├─→ status
└─→ created_at

WISHLISTS
├─→ id
├─→ customer_id (FK → CUSTOMERS)
├─→ product_id (FK → PRODUCTS)
└─→ created_at
```

---

## API Route Specifications

### Orders API

#### POST /api/orders
**Create a new order**

Request Body:
```json
{
  "items": [
    {
      "variant_id": "uuid",
      "quantity": 2,
      "selling_price": 999
    }
  ],
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "9999999999",
  "delivery_address": "123 Main St, City, State 123456",
  "payment_method": "cod|razorpay",
  "total_amount": 2998,
  "shipping_cost": 0
}
```

Response:
```json
{
  "id": "order-uuid",
  "order_number": "JW20240101001",
  "total_amount": 2998,
  "razorpay_order_id": "order_xxxxx" // if payment_method = razorpay
}
```

#### GET /api/orders?orderId=X or orderNumber=X or userId=X
**Retrieve order details**

Response:
```json
{
  "id": "order-uuid",
  "order_number": "JW20240101001",
  "customer_name": "John Doe",
  "order_items": [
    {
      "id": "item-uuid",
      "product_variant": {
        "id": "variant-uuid",
        "product": { "id": "...", "name": "..." },
        "size": "M",
        "color": "Blue"
      },
      "quantity": 2,
      "total_price": 1998
    }
  ],
  "order_status": "pending",
  "payment_status": "completed",
  "created_at": "2024-01-01T12:00:00"
}
```

### Payments API

#### POST /api/payments/verify
**Verify Razorpay payment**

Request Body:
```json
{
  "orderId": "order-uuid",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_hash"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "id": "order-uuid",
    "payment_status": "completed"
  }
}
```

---

## Frontend State Management

### localStorage Schema

#### Cart (judwa_cart)
```json
[
  {
    "id": "product-variant-combo",
    "product_id": "uuid",
    "variant_id": "uuid",
    "product_name": "T-Shirt Blue",
    "size": "M",
    "color": "Blue",
    "selling_price": 499,
    "quantity": 2
  }
]
```

#### Wishlist (judwa_wishlist)
```json
[
  {
    "id": "product-uuid",
    "name": "T-Shirt Blue",
    "slug": "tshirt-blue",
    "selling_price": 499,
    "mrp": 999,
    "category": { "name": "Boys" }
  }
]
```

#### Addresses (judwa_addresses)
```json
[
  {
    "fullName": "John Doe",
    "phone": "9999999999",
    "email": "john@example.com",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4",
    "city": "Himatnagar",
    "state": "Gujarat",
    "pincode": "383001",
    "isDefault": true
  }
]
```

---

## Component Hierarchy

```
App (Root)
├── Header (Persistent)
│   ├── Logo & Navigation
│   ├── Search Bar
│   └── Cart & Wishlist Icons (Dynamic Badges)
├── Main Page Router
│   ├── Home Page
│   ├── Products Page
│   ├── Product Detail Page
│   ├── Cart Page
│   ├── Checkout Page (Multi-step)
│   ├── Order Confirmation Page
│   ├── Wishlist Page
│   └── Admin Routes
│       ├── Dashboard
│       ├── Products Management
│       ├── Orders Management
│       └── Customers Management
└── Footer (Persistent)
    ├── Newsletter Signup
    ├── Links
    └── Contact Info
```

---

## Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or production URL)
NEXT_PUBLIC_STORE_NAME=JUDWA SELECTION
NEXT_PUBLIC_STORE_PHONE=+91 9104128259
```

---

## Security Implementation Checklist

### Current Implementation ✅
- Row-Level Security (RLS) policies on sensitive tables
- Server-side payment verification with HMAC
- Environment variables for secrets
- Service role key for admin operations

### Recommended Enhancements 🔄
- User authentication (Supabase Auth)
- Session management
- CSRF protection
- Rate limiting on API routes
- Input sanitization and validation
- SQL injection prevention (parameterized queries)
- XSS protection
- Content Security Policy headers

### Production Readiness ⚠️
- Razorpay production account setup
- Email notification service (SendGrid/Resend)
- SMS gateway (Twilio/AWS SNS)
- CDN for image delivery
- Database backups & monitoring
- Error tracking (Sentry)
- Analytics tracking
- SSL certificate

---

## Performance Optimization Strategies

### Frontend
- ✅ Next.js Image optimization
- ✅ Code splitting (dynamic imports)
- ✅ Lazy loading components
- 🔄 Implement infinite scroll for products
- 🔄 Optimize bundle size

### Backend
- ✅ Efficient database queries with indexes
- 🔄 API response caching
- 🔄 Database connection pooling
- 🔄 GraphQL implementation (alternative to REST)

### Infrastructure
- ✅ Vercel deployment (serverless)
- ✅ Supabase database
- 🔄 CDN for static assets
- 🔄 Caching strategy (Redis)

---

## Error Handling Strategy

### Client-Side
```javascript
try {
  // API call
} catch (error) {
  toast.error('User-friendly message');
  console.error(error); // For debugging
}
```

### Server-Side
```javascript
try {
  // Database operation
} catch (error) {
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

### User Feedback
- Toast notifications for all actions
- Loading states during async operations
- Error messages with actionable guidance
- Retry mechanisms for failed requests

---

## Testing Strategy (Phase 3)

### Unit Tests
- Utility functions (calculateCartTotals, formatINR, etc.)
- Component rendering
- State management

### Integration Tests
- Cart operations (add, remove, update)
- Checkout flow
- Order creation and payment verification

### E2E Tests
- Complete user journey (browse → cart → checkout → payment)
- Admin workflows
- Edge cases and error scenarios

### Performance Tests
- Lighthouse scores
- Core Web Vitals
- Database query performance

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Razorpay production account setup
- [ ] Email service configured
- [ ] CDN setup for images
- [ ] SSL certificate configured
- [ ] Database backups scheduled
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Performance optimization done
- [ ] Staging environment tested
- [ ] Production deployment plan ready

---

## Support & Documentation

**Documentation Files**
- `README.md` - Setup and overview
- `IMPLEMENTATION_GUIDE.md` - Developer guide
- `PHASE_2_COMPLETE.md` - Phase 2 features
- `ARCHITECTURE_GUIDE.md` - This file

**Contact**
- Email: info@judwaselection.com
- Phone: +91 9104128259

**Development Team**
- Developer: AI Assistant
- Status: Active Development
- Last Update: 2024

---

**Version**: 2.0 (Phase 2 Complete)
**Status**: Production-Ready (Core Features)
**Next Phase**: Analytics & Advanced Admin Features
