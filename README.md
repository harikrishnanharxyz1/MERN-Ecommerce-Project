# FASTBUY - Full-Stack MERN E-Commerce Platform

A modern, full-stack E-commerce web application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS, JWT authentication, and a clean RESTful API architecture.

---

## 📁 Project Architecture & Structure

```text
e-commerce/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── ensureAdmin.js        # Environment-provisioned administrator
│   ├── controllers/
│   │   ├── authController.js     # User registration, login & profile
│   │   ├── cartController.js     # Cart items, update, remove & sync
│   │   ├── orderController.js    # Order creation, history & status
│   │   ├── adminController.js    # Dashboard, catalog, customers & categories
│   │   ├── offerController.js    # Offers and coupon validation
│   │   ├── productController.js  # Product listing, search, filter & admin CRUD
│   │   └── supportController.js # Customer support tickets and replies
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protection & Admin authorization
│   │   └── errorMiddleware.js    # 404 & Centralized error handler
│   ├── models/
│   │   ├── Cart.js               # Cart Mongoose schema
│   │   ├── Order.js              # Order Mongoose schema
│   │   ├── Product.js            # Product Mongoose schema
│   │   ├── Category.js           # Product categories
│   │   ├── Offer.js              # Discounts and coupons
│   │   ├── SupportTicket.js      # Customer enquiries and replies
│   │   └── User.js               # User schema with bcrypt password hashing
│   ├── public/
│   │   └── images/               # Static product images served by Express
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── cartRoutes.js         # /api/cart
│   │   ├── orderRoutes.js        # /api/orders
│   │   ├── adminRoutes.js        # /api/admin
│   │   ├── offerRoutes.js        # /api/offers
│   │   ├── productRoutes.js      # /api/products
│   │   └── supportRoutes.js      # /api/support
│   ├── utils/
│   │   ├── generateToken.js      # JWT token generator
│   │   └── seeder.js             # Catalog seeder and environment-based admin setup
│   ├── .env                      # Environment variables
│   ├── .env.example              # Example environment configuration
│   ├── package.json              # Backend dependencies & npm scripts
│   └── server.js                 # Express application entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # Frontend API client communicating with backend
│   │   ├── assets/               # Product image assets & definitions
│   │   ├── components/
│   │   │   ├── footer.jsx        # Footer component
│   │   │   ├── navbar.jsx        # Navigation header with active auth state
│   │   │   ├── product-card.jsx  # Reusable product card
│   │   │   └── section-title.jsx # Reusable typography headings
│   │   ├── context/
│   │   │   ├── shop-context.js   # React Context definition
│   │   │   ├── shop-provider.jsx # Dynamic global store (products, auth, cart, orders)
│   │   │   └── use-shop.js       # Custom React hook for context access
│   │   ├── pages/
│   │   │   ├── about.jsx         # About us page
│   │   │   ├── cart.jsx          # Shopping bag & checkout navigation
│   │   │   ├── collection.jsx    # Filterable & searchable product catalog
│   │   │   ├── contact.jsx       # Contact page
│   │   │   ├── home.jsx          # Hero banner & bestsellers showcase
│   │   │   ├── login.jsx         # User authentication (Sign in & Registration)
│   │   │   ├── orders.jsx        # Real-time order history tracking
│   │   │   ├── placeorder.jsx    # Checkout delivery details & order placement
│   │   │   └── product.jsx       # Product detail view with size & quantity selection
│   │   ├── utils/
│   │   │   └── image-helper.js   # Dynamic image resolver for local and backend assets
│   │   ├── App.jsx               # Application routes
│   │   ├── main.jsx              # React 19 root
│   │   └── index.css             # Tailwind CSS styles
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; v20+ / v26 compatible)
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud database)
- **npm** (comes with Node.js)

---

### 2. Backend Setup & Configuration

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://127.0.0.1:27017/fastbuy_ecommerce
   JWT_SECRET=<private random value, at least 32 characters>
   ADMIN_NAME=Store Administrator
   ADMIN_EMAIL=admin@fastbuy.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=FastbuyAdmin123!
   NODE_ENV=development
   ```
   Generate a private JWT secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Keep it and the administrator variables in `backend/.env`; never commit or expose them. The default credentials below are for local development.
   > **Note:** If using MongoDB Atlas, replace `MONGO_URI` with your connection string:
   > `mongodb+srv://<username>:<password>@cluster0.mongodb.net/fastbuy_ecommerce?retryWrites=true&w=majority`

4. Seed the initial catalog and provision the administrator from the environment:
   ```bash
   npm run seed
   ```
   *The seed script adds missing catalog items without deleting customer accounts, orders, or carts. The administrator is created from the private `ADMIN_*` values and its password is bcrypt-hashed.*

5. Start the backend server:
   - For production / standard start:
     ```bash
     npm start
     ```
   - For development with auto-reload (nodemon):
     ```bash
     npm run dev
     ```
   The backend server will run on `http://localhost:5000`. If `ADMIN_*` values are omitted, the local defaults are used; set them explicitly for deployment.

