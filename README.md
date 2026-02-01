# Room Booking API

## Project Description

This project is a RESTful API for a **Room Booking system** developed using **Node.js**, **Express**, and **MongoDB (Mongoose)**.  
The application demonstrates **Multi-Object CRUD operations**, **Authentication**, and **Role-Based Access Control (RBAC)** as required by the assignment.

## Project Architecture (MVC)

The project follows an MVC-style structure:

```
server4/
│
├── models/
│ ├── User.js
│ ├── Room.js
│ └── Booking.js
│
├── controllers/
│ ├── authController.js
│ ├── roomController.js
│ └── bookingController.js
│
├── routes/
│ ├── authRoutes.js
│ ├── roomRoutes.js
│ └── bookingRoutes.js
│
├── middleware/
│ ├── auth.js
│ └── requireAdmin.js
│
├── public/
│
├── .env
├── server.js
└── README.md


```

## 🗄️ Database Models

### User (Authentication)

Fields:

```
- `email` (unique)
- `password` (hashed using bcrypt)
- `role` (`user` or `admin`)
```

### Room (Primary Object)

Represents rooms that can be managed by admins.

Example fields:

```
- `name`
- `capacity`
- `pricePerHour`
- `roomType`
- `amenities`
- `description`
- `available`
```

### Booking (Secondary Object – Related)

Represents room bookings and is **linked to Room**.

Relation:

- `roomId` → references `Room._id`

Example fields:

```
- `roomId`
- `customerName`
- `startTime`
- `endTime`
- `status`
```

## Authentication & Security

- Passwords are **hashed using bcrypt**
- Authentication is handled using **JWT (JSON Web Tokens)**
- Tokens must be sent in the header:
  Authorization: Bearer <TOKEN>

## Role-Based Access Control (RBAC)

| Role  | Permissions                     |
| ----- | ------------------------------- |
| User  | Read-only access (GET requests) |
| Admin | Full access (POST, PUT, DELETE) |

Rules applied:

- **GET** routes are public
- **POST / PUT / DELETE** routes are **admin-only**

## API Endpoints

### Authentication

| Method | Endpoint       | Access |
| ------ | -------------- | ------ |
| POST   | /auth/register | Public |
| POST   | /auth/login    | Public |

### Rooms (Primary Object)

| Method | Endpoint   | Access | CRUD   |
| ------ | ---------- | ------ | ------ |
| GET    | /rooms     | Public | Read   |
| GET    | /rooms/:id | Public | Read   |
| POST   | /rooms     | Admin  | Create |
| PUT    | /rooms/:id | Admin  | Update |
| DELETE | /rooms/:id | Admin  | Delete |

### Bookings (Secondary Object)

| Method | Endpoint      | Access | CRUD   |
| ------ | ------------- | ------ | ------ |
| GET    | /bookings     | Public | Read   |
| GET    | /bookings/:id | Public | Read   |
| POST   | /bookings     | Admin  | Create |
| PUT    | /bookings/:id | Admin  | Update |
| DELETE | /bookings/:id | Admin  | Delete |

---

##  Testing

All API endpoints were tested using **Thunder Client (VS Code extension)**.

Tested scenarios include:

- Admin authentication and token generation
- Full CRUD operations for Rooms
- Full CRUD operations for Bookings
- RBAC validation (403 error when a user tries admin-only actions)

---

## How to Run the Project

1. Install dependencies:

```bash
npm install
Create a .env file:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Run the server:

node server.js
API will be available at:

http://localhost:3000

```

## Assignment Requirements Coverage

Multi-object CRUD operations

Two related entities (Room & Booking)

Authentication system with JWT

Password hashing (bcrypt)

Role-Based Access Control (RBAC)

MVC project structure
