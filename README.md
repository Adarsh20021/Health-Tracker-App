# Health Tracker Web Application 

A modern, responsive, full-stack **Health Tracker Web Application** designed for university students to log and audit core daily wellness metrics:
- **Calories** (kcal)
- **Water intake** (Liters)
- **Steps** (Daily activity count)
- **Sleep hours** (Daily rest duration)

---

##  Tech Stack & Architecture

- **Frontend**: React.js, Tailwind CSS (v4), React Router DOM, Recharts (Area, Line, and Bar charts), Axios Client, Lucide Webicons.
- **Backend**: Node.js + Express.js API, JWT Authentication, Bcrypt Password Hashing, Mongoose adapter.
- **Database**: MongoDB Atlas support with a dynamic **Local File Database Fallback (local-db.json)**. 

>  **Dynamic Database Layer**: If no `MONGODB_URI` environment variable is defined, the backend automatically provisions a secure, disk-backed JSON database file (`local-db.json`) inside the sandbox. This allows the application to work out-of-the-box immediately in any environment, while remaining fully compatible with live MongoDB Atlas grids upon supplying credentials!

---

##  Project Directory Layout

```text
├── server.ts               # Full-Stack entry point (Express Server + Vite Middleware)
├── vercel.json             # Vercel SPA routing proxy configs
├── package.json            # Scripts, core and dev-dependencies config manifest
├── .env.example            # Reference variables file for secrets config
├── local-db.json           # File-backed local mock storage (generated automatically if no MONGODB_URI)
├── src/
│   ├── App.tsx             # React App navigation router & entry page router
│   ├── main.tsx            # DOM mounting root entry
│   ├── index.css            # Custom Inter/JetBrains Mono typography stylesheet
│   ├── types.ts            # Type safety interfaces mapping
│   ├── services/
│   │   └── api.ts          # Axios client with automatic Bearer Token interceptor
│   ├── context/
│   │   └── AuthContext.tsx # React Context manager for registration, login, state
│   ├── components/
│   │   ├── PageLayout.tsx  # Desktop frames & mobile drawer sidebar layouts
│   │   ├── Sidebar.tsx     # Unified Navigation links: Dashboard & History, Logout
│   │   ├── SummaryCards.tsx# High-impact KPI stats summaries
│   │   └── DailyLogForm.tsx# Standard health forms with field constraints and validation
│   ├── charts/
│   │   └── HealthCharts.tsx# Recharts visualizer (Area, Bar, Line trend mapping)
│   └── pages/
│       ├── Login.tsx       # Auth portal for accounts entry
│       ├── Register.tsx    # Auth portal for creating user records
│       ├── Dashboard.tsx   # Core trackers dashboard
│       └── History.tsx      # Archival filters table log
```

---

##  Local Quickstart Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your workstation.

### 2. Configure Environment Options
Copy the example environment settings to create a local `.env` configuration file:
- Copy contents of `.env.example` into a new file named `.env`.
- Modify `JWT_SECRET` with any custom string signature.
- Provide a `MONGODB_URI` string to sync stats with your MongoDB Atlas Cluster. If omitted, the applet defaults to the local, secure file-based storage fallback.

### 3. Run the Development Server
Install initial dependencies if required and boot up:
```bash
npm install
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the live interface.

---

##  Deployment Guides

### 1. Frontend to Vercel
To deploy the React web application on **Vercel** as a static site:
1. Initialize a Git repository, commit files, and push to GitHub/GitLab.
2. Link your repository inside your **Vercel Dashboard**.
3. Since Vercel is a static site host, configure:
   - **Framework Preset**: `Vite` or `Other`
   - **Build Command**: `npm run build` (This compiles static assets into `dist/` directory)
   - **Output Directory**: `dist`
4. Set up the `vercel.json` rewrite file to proxy requests from Vercel to your active Render/Railway backend address:
   - Edit the Vercel rewrite configuration of `/api/:path*` to forward traffic to `https://your-backend-app.onrender.com/api/:path*`.

### 2. Backend to Render / Railway
To deploy the Express API backend to **Render** or **Railway**:
1. Create a native web service instance pointing to your repository.
2. Configure environment variables in their dashboard settings:
   - `NODE_ENV=production`
   - `JWT_SECRET=any_complex_secret_value`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/database`
3. Configure boot scripts:
   - **Build Command**: `npm run build` (Compiles both client bundle and backend bundle into `dist/server.cjs`)
   - **Start Command**: `npm run start` (Launches unified client-server compiled Node distribution)