---

### 3. Frontend Setup & Configuration

1. In a new terminal window, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

---

## 🔐 Admin Portal

Open `http://localhost:5173/admin` and sign in with administrator email `admin@fastbuy.com` or username `admin`, and password `FastbuyAdmin123!`. These defaults can be overridden with `ADMIN_*` values in `backend/.env`. The dashboard reads its statistics and records from MongoDB and supports product/category management, coupons, orders, customers, and customer-support replies.

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `POST` | `/api/auth/admin/login` | Public | Authenticate configured administrator; sets an HttpOnly cookie |
| `POST` | `/api/auth/admin/logout` | Public | Clear administrator session cookie |
| `GET` | `/api/auth/profile` | Private (User) | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private (User) | Update user profile details / password |

### 📦 Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Get all products with query filtering (`?category=...&search=...&sort=...&bestseller=...`) |
| `GET` | `/api/products/categories` | Public | Get distinct product categories |
| `GET` | `/api/products/:id` | Public | Get single product by numeric ID or MongoDB `_id` |
| `POST` | `/api/products` | Private (Admin) | Create a new product |
| `PUT` | `/api/products/:id` | Private (Admin) | Update an existing product |
| `DELETE`| `/api/products/:id` | Private (Admin) | Delete a product |

### 🛒 Shopping Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Private (User) | Get user's cart items from MongoDB |
| `POST` | `/api/cart` | Private (User) | Add or increment item in cart (`productId`, `size`, `quantity`) |
| `PUT` | `/api/cart` | Private (User) | Update item quantity in cart |
| `DELETE`| `/api/cart/:productId/:size` | Private (User) | Remove specific item size from cart |
| `DELETE`| `/api/cart` | Private (User) | Clear entire cart |
| `POST` | `/api/cart/sync` | Private (User) | Sync local guest cart items on login |

### 🧾 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Public / User | Place an order (`customer`, `items`); prices and coupons are verified by the server |
| `GET` | `/api/orders` | Private (User) | Get order history for the authenticated customer |
| `GET` | `/api/orders/:id` | Private (Owner) | Get order details for its authenticated customer |
| `GET` | `/api/orders/admin/all` | Private (Admin) | View all customer orders |
| `PUT` | `/api/orders/:id/status` | Private (Admin) | Update order status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) |

### 🧰 Administration, Offers & Support
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Private (Admin) | Dashboard totals, revenue, pending orders and low stock |
| `GET` | `/api/admin/products` | Private (Admin) | List and search products |
| `POST` / `PUT` / `DELETE` | `/api/products` and `/api/products/:id` | Private (Admin) | Create, update or delete products |
| `POST` | `/api/admin/product-images` | Private (Admin) | Upload a product image |
| `GET` / `POST` / `PUT` | `/api/admin/categories` | Private (Admin) | List, create or rename categories |
| `DELETE` | `/api/admin/categories/:name` | Private (Admin) | Delete a category after confirming or reassigning its products |
| `GET` | `/api/admin/customers` | Private (Admin) | Search customers and view order summaries without passwords |
| `GET` / `POST` | `/api/admin/offers` | Private (Admin) | List or create offers and coupon codes |
| `PUT` / `DELETE` | `/api/admin/offers/:id` | Private (Admin) | Update or delete an offer |
| `DELETE` | `/api/admin/offers/expired` | Private (Admin) | Delete expired offers |
| `GET` / `PUT` | `/api/admin/support` | Private (Admin) | Review tickets and save status updates/replies |
| `POST` | `/api/offers/validate` | Public | Validate a coupon at checkout |
| `GET` | `/api/offers/active` | Public | List active offers |
| `POST` | `/api/support` | Public | Submit a support enquiry |
| `GET` | `/api/support/:id` | Public | Track a ticket by ID and matching email |

### 🩺 Health & Diagnostic
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status check returning `{ status: 'ok' }` |
| `GET` | `/` | Root verification route |

---

## 💡 Key Full-Stack Features

1. **Dynamic Catalog**:
   - Products are fetched dynamically from MongoDB while preserving high-performance fallback caching so the UI remains uninterrupted.
   - Real-time search by keywords and dynamic category filtering.
   - Multi-option sorting (Featured, Newest, Price: Low to High, Price: High to Low).

2. **Cart & Guest Continuity**:
   - Guest visitors can freely add items, select sizes (S/M/L/XL or One size), and adjust quantities.
   - When guests log in or register, their local cart automatically syncs with their persistent MongoDB cart.

3. **Secure Authentication**:
   - Password encryption using salted `bcryptjs` hashing.
   - Customer JWT tokens use bearer authentication; admin JWT sessions use an HttpOnly, SameSite cookie.
   - Admin APIs remain locked unless the configured administrator identity and password are valid.

4. **Order Placement & History**:
   - Integrated delivery and contact form at checkout.
   - Calculation of subtotal, free shipping threshold (orders over ₹1,499 qualify for free shipping), and order total.
   - Real-time order placement to MongoDB and immediate order tracking in Order History.
