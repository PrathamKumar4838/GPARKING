# GPARKING
# 🚗 G PARKING - Smart Campus Parking System


 📖 Overview
**G PARKING** is a modern, web-based parking management solution built to tackle chaotic parking issues on college campuses. It replaces manual, disorganized parking with a **real-time digital dashboard**, ensuring distinct zones for Cars and Bikes while enforcing strict fair-usage policies.

This project was developed  to demonstrate a functional prototype solving a real-world logistics problem.

---

 🌟 Key Features

 1. 🅿️ Zone-Based Parking
- Car Zone (C01-C05):** Restricted strictly for 4-wheelers.
- Bike Zone (B01-B05):** Dedicated slots for 2-wheelers.
- Smart Validation:** The system automatically blocks a Car user from booking a Bike slot and vice versa.

2. ⚡ Real-Time Cloud Sync
- Integrated with **Google Firebase Realtime Database**.
- Bookings update **instantly** across all connected devices (Laptops/Mobiles) without refreshing the page.

 3. 🔐 Role-Based Access Control
- **Student Mode:**
  - One-time permanent vehicle registration.
  - Visual dashboard to find and book empty slots.
  - Prevention of double-booking (One Vehicle = One Slot).
- **Admin Mode:**
  - Full overview of who parked where (Vehicle No + Student Name).
  - Ability to **Force Cancel** any booking.
  - "Reset All" capability for end-of-day maintenance.

4. 🎨 Modern UI (Glassmorphism)
- Clean, responsive interface using Glassmorphism design principles.
- Laptop-optimized dashboard with a sidebar layout.
- Video/Gradient backgrounds for a premium look.

---

 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6 Modules) |
| **Backend** | Google Firebase (Realtime Database) |
| **Authentication** | Custom Logic via Firebase DB |
| **Design** | CSS Glassmorphism, FontAwesome Icons |

---



