# 🚀 ProjectFlow — Full-Stack Project & Task Management App

A production-ready project management application with role-based access control, built with React, Node.js, Express, and MongoDB.

---

## 🌐 Live Demo

| Service   | URL |
|-----------|-----|
| 🖥️ Frontend  | [projectflow-production-afa7.up.railway.app](https://projectflow-production-afa7.up.railway.app) |
| ⚙️ Backend   | [projectflow-production-2675.up.railway.app](https://projectflow-production-2675.up.railway.app) |
| 📦 GitHub    | [github.com/Tejaswi75/ProjectFlow](https://github.com/Tejaswi75/ProjectFlow) |

---

## ✨ Features

- 🔐 **Authentication** — Secure signup/login with JWT & bcrypt
- 👥 **Role-Based Access** — Admin and Member roles with distinct permissions
- 📁 **Project Management** — Create, view, update, and delete projects
- 👤 **Team Management** — Add/remove members from projects
- ✅ **Task Management** — Kanban-style board with status tracking
- 📊 **Dashboard** — Stats overview with progress charts
- 🔍 **Filtering** — Filter tasks by status and project
- 📱 **Responsive UI** — Works on mobile, tablet, and desktop

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

### Deployment
| Service | Platform |
|---------|----------|
| Frontend | Railway |
| Backend | Railway |
| Database | MongoDB Atlas |

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
│   ├── seed.js
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
- MongoDB Atlas account
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Tejaswi75/ProjectFlow.git
cd ProjectFlow
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/projectflow
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

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
| GET | `/` | ✅ | Any | List projects |
| POST | `/` | ✅ | Admin | Create project |
| GET | `/:id` | ✅ | Any | Get project details |
| PUT | `/:id` | ✅ | Admin | Update project |
| DELETE | `/:id` | ✅ | Admin | Delete project + tasks |
| POST | `/:id/members` | ✅ | Admin | Add member |
| DELETE | `/:id/members/:userId` | ✅ | Admin | Remove member |

### Tasks — `/api/tasks`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | List tasks |
| POST | `/` | ✅ | Admin | Create task |
| GET | `/:id` | ✅ | Any | Get task details |
| PUT | `/:id` | ✅ | Any* | Update task (*Members: own tasks only) |
| DELETE | `/:id` | ✅ | Admin | Delete task |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | Get stats & summary |

---

## 🔐 Role-Based Access Control

| Feature | Admin | Member |
|---------|-------|--------|
| Create/delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/assign tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update task status | ✅ | Own tasks only |
| View all projects | ✅ | Assigned only |
| View all tasks | ✅ | Assigned only |
| Full dashboard stats | ✅ | Own stats only |

---

## 🌐 Deployment Guide

### Backend → Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select repo → Set **Root Directory** to `backend`
3. Set **Start Command**: `node server.js`
4. Add environment variables
5. Settings → Networking → Generate Domain

### Frontend → Railway
1. New Service → GitHub Repo → same repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npx serve -s dist -l $PORT`
5. Add `VITE_API_URL` environment variable
6. Settings → Networking → Generate Domain

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Network Access → Add IP → Allow from Anywhere (`0.0.0.0/0`)
3. Copy connection string → add to `MONGODB_URI`

---

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Member | member@demo.com | member123 |
| Member | bob@demo.com | bob12345 |

> To create demo accounts run:
> ```bash
> cd backend
> node seed.js
> ```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning or commercial purposes.

---

Made with ❤️ by [Tejaswi](https://github.com/Tejaswi75)
