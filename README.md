# Podikart Backend

This is the backend API for the PodiKart e-commerce platform, built with Node.js, Express, and MongoDB.

## Tech Stack

- **Framework:** Express.js (v5.x)
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer
- **Image Storage:** ImageKit.io
- **Logging:** Morgan

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB (Local or Atlas)
- ImageKit Account (for product images)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI, JWT Secret, and other credentials.

4. Run the application:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Routes

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/verify/:token` - Verify email
- `GET /api/auth/me` - Get current user profile (Private)
- `POST /api/auth/logout` - Logout user (Private)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product details by slug
- `POST /api/products` - Create a new product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category (Admin)

## Health Check
- `GET /` - API status check
