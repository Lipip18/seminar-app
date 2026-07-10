# Seminar Hall Booking System

## Overview

The Seminar Hall Booking System is a web-based application designed to streamline the process of reserving seminar halls within an institution or organization. The system enables users to check hall availability, submit booking requests, manage reservations, and receive booking updates through an intuitive and user-friendly interface.

The platform eliminates manual scheduling conflicts, improves resource utilization, and provides administrators with centralized control over hall management.

---

## Features

### User Features

* User Registration and Authentication
* Secure Login and Logout
* View Available Seminar Halls
* Check Hall Availability
* Book Seminar Halls for Events
* View Booking History
* Cancel Bookings
* Real-Time Booking Status Updates

### Administrator Features

* Manage Seminar Halls
* Approve or Reject Booking Requests
* View All Reservations
* Manage Users
* Prevent Scheduling Conflicts
* Generate Booking Reports
* Dashboard for Monitoring Hall Usage

---

## Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Additional Tools

* Git & GitHub
* Postman
* VS Code

---

## System Architecture

```text
Frontend (React)
       │
       ▼
Backend API (Node.js + Express)
       │
       ▼
Database (MongoDB)
```

---

## Project Structure

```text
seminar-hall-booking-system/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── screenshots/
├── README.md
└── package.json
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/seminar-hall-booking-system.git
```

### Navigate to Project Directory

```bash
cd seminar-hall-booking-system
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Run the Application

### Start Backend Server

```bash
cd server
npm start
```

### Start Frontend

```bash
cd client
npm start
```

Application URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## Future Enhancements

* Email Notifications
* Calendar Integration
* QR Code-Based Booking Verification
* Role-Based Access Control
* Analytics Dashboard
* Mobile Application Support
* AI-Based Schedule Recommendations

---

## Screenshots

Add project screenshots here:

```text
screenshots/
├── login-page.png
├── dashboard.png
├── booking-form.png
└── admin-panel.png
```

---

## Learning Outcomes

Through this project, the following concepts were implemented:

* Full-Stack Web Development
* REST API Development
* Database Design and Integration
* Authentication and Authorization
* CRUD Operations
* State Management
* Git Version Control
* Responsive UI Design

---

## Contributors

* Lipi Patel
* Project Team Members

---

## License

This project is developed for educational and academic purposes.
