🚀 ProjectFlow — Full-Stack Project & Task Management App
A production-ready project management application with role-based access control, built with React, Node.js, Express, and MongoDB.

🌐 Live Demo
ServiceURLFrontendhttps://projectflow-production-afa7.up.railway.appBackendhttps://projectflow-production-2675.up.railway.app

✨ Features

Authentication — Secure signup/login with JWT & bcrypt
Role-Based Access — Admin and Member roles with distinct permissions
Project Management — Create, view, update, and delete projects
Team Management — Add/remove members from projects
Task Management — Kanban-style board with status tracking
Dashboard — Stats overview with progress charts
Filtering — Filter tasks by status and project
Responsive UI — Works on mobile, tablet, and desktop


🛠 Tech Stack
Backend
TechPurposeNode.js + ExpressREST API serverMongoDB + MongooseDatabase & ODMJWTAuthentication tokensbcryptjsPassword hashingexpress-validatorInput validation
Frontend
TechPurposeReact 18UI frameworkReact Router v6Client-side routingTailwind CSSStylingAxiosHTTP clientreact-hot-toastNotificationsdate-fnsDate formatting

📁 Folder Structure
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
    │   ├── components/layout/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx
    │   │   └── TasksPage.jsx
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js

🚀 Local Setup
Prerequisites

Node.js >= 18
MongoDB Atlas account
Git

1. Clone the repo
bashgit clone https://github.com/Tejaswi75/ProjectFlow.git
cd projectflow
2. Setup Backend
bashcd backend
npm install
# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
3. Setup Frontend
bashcd frontend
npm install
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
Backend: http://localhost:5000
Frontend: http://localhost:3000