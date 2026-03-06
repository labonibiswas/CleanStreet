# Clean Street

Clean Street is a civic engagement platform that enables citizens to report, track, and resolve local public issues such as garbage dumps, potholes, water leakage, and broken streetlights. It connects citizens, volunteers, and administrators through a location-aware web application with role-based workflows.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Modules](#modules)
- [Milestones](#milestones)

---

## Project Overview

Clean Street addresses the gap between citizens experiencing local infrastructure problems and the authorities responsible for resolving them. The platform provides:

- Geotagged issue reporting with image uploads
- Location-based discovery of nearby complaints
- Community voting (upvote/downvote) and commenting
- Volunteer task acceptance and progress tracking
- Administrative dashboard with statistics and recent activity

---

## Tech Stack

### Frontend

| Technology       | Version | Purpose                        |
|------------------|---------|--------------------------------|
| React            | 19.2    | UI framework                   |
| Vite             | 7.3     | Build tool and dev server      |
| Tailwind CSS     | 4.1     | Utility-first styling          |
| React Router DOM | 7.13    | Client-side routing            |
| Axios            | 1.13    | HTTP client                    |
| Leaflet          | 1.9     | Interactive maps               |
| React-Leaflet    | 5.0     | React bindings for Leaflet     |
| React Icons      | 5.5     | Icon library                   |
| Lucide React     | 0.564   | Additional icons               |

### Backend

| Technology                | Version | Purpose                          |
|---------------------------|---------|----------------------------------|
| Node.js + Express         | 5.2     | REST API server                  |
| MongoDB + Mongoose        | 9.2     | Database and ODM                 |
| JSON Web Tokens (jsonwebtoken) | 9.0 | Authentication                  |
| bcryptjs                  | 3.0     | Password hashing                 |
| Cloudinary                | 1.41    | Cloud image storage              |
| Multer                    | 2.0     | File upload handling             |
| multer-storage-cloudinary | 4.0     | Cloudinary storage adapter       |
| dotenv                    | 17.3    | Environment variable management  |
| cors                      | 2.8     | Cross-origin resource sharing    |
| nodemon                   | 3.1     | Development auto-restart (dev)   |

---

## Project Structure

```
CleanStreet/
├── backend/
│   ├── server.js                   # Express app entry point
│   ├── package.json
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── cloudinary.js           # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js       # Register, login, password, profile
│   │   ├── issueController.js      # CRUD, nearby, accept/reject
│   │   ├── voteController.js       # Upvote/downvote logic
│   │   ├── commentController.js    # Create and fetch comments
│   │   └── dashboardController.js  # Stats and recent activity
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification, role authorization
│   │   └── upload.js               # Multer + Cloudinary upload config
│   ├── models/
│   │   ├── User.js                 # User schema with geolocation
│   │   ├── Issue.js                # Issue schema with GeoJSON, status
│   │   ├── Vote.js                 # Vote schema (upvote/downvote)
│   │   └── Comment.js              # Comment schema
│   └── routes/
│       ├── authRoutes.js
│       ├── issueRoutes.js
│       ├── voteRoutes.js
│       ├── commentRoutes.js
│       └── dashboardRoutes.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Router and layout
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── axios.js            # Axios instance (base URL config)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       └── pages/
│           ├── Home.jsx            # Landing page
│           ├── LoginCard.jsx       # Login form
│           ├── Register.jsx        # Registration form
│           ├── Profile.jsx         # User profile management
│           ├── Dashboard.jsx       # Stats, charts, recent activity
│           ├── ReportIssue.jsx     # Issue submission with map picker
│           ├── ViewComplaints.jsx  # Browse, filter, vote, accept/decline
│           ├── ComplaintDetails.jsx# Single issue view with map + comments
│           └── EditComplaint.jsx   # Edit existing complaint
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Cloudinary** account (for image uploads)

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cleanstreet
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

The frontend Axios instance points to `http://localhost:5000/api` by default. Update `frontend/src/api/axios.js` if the backend runs on a different host or port.

---

## Installation

Clone the repository and install dependencies for both frontend and backend:

```bash
git clone <repository-url>
cd CleanStreet
```

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## Running the Application

**Start the backend** (runs on port 5000 by default):

```bash
cd backend
npm run dev
```

**Start the frontend** (Vite dev server, typically port 5173):

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in the browser.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Endpoint            | Auth     | Description                  |
|--------|---------------------|----------|------------------------------|
| POST   | `/register`         | Public   | Register a new user          |
| POST   | `/login`            | Public   | Login and receive JWT        |
| PUT    | `/change-password`  | Required | Change current password      |
| PUT    | `/update-profile`   | Required | Update profile information   |

### Issues — `/api/issues`

| Method | Endpoint            | Auth       | Description                              |
|--------|---------------------|------------|------------------------------------------|
| POST   | `/`                 | Required   | Create a new issue (up to 4 images)      |
| GET    | `/`                 | Required   | List all issues with vote counts         |
| GET    | `/nearby`           | Required   | Get issues within 20 km of user location |
| GET    | `/:id`              | Required   | Get a single issue by ID                 |
| PUT    | `/:id`              | Required   | Update an issue                          |
| DELETE | `/:id`              | Required   | Delete an issue                          |
| PATCH  | `/:id/respond`      | Volunteer  | Accept or withdraw from an issue         |

**PATCH `/:id/respond`** accepts a JSON body with `{ "action": "accept" }` or `{ "action": "reject" }`.

- **Accept**: Only works when issue status is `Pending`. Sets status to `In Review` and assigns the volunteer.
- **Reject (Withdraw)**: Only works when status is `In Review` and the issue is assigned to the requesting volunteer. Resets status to `Pending`.

### Votes — `/api/votes`

| Method | Endpoint       | Auth     | Description                        |
|--------|----------------|----------|------------------------------------|
| POST   | `/:id/vote`    | Required | Cast upvote or downvote on an issue|

### Comments — `/api/comments`

| Method | Endpoint  | Auth     | Description                      |
|--------|-----------|----------|----------------------------------|
| POST   | `/:id`    | Required | Add a comment to an issue        |
| GET    | `/:id`    | Public   | Get all comments for an issue    |

### Dashboard — `/api/dashboard`

| Method | Endpoint   | Auth   | Description                     |
|--------|------------|--------|---------------------------------|
| GET    | `/stats`   | Public | Aggregate statistics            |
| GET    | `/recent`  | Public | Recently reported issues        |

---

## Database Schema

### User

| Field       | Type            | Notes                                  |
|-------------|-----------------|----------------------------------------|
| fullName    | String          | Required                               |
| username    | String          | Required, unique                       |
| email       | String          | Required, unique                       |
| phone       | String          | Required                               |
| location    | GeoJSON Point   | User's coordinates, 2dsphere indexed   |
| role        | String          | `citizen`, `volunteer`, or `admin`     |
| password    | String          | Hashed with bcryptjs                   |
| timestamps  | —               | `createdAt`, `updatedAt` auto-managed  |

### Issue

| Field       | Type            | Notes                                          |
|-------------|-----------------|------------------------------------------------|
| title       | String          | Required, trimmed                              |
| issueType   | String          | Required (e.g., pothole, garbage, leakage)     |
| priority    | String          | `low`, `medium`, `high`, `critical`            |
| address     | String          | Required                                       |
| landmark    | String          | Optional                                       |
| description | String          | Required                                       |
| imageUrls   | [String]        | Up to 4 Cloudinary URLs                        |
| location    | GeoJSON Point   | 2dsphere indexed for geospatial queries        |
| reportedBy  | ObjectId → User | Citizen who created the issue                  |
| status      | String          | `Pending`, `In Review`, `Resolved`             |
| progress    | Number          | 0–100                                          |
| assignedTo  | ObjectId → User | Volunteer assigned to the issue (nullable)     |
| timestamps  | —               | `createdAt`, `updatedAt` auto-managed          |

### Vote

| Field    | Type            | Notes                            |
|----------|-----------------|----------------------------------|
| issue    | ObjectId → Issue| Required                         |
| user     | ObjectId → User | Required                         |
| voteType | String          | `upvote` or `downvote`           |
| timestamps | —             | Auto-managed                     |

### Comment

| Field    | Type            | Notes                            |
|----------|-----------------|----------------------------------|
| issue    | ObjectId → Issue| Required                         |
| user     | ObjectId → User | Required                         |
| text     | String          | Required                         |
| timestamps | —             | Auto-managed                     |

---

## User Roles and Permissions

| Capability                    | Citizen | Volunteer | Admin |
|-------------------------------|---------|-----------|-------|
| Register and login            | Yes     | Yes       | Yes   |
| Report an issue               | Yes     | Yes       | Yes   |
| View all / nearby issues      | Yes     | Yes       | Yes   |
| Vote on issues                | Yes     | Yes       | Yes   |
| Comment on issues             | Yes     | Yes       | Yes   |
| Edit / delete own issues      | Yes     | Yes       | Yes   |
| Accept / withdraw from issues | No      | Yes       | No    |
| View dashboard statistics     | Yes     | Yes       | Yes   |

---

## Modules

### Module A — User and Complaint Management
User registration with geolocation, JWT-based authentication, profile management, and full CRUD operations on civic complaints with image uploads via Cloudinary.

### Module B — Location-Based Reporting and Assignment
Geospatial issue submission using interactive maps, 2dsphere-indexed nearby complaint discovery (20 km radius), and volunteer task assignment with accept/withdraw workflow.

### Module C — Community Voting and Comments
Public upvote/downvote system on reported issues and threaded commenting to enable community discussion and priority signaling.

### Module D — Dashboard and Analytics
Aggregate statistics (total issues, status breakdown), recent activity feed, and filtering/sorting capabilities for monitoring civic issue resolution.

---

## Milestones

| Milestone   | Duration  | Scope                                                        |
|-------------|-----------|--------------------------------------------------------------|
| Milestone 1 | Weeks 1–2 | Project setup, authentication, user registration with geolocation |
| Milestone 2 | Weeks 3–4 | Complaint CRUD, image uploads, map-based reporting           |
| Milestone 3 | Weeks 5–6 | Voting, comments, volunteer accept/withdraw workflow         |
| Milestone 4 | Weeks 7–8 | Dashboard, analytics, nearby issues, UI polish               |
