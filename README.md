# 🚀 ProjectFlow — Full-Stack Project & Task Management App

A production-ready project management application with role-based access control, built with React, Node.js, Express, and MongoDB.

---

## 🌐 Live Demo

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | `https://your-app.vercel.app` |
| Backend   | `https://your-api.railway.app` |

---

## ✨ Features

- **Authentication** — Secure signup/login with JWT & bcrypt
- **Role-Based Access** — Admin and Member roles with distinct permissions
- **Project Management** — Create, view, update, and delete projects
- **Team Management** — Add/remove members from projects
- **Task Management** — Kanban-style board with drag-friendly layout
- **Dashboard** — Stats overview with progress charts
- **Filtering** — Filter tasks by status and project
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## 🛠 Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| react-hot-toast | Notifications |
| date-fns | Date formatting |

---

## 📁 Folder Structure

```
projectflow/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validationMiddleware.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx
    │   │   └── TasksPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/projectflow.git
cd projectflow
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit VITE_API_URL to point to your backend
npm run dev
```

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:3000`

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/signup` | ❌ | — | Register new user |
| POST | `/login` | ❌ | — | Login & get JWT |
| GET | `/me` | ✅ | Any | Get current user |
| GET | `/users` | ✅ | Admin | List all users |

### Projects — `/api/projects`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | List projects (filtered by role) |
| POST | `/` | ✅ | Admin | Create project |
| GET | `/:id` | ✅ | Any | Get project details |
| PUT | `/:id` | ✅ | Admin | Update project |
| DELETE | `/:id` | ✅ | Admin | Delete project + tasks |
| POST | `/:id/members` | ✅ | Admin | Add member |
| DELETE | `/:id/members/:userId` | ✅ | Admin | Remove member |

### Tasks — `/api/tasks`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | List tasks (filtered by role) |
| POST | `/` | ✅ | Admin | Create task |
| GET | `/:id` | ✅ | Any | Get task details |
| PUT | `/:id` | ✅ | Any* | Update task (*Members: own tasks, status only) |
| DELETE | `/:id` | ✅ | Admin | Delete task |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | Get stats & summary |

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/delete projects | ✅ | ❌ |
| Add/remove project members | ✅ | ❌ |
| Create/assign tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update task status | ✅ | Own tasks only |
| View all projects | ✅ | Assigned only |
| View all tasks | ✅ | Assigned only |
| Dashboard stats | Full | Own stats |

---

## 🌐 Deployment

### Backend → Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo and `backend/` folder
4. Add environment variables from `.env.example`
5. Set `FRONTEND_URL` to your Vercel URL

### Database → MongoDB Atlas

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster → Get connection string
3. Add to Railway env as `MONGODB_URI`

### Frontend → Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set root directory to `frontend/`
4. Add environment variable: `VITE_API_URL=https://your-railway-app.railway.app/api`
5. Deploy

---

## 📋 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend `.env`
```env
VITE_API_URL=https://your-api.railway.app/api
```

---

## 🧪 Demo Credentials

Seed demo accounts by signing up with:
- **Admin**: `admin@demo.com` / `admin123` (Role: Admin)
- **Member**: `member@demo.com` / `member123` (Role: Member)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
