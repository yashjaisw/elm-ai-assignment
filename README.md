# ELM User Dashboard App

A full-stack web application built with React, Redux, Material-UI, Node.js, Express, and MongoDB. Features authentication, CRUD operations, file uploads, and a responsive dashboard interface.

## 🚀 Features

### Authentication & Security
- **Secure Login/Registration** with JWT access & refresh tokens
- **Password Hashing** using bcrypt with salt rounds
- **Protected Routes** with automatic token refresh
- **Session Management** with multiple device support

### Dashboard & Posts Management
- **Material-UI DataGrid** for posts with pagination, sorting, and filtering
- **Full CRUD Operations** - Create, Read, Update, Delete posts
- **File Upload System** with metadata extraction
- **Real-time Loading States** and error handling
- **Search & Filter** functionality

### User Experience
- **Responsive Design** that works on all devices
- **Optimistic Updates** for instant UI feedback
- **Loading Skeletons** and progress indicators
- **Clean Navigation** with persistent navbar

### Technical Excellence
- **Redux Toolkit** for state management
- **Clean Architecture** with separation of concerns
- **Error Boundaries** for graceful error handling
- **Redis Caching** (bonus feature)
- **Input Validation** on both client and server

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Redux Toolkit** - Predictable state management
- **Material-UI v5** - Beautiful, accessible components
- **React Router v6** - Declarative routing
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Performant forms

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Elegant MongoDB ODM
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Redis** - In-memory caching (optional)

## 📁 Project Structure

```
elm-user-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Auth, upload, error handling
│   │   ├── models/               # Database schemas
│   │   ├── routes/               # API endpoints
│   │   ├── config/               # Database, Redis, JWT config
│   │   ├── utils/                # Helper functions
│   │   └── app.js                # Express app setup
│   ├── uploads/                  # File storage
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components
│   │   │   ├── layout/           # Navbar, Layout
│   │   │   └── posts/            # Post-related components
│   │   ├── pages/                # Route components
│   │   ├── store/                # Redux setup
│   │   │   ├── slices/           # Redux slices
│   │   │   └── middleware/       # Custom middleware
│   │   ├── services/             # API calls
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx               # Main app component
│   │   └── index.js              # App entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Redis (optional, for caching)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start Redis (optional)**
   ```bash
   redis-server
   ```

6. **Start the backend server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start the frontend application**
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (with pagination & filters)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (with file upload)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/my` - Get user's posts
- `POST /api/posts/:id/like` - Toggle like on post
- `POST /api/posts/:id/comments` - Add comment to post

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎨 UI Features

### Login/Registration
- **Tabbed Interface** for easy switching
- **Real-time Validation** with helpful error messages
- **Password Visibility Toggle** for better UX
- **Loading States** during authentication

### Dashboard
- **Material-UI DataGrid** with:
  - Search and filtering
  - Custom cell renderers
  - Action buttons for each post
- **Responsive Layout** that adapts to screen size
- **File Upload** with drag-and-drop support

### Navigation
- **Persistent Navbar** with user info
- **Active Route Highlighting** 
- **Profile Menu** with logout option
- **Breadcrumb Navigation** for deep links

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt salt rounds
- **Protected API Routes** with middleware
- **Input Validation** on both client and server
- **CORS Protection** for cross-origin requests
- **Rate Limiting** for sensitive operations
- **File Upload Validation** with type and size limits

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

Material-UI breakpoints ensure consistent behavior across devices.

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start with PM2: `pm2 start app.js`

### Frontend Deployment
1. Set production API URL in `.env`
2. Build the application: `npm run build`
3. Serve the `build` folder with a static server

### Environment Variables for Production

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dashboard
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
REDIS_URL=redis://your-redis-url:6379
```

**Frontend (.env.production)**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Redux Toolkit team for simplified state management
- MongoDB team for the robust database
- The open-source community for the amazing tools

