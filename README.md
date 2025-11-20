# ERP-ZTN - Enterprise Resource Planning System

A modern fullstack web application built with **React 18 + TypeScript**, **Express.js**, and **PostgreSQL**. Featuring secure JWT authentication with httpOnly cookies, Material UI components, and a complete PERN stack architecture.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org/))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ldanielz/erp-ztn.git
   cd erp-ztn
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   
   Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Configure database credentials in `.env`:
   ```dotenv
   DATABASE_URL=postgres://dbuser:dbPass2025@localhost:5432/erp_ztn
   JWT_SECRET=your-secret-key-here
   ```
   
   Run Prisma migrations and seed:
   ```bash
   npm run migrate
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```
   
   Create `.env.local` from `.env.example` (optional, defaults to localhost:4000):
   ```bash
   cp .env.example .env.local
   ```

### Running Development Servers

Open two terminals:

**Terminal 1 - Backend (Express on port 4000)**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (Vite on port 3000)**
```bash
cd client
npm run dev
```

Access the app at: **http://localhost:3000**

## 📁 Project Structure

```
erp-ztn/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (Login, Register, Dashboard)
│   │   ├── context/        # AuthProvider for state management
│   │   ├── api/            # Axios instance configuration
│   │   ├── assets/         # Styles, images, utilities
│   │   ├── App.tsx         # Main router
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Business logic (auth, users)
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database queries
│   │   ├── middlewares/    # Auth, CORS, error handling
│   │   ├── config/         # Database setup
│   │   └── index.js        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.js         # Initial seed data
│   │   └── migrations/     # Database migrations
│   ├── scripts/            # Utility scripts (create_user.js)
│   ├── .env.example        # Template environment variables
│   └── package.json
│
├── database/               # Database scripts
│   ├── pern_project.sql    # SQL schema
│   └── seed.sql            # Sample data
│
├── docs/                   # Documentation
├── .gitignore
└── README.md
```

## 🔐 Authentication Flow

The app uses **JWT tokens stored in httpOnly cookies** for secure authentication:

1. **Login**: User submits credentials → Server validates → Creates JWT → Sets httpOnly cookie
2. **Protected Routes**: Frontend checks `/api/auth/me` → Cookie automatically sent with request
3. **Logout**: Frontend calls `/api/auth/logout` → Server clears cookie

**Key Features:**
- ✅ httpOnly cookies (prevents XSS attacks)
- ✅ Automatic cookie transmission (no localStorage needed)
- ✅ JWT expiration (7 days default)
- ✅ Secure password hashing (bcrypt)

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user (requires cookie) |
| `POST` | `/api/auth/logout` | Logout user |

**Example: Login**
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"StrongPass123"}'
```

**Example: Get User**
```bash
curl -b cookies.txt http://localhost:4000/api/auth/me
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast development)
- **Material UI** - Component library
- **react-hook-form** - Form management
- **yup** - Schema validation
- **react-router-dom** - Client-side routing
- **axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Prisma** - ORM for database
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie management
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **cors** - Cross-origin handling

## 📋 Database

### Current Schema

**Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Running Migrations

```bash
cd server
# Create a new migration
npm run prisma:dev -- --name migration_name

# Apply migrations
npm run migrate

# View database in Prisma Studio
npx prisma studio
```

## 🧪 Testing

### Manual Testing

Test authentication flow:
```bash
# 1. Register new user
curl -c /tmp/cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test User"}'

# 2. Get current user
curl -b /tmp/cookies.txt http://localhost:4000/api/auth/me

# 3. Logout
curl -b /tmp/cookies.txt -X POST http://localhost:4000/api/auth/logout

# 4. Verify logout (should return 401)
curl -b /tmp/cookies.txt http://localhost:4000/api/auth/me
```

## 📝 Environment Variables

### Backend (server/.env)
```dotenv
PORT=4000
DATABASE_URL=postgres://dbuser:password@localhost:5432/erp_ztn
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (client/.env.local)
```dotenv
VITE_API_BASE_URL=http://localhost:4000
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_BASE_URL` to production API URL
4. Deploy

### Backend (Render, Railway, or Heroku)
1. Set environment variables on hosting platform
2. Ensure `JWT_SECRET` is strong and unique
3. Set `secure: true` for cookies in production
4. Deploy

**Production Checklist:**
- [ ] Change `JWT_SECRET` to a strong random key
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (for secure cookies)
- [ ] Update `CORS_ORIGIN` to production frontend URL
- [ ] Set `secure: true` in cookie options
- [ ] Add rate limiting
- [ ] Enable HTTPS redirect
- [ ] Setup logging and monitoring

## 👨‍💼 User Guide

### Logging In
1. Go to http://localhost:3000
2. Click "Entrar" (Login)
3. Use credentials:
   - Email: `admin@example.com`
   - Password: `StrongPass123`

### Creating Account
1. Click "Criar Conta" (Register)
2. Fill in name, email, and password
3. Click "Criar Conta"

### Viewing Dashboard
- Once logged in, click "Dashboard" in navbar
- Only accessible when authenticated

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
1. Verify PostgreSQL is running
2. Check credentials in `.env`
3. Ensure database `erp_ztn` exists
4. Run migrations: `npm run migrate`

### CORS Issues
- Ensure `CORS_ORIGIN` in `.env` matches frontend URL
- Clear browser cookies and cache
- Check that `withCredentials: true` is set in axios

## 📞 Support

For issues or questions:
1. Check existing [GitHub Issues](https://github.com/ldanielz/erp-ztn/issues)
2. Create a new issue with detailed description
3. Include error messages and reproduction steps

## 🗺️ Roadmap

- [ ] Add user profile page
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Create admin dashboard
- [ ] Setup CI/CD pipeline
- [ ] Add unit and integration tests
- [ ] Implement refresh token rotation
- [ ] Add audit logging

---

**Happy coding! 🚀**
