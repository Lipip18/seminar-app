# Seminar Hall Booking System

A full-stack web application for managing seminar hall reservations across an institution. Users can browse halls, submit booking requests, review their bookings, and administrators can manage halls, users, and booking approvals from a role-based dashboard.

## Overview

This project combines a React frontend with an Express + MongoDB backend to provide a simple and practical hall-booking workflow for three roles:

- Admin: manage halls, users, bookings, and system-wide schedules
- Faculty: browse available halls and submit booking requests
- Student: view halls and review available booking information

## Features

- Secure authentication and role-based access
- Hall listing with capacity and facility details
- Booking request creation and status tracking
- Admin dashboard for managing bookings and halls
- Calendar-based views for bookings
- Profile management for users
- Responsive interface for desktop and tablet use

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Sonner for notifications

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer + Cloudinary for uploads
- Nodemailer for email notifications

## Project Structure

```text
final/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── styles/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seedAdmin.js
│   └── server.js
└── README.md
```

## Prerequisites

Make sure the following are installed on your machine:

- Node.js 18+ (20+ recommended)
- npm
- MongoDB running locally or a reachable MongoDB URI

## Installation

1. Clone the repository

```bash
git clone <your-repository-url>
cd final
```

2. Install frontend dependencies

```bash
cd client
npm install
```

3. Install backend dependencies

```bash
cd ../server
npm install
```

## Environment Variables

Create a `.env` file inside the server directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/seminar_hall
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional email settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your-email@example.com
SMTP_PASSWORD=your-password
FROM_NAME=Seminar Hall Booking
FROM_EMAIL=your-email@example.com

# Optional Cloudinary settings for uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Running the Application

### Start the backend

```bash
cd server
npm run dev
```

The backend API will run at:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd client
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Seed the Admin User

To create the default admin account, run:

```bash
cd server
node seedAdmin.js
```

Default login credentials:

- Email: `admin@seminarhall.com`
- Password: `Admin@123`

> It is strongly recommended to change the password after the first login.

## Build for Production

Build the frontend for deployment:

```bash
cd client
npm run build
```

## API Base URL

The frontend communicates with the backend using:

```text
http://localhost:5000/api
```

## Notes

- The app expects MongoDB to be available before the backend starts.
- If you use image uploads, make sure Cloudinary credentials are configured.
- The UI is configured for local development and can be extended for deployment environments.

## License

This project is intended for educational and institutional use.
