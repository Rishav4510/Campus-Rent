# 🚀 CampusRent — India's Student-to-Student Campus Rental Platform

CampusRent is a modern, full-stack marketplace built for college students across India. Students can rent out or borrow calculators, lab coats, drafters, cycles, textbooks, and hostel essentials directly from verified peers on their own campus.

---

## 🌟 Key Features

- 🇮🇳 **India-Wide State & College System**: 33+ States & Union Territories with dynamically linked universities and engineering colleges.
- 🏫 **Campus-First Discovery**: Instantly browse items available in your specific hostel blocks and departments.
- 🌙 **Complete Dark & Light Mode**: Seamless theme switching with persistence via `localStorage`.
- 🔐 **Secure Authentication**: JWT-based auth with bcrypt password hashing, role-based authorization (`student` vs. `admin`), and session persistence.
- 📦 **Rich Item Listings**: Multi-image uploads, daily rental pricing, refundable security deposits, and condition tags.
- 🔄 **Full Rental Lifecycle**: Date selection with automated pricing, status transitions (`Pending` ➔ `Accepted` ➔ `Completed` / `Cancelled`), and anti-double booking availability synchronization.
- 💬 **Peer-to-Peer Chat**: Coordinate pickup and return locations right on campus.
- ⭐ **Reviews & Ratings**: Post-rental peer review system that updates student and item trust scores.
- ❤️ **Favorites**: Save items for upcoming exams and semesters.
- 🔔 **Real-Time Notifications**: Instant alerts for rental requests, acceptances, messages, and reviews.
- 🛡️ **Admin Dashboard**: System metrics, user suspension/moderation, college directory additions, and report oversight.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with dark mode class strategy
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **API Client**: Axios with request/response interceptors

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer disk storage

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds 33 States, 28 Colleges, Categories, Users & Sample Items
npm start        # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

To build for production:
```bash
cd frontend
npm run build
```

---

## 🔑 Demo Accounts (Created by `npm run seed`)

| Role | Email | Password | Campus |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusrent.com` | `admin123` | Platform Admin |
| **Student** | `rishav@campusrent.com` | `student123` | KIET Group of Institutions (UP) |
| **Student** | `priya@campusrent.com` | `student123` | IIT Delhi |
| **Student** | `aditya@campusrent.com` | `student123` | COEP Pune (Maharashtra) |
| **Student** | `ananya@campusrent.com` | `student123` | RVCE Bengaluru (Karnataka) |

---

## 📡 REST API Overview

### Authentication
- `POST /api/auth/register` — Register student with state, college, course, year
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Current user profile
- `PUT /api/auth/me` — Update profile details
- `PUT /api/auth/change-password` — Update account password
- `GET /api/auth/users/:id` — Public student profile with ratings and listings

### States & Colleges
- `GET /api/states` — List all Indian States & Union Territories
- `GET /api/colleges?state=:id` — Colleges filtered by state
- `POST /api/colleges` — Add a new college (Admin only)

### Categories & Items
- `GET /api/categories` — Browse item categories
- `GET /api/items` — Filter by search, category, state, college, price, condition, availability
- `GET /api/items/:id` — Full listing details + reviews
- `POST /api/items` — Create new listing (multipart image upload)
- `PUT /api/items/:id` — Update listing
- `DELETE /api/items/:id` — Delete listing (guarded against active rentals)

### Rentals
- `POST /api/rentals` — Request a rental (same-day or multi-day)
- `GET /api/rentals/mine` — Borrower dashboard
- `GET /api/rentals/requests` — Owner incoming requests
- `PUT /api/rentals/:id/status` — Status transition (`Accepted`, `Rejected`, `Completed`, `Cancelled`)

### Reviews & Favorites
- `POST /api/reviews` — Submit a review on completed rentals
- `POST /api/favorites/toggle/:itemId` — Add/remove item from saved favorites
- `GET /api/favorites` — List user's saved items

### Chat & Notifications
- `POST /api/chat/start` — Start/find conversation for an item
- `GET /api/chat/conversations` — User's message threads
- `GET /api/chat/conversations/:id/messages` — Conversation messages
- `POST /api/chat/conversations/:id/messages` — Send message
- `GET /api/notifications` — User notifications
- `PATCH /api/notifications/:id/read` — Mark notification read

### Admin & Reports
- `GET /api/admin/stats` — Platform metrics
- `GET /api/admin/users` — Moderate users (suspend/activate/delete)
- `GET /api/reports` — Review flagged listings and users
- `PATCH /api/reports/:id/status` — Resolve or dismiss reports
