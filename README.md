# 🚚 CarryMyStuff - Complete Moving Services Platform

**CarryMyStuff** is a full-stack web application that connects people who need moving services with vehicle owners (helpers). Built from the ground up with modern technologies and best practices, this platform enables seamless vehicle booking and management for relocations.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Security Features](#-security-features)
- [Database Structure](#-database-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Frontend Features](#-frontend-features)
- [Recent Improvements](#-recent-improvements)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## 🌟 Project Overview

CarryMyStuff connects three types of users:
- **Users (Customers)** - People who need vehicles for moving
- **Helpers** - Vehicle owners who rent out their cars, vans, and trucks
- **Admins** - Platform administrators who manage the system

The platform allows users to browse available vehicles, filter by city and type, create bookings, and manage their moving services - all through an intuitive, modern interface.

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with stateless tokens
- **BCrypt password hashing** for secure storage
- **Role-based access control** (USER, HELPER, ADMIN)
- **Token validation** on every request
- **Automatic role-based routing** after login

### 👤 User Features
- **Browse vehicles** - view all available vehicles
- **Advanced search** with city, type, and capacity filters
- **Real-time filtering** with instant results
- **Create bookings** with pickup/dropoff addresses and dates
- **Manage bookings** - view, track status, cancel
- **Booking history** with detailed information
- **Responsive dashboard** with modern dark theme

### 🚗 Helper Features
- **Vehicle management** - add, edit, delete vehicles
- **Set vehicle details** - type, capacity, city, license plate, description
- **Manage availability** - activate/deactivate vehicles
- **Booking requests** - view incoming bookings
- **Accept/reject bookings** - control which requests to fulfill
- **Update booking status** - PENDING → ACCEPTED → DONE

### 👨‍💼 Admin Features
- **User management** - view all users, delete accounts
- **Vehicle oversight** - monitor all vehicles, remove listings
- **Booking administration** - view all bookings, manage disputes
- **System statistics** - track platform usage

### 🎨 UI/UX Features
- **Modern dark theme** with blue/green gradient accents
- **Fully responsive** - works on mobile, tablet, desktop
- **Card-based layouts** for easy scanning
- **Toast notifications** for user feedback
- **Loading states** for async operations
- **Empty states** with helpful messages
- **Smooth animations** and transitions

---

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Main framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database ORM
- **MySQL 8.0** - Relational database
- **JWT (jjwt 0.11.5)** - Token-based authentication
- **BCrypt** - Password hashing
- **Lombok** - Boilerplate reduction
- **Maven** - Dependency management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Client-side logic
- **Fetch API** - HTTP requests
- **LocalStorage** - Token persistence
- **No frameworks** - Pure vanilla JS for simplicity

---

## 🏗️ Architecture

### System Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │────────▶│  Spring Boot │────────▶│    MySQL     │
│  (Frontend)  │◀────────│   (Backend)  │◀────────│  (Database)  │
└──────────────┘   HTTP  └──────────────┘   JDBC  └──────────────┘
      │                        │
      │                        │
      │                   ┌────▼────┐
      │                   │  JWT    │
      └──────────────────▶│ Filter  │
          Bearer Token    └─────────┘
```

### Backend Structure

```
src/main/java/be/ehb/carrymystuff/
├── config/
│   ├── SecurityConfig.java           # Spring Security configuration
│   └── CorsConfig.java                # CORS settings
├── controller/
│   ├── AuthController.java            # Login, register, /me
│   ├── UserController.java            # User endpoints
│   ├── HelperController.java          # Helper endpoints
│   └── AdminController.java           # Admin endpoints
├── DTO/
│   ├── LoginRequest.java              # Login credentials
│   ├── RegisterRequest.java           # Registration data
│   └── AuthResponse.java              # Token + role response
├── models/
│   ├── User.java                      # User entity
│   ├── Vehicle.java                   # Vehicle entity
│   ├── Booking.java                   # Booking entity
│   └── Role.java                      # Enum: USER, HELPER, ADMIN
├── Repository/
│   ├── UserRepository.java            # User data access
│   ├── VehicleRepository.java         # Vehicle data access
│   └── BookingRepository.java         # Booking data access
├── service/
│   ├── AuthService.java               # Authentication logic
│   ├── VehicleService.java            # Vehicle business logic
│   └── BookingService.java            # Booking business logic
└── security/
    ├── JwtUtil.java                   # JWT generation/validation
    └── JwtAuthenticationFilter.java   # Request filter
```

### Frontend Structure

```
frontend/
├── css/
│   └── main.css                   # Unified dark theme styles
├── js/
│   ├── user-dashboard.js          # User features & search
│   ├── helper-dashboard.js        # Helper vehicle management
│   ├── admin-dashboard.js         # Admin system management
│   └── login.js                   # Authentication logic
├── login.html                     # Login page
├── register.html                  # Registration page
├── user-dashboard.html            # User interface
├── helper-dashboard.html          # Helper interface
└── admin-dashboard.html           # Admin interface
```

---

## 🔒 Security Features

### 1. Password Security
- **BCrypt hashing** with automatic salt generation
- **Work factor:** 10 rounds (configurable)
- **Minimum password length:** 6 characters
- **No plain-text storage** anywhere in the system

### 2. JWT Authentication
- **Stateless tokens** - no server-side session storage
- **Token structure:** Header + Payload + Signature
- **Expiration:** 24 hours (configurable)
- **Signature:** HMAC SHA-256 with secret key
- **Bearer token** format in Authorization header

### 3. Endpoint Protection
**Public endpoints** (no authentication):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Protected endpoints** (JWT required):
- `GET /api/auth/me` - Current user info
- `/api/user/**` - User endpoints (USER role)
- `/api/helper/**` - Helper endpoints (HELPER role)
- `/api/admin/**` - Admin endpoints (ADMIN role)

### 4. CORS Configuration
- **Allowed origins:** `http://localhost:8080`, `http://localhost:5500`
- **Allowed methods:** GET, POST, PUT, DELETE, OPTIONS
- **Credentials:** Supported for cookie-based auth

### 5. Input Validation
- **Email format** validation
- **Required fields** enforcement
- **Data type** validation
- **SQL injection** prevention (JPA/Hibernate)

### 6. Role-Based Access Control
```java
@PreAuthorize("hasRole('USER')")     // Only users
@PreAuthorize("hasRole('HELPER')")   // Only helpers
@PreAuthorize("hasRole('ADMIN')")    // Only admins
```

---

## 🗄️ Database Structure

### Tables

#### **users**
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- BCrypt hash
    role ENUM('USER', 'HELPER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **vehicle**
```sql
CREATE TABLE vehicle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,           -- CAR, VAN, TRUCK
    city VARCHAR(100) NOT NULL,
    capacity_kg INT NOT NULL,
    license_plate VARCHAR(20),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    helper_id BIGINT NOT NULL,
    FOREIGN KEY (helper_id) REFERENCES users(id)
);
```

#### **booking**
```sql
CREATE TABLE booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    move_date DATETIME NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'CANCELED', 'DONE'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user info |

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "USER"
}
```

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/vehicles/all` | ✅ | Get all active vehicles |
| GET | `/api/user/vehicles?city={city}&type={type}` | ✅ | Search vehicles |
| POST | `/api/user/bookings` | ✅ | Create new booking |
| GET | `/api/user/bookings` | ✅ | Get user's bookings |

**Create Booking:**
```json
{
  "vehicleId": 1,
  "fromAddress": "Rue de la Loi 1, Brussels",
  "toAddress": "Avenue Louise 54, Brussels",
  "moveDate": "2024-12-15T10:00:00"
}
```

### Helper Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/helper/vehicles` | ✅ | Get helper's vehicles |
| POST | `/api/helper/vehicles` | ✅ | Add new vehicle |
| PUT | `/api/helper/vehicles/{id}` | ✅ | Update vehicle |
| DELETE | `/api/helper/vehicles/{id}` | ✅ | Delete vehicle |
| GET | `/api/helper/bookings` | ✅ | Get bookings for helper's vehicles |
| PUT | `/api/helper/bookings/{id}` | ✅ | Update booking status |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ✅ | Get all users |
| GET | `/api/admin/vehicles` | ✅ | Get all vehicles |
| GET | `/api/admin/bookings` | ✅ | Get all bookings |
| DELETE | `/api/admin/users/{id}` | ✅ | Delete user |

---

## 📥 Installation

### Prerequisites
- **Java 17 or higher**
- **Maven 3.6+**
- **MySQL 8.0+**
- **Modern web browser**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NAJJAT/CarryMyStuff.git
   cd CarryMyStuff/backend
   ```

2. **Create MySQL database**
   ```sql
   CREATE DATABASE carrymystuff;
   ```

3. **Configure application.properties**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/carrymystuff
   spring.datasource.username=root
   spring.datasource.password=your_password
   
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   
   jwt.secret=your-secret-key
   jwt.expiration=86400000
   
   server.port=8081
   ```

4. **Build and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Backend runs on `http://localhost:8081`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Serve the frontend**
   ```bash
   python -m http.server 8080
   # or
   npx http-server -p 8080
   ```

3. **Access**
   ```
   http://localhost:8080/login.html
   ```

---

## 🎨 Frontend Features

### User Dashboard

- View all active vehicles on page load
- Search by city with real-time filtering
- Filter by vehicle type (CAR, VAN, TRUCK)
- Select vehicle to create booking
- Manage personal bookings
- Track booking status

### Helper Dashboard

- Add/edit/delete vehicles
- View booking requests
- Accept or reject bookings
- Update booking status
- Track vehicle performance

### Admin Dashboard

- Manage all users
- Oversee all vehicles
- Monitor all bookings
- System statistics

---

## 🔧 Recent Improvements

### 1. Vehicle Search Fix
Updated `VehicleRepository` to use case-insensitive `LIKE` query for cities with spaces.

```java
@Query("SELECT v FROM Vehicle v WHERE LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%'))")
List<Vehicle> findByCityAndActiveTrue(@Param("city") String city);
```

### 2. Browser Caching Fix
Added cache-busting parameters and meta tags.

```html
<meta http-equiv="Cache-Control" content="no-cache">
<script src="js/user-dashboard.js?v=2"></script>
```

### 3. Authentication Enhancement
Login now returns both token and role for proper routing.

```json
{
  "token": "eyJhbGciOi...",
  "role": "USER"
}
```

### 4. Dark Theme UI
Modern dark theme with:
- Blue/purple gradients
- Card-based layouts
- Responsive grid
- Toast notifications

---

## 🧪 Testing

### With Postman

```bash
# Register
POST http://localhost:8081/api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "role": "USER"
}

# Login
POST http://localhost:8081/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Search vehicles
GET http://localhost:8081/api/user/vehicles?city=Brussels
Authorization: Bearer {token}
```

### Frontend Testing

1. Register as USER
2. Login → redirects to user dashboard
3. Search for vehicles
4. Create booking
5. View bookings

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

**NAJJAT**
- GitHub: [@NAJJAT](https://github.com/NAJJAT)
- Repository: [CarryMyStuff](https://github.com/NAJJAT/CarryMyStuff)

---

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] Payment integration
- [ ] Real-time chat
- [ ] Rating system
- [ ] Photo uploads
- [ ] Mobile app
- [ ] Multi-language support

---

**⭐ If you find this project helpful, please give it a star on GitHub! ⭐**

*Built with ❤️ by NAJJAT - Making moving easier for everyone!* 🚚✨
