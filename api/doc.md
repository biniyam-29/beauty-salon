# Beauty Salon Clinic API – Frontend Integration Guide

Welcome to the Beauty Salon Clinic API!  
This document provides all the necessary information for you to integrate a frontend application with our backend services.

**Base URL:**  
`http://localhost:3000`

---

## 1. Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Every request to a protected endpoint must include an `Authorization` header with a Bearer token.

### Authentication Flow
1. The user (staff member) sends their email and password to the `POST /auth/login` endpoint.
2. If the credentials are valid, the API returns a JWT token.
3. This token must be stored securely on the client-side (e.g., in `localStorage` or a secure cookie).
4. For all subsequent requests to protected endpoints, include the token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

### User Roles & Permissions
| Role                | Permissions                                                           |
|---------------------|------------------------------------------------------------------------|
| **admin**     | Full access to all endpoints, including user management.               |
| **doctor**          | Manage assigned customers, create consultations, prescribe products.  |
| **reception**       | Create & manage customer profiles, view reminder list.                 |
| **inventory-manager** | Manage products.                                                     |

---

## 2. API Endpoints

All request and response bodies are in **JSON** format.

---

### 👤 Authentication (`/auth`)
| Method | Endpoint     | Description                | Permissions |
|--------|--------------|----------------------------|-------------|
| POST   | `/auth/login` | Logs in a user & returns JWT token. | Public |

**Request Body:**
```json
{
    "email": "admin@test.com",
    "password": "password123"
}
```

**Success Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1Ni...",
    "payload": { "id": 1, "name": "Admin User", "..." }
}
```

---

### ⚙️ Lookups (`/lookups`)
| Method | Endpoint                     | Description                | Permissions |
|--------|------------------------------|----------------------------|-------------|
| GET    | `/lookups/skin-concerns`     | Get all skin concerns.     | Public      |
| GET    | `/lookups/health-conditions` | Get all health conditions. | Public      |

**Example Response (`/lookups/skin-concerns`):**
```json
[
    { "id": 1, "name": "Acne" },
    { "id": 2, "name": "Wrinkles" }
]
```

---

### 👥 User Management (`/users`)
| Method | Endpoint               | Description                  | Permissions |
|--------|------------------------|------------------------------|-------------|
| POST   | `/users`               | Create new staff member.     | admin |
| GET    | `/users`               | Get paginated list of users. | admin |
| GET    | `/users/role/{role}`   | Get users by role.           | admin |
| GET    | `/users/{id}`          | Get single user by ID.       | admin |
| PUT    | `/users/{id}`          | Update user details.         | admin |
| DELETE | `/users/{id}`          | Deactivate user account.     | admin |

---

### 🧑‍🤝‍🧑 Customer Management (`/customers`)
| Method | Endpoint                                        | Description                               | Permissions |
|--------|-------------------------------------------------|-------------------------------------------|-------------|
| POST   | `/customers`                                    | Create customer with full profile.        | reception+  |
| GET    | `/customers`                                    | Get paginated list of customers.          | reception+  |
| GET    | `/customers/{id}`                               | Get customer profile by ID.               | reception+  |
| PUT    | `/customers/{id}`                               | Update customer details.                  | reception+  |
| POST   | `/customers/{id}/consent`                       | Add consent signature.                    | reception+  |
| POST   | `/customers/{id}/skin-concerns`                 | Add skin concern to customer.             | reception+  |
| DELETE | `/customers/{id}/skin-concerns/{concernId}`     | Remove skin concern.                      | reception+  |
| PUT    | `/customers/{id}/skin-concerns/{concernId}`     | Mark skin concern as resolved.            | reception+  |

**Example POST `/customers` Request:**
```json
{
    "full_name": "New Patient",
    "phone": "0987654321",
    "assigned_doctor_id": 2,
    "profile": { "...": "..." },
    "skin_concerns": [1, 5],
    "health_conditions": [2],
    "consent": {
        "signature_data": "data:image/png;base64,...",
        "consent_date": "2025-08-15"
    }
}
```

---

### 🩺 Consultation Management (`/consultations` & `/customers`)
| Method | Endpoint                                        | Description                               | Permissions |
|--------|-------------------------------------------------|-------------------------------------------|-------------|
| POST   | `/consultations`                                | Create new consultation for customer.     | doctor+     |
| GET    | `/customers/{id}/consultations`                 | Get all consultations for a customer.     | doctor+     |
| GET    | `/consultations/{id}`                           | Get consultation by ID.                   | doctor+     |
| PUT    | `/consultations/{id}`                           | Update consultation notes/goals.          | doctor+     |

**Example POST `/consultations` Request:**
```json
{
    "customer_id": 1,
    "doctor_id": 2,
    "is_first_facial": false,
    "treatment_goals_today": ["Reduce redness"],
    "doctor_notes": "Client has sensitive skin."
}
```

---

### 🧴 Product Management (`/products`)
| Method | Endpoint          | Description                   | Permissions       |
|--------|-------------------|-------------------------------|-------------------|
| POST   | `/products`       | Create new product.           | inventory-manager+|
| GET    | `/products`       | Get paginated list of products.| All Staff         |
| GET    | `/products/{id}`  | Get product by ID.             | All Staff         |
| PUT    | `/products/{id}`  | Update product details.        | inventory-manager+|
| DELETE | `/products/{id}`  | Delete product.                | inventory-manager+|

---

### 📝 Prescription Management (`/consultations` & `/prescriptions`)
| Method | Endpoint                                  | Description                     | Permissions |
|--------|-------------------------------------------|-----------------------------------|-------------|
| POST   | `/consultations/{id}/prescriptions`       | Add prescription to consultation.| doctor+     |
| GET    | `/consultations/{id}/prescriptions`       | Get prescriptions for consultation.| doctor+   |
| PUT    | `/prescriptions/{id}`                     | Update prescription details.      | doctor+     |
| DELETE | `/prescriptions/{id}`                     | Delete prescription.              | doctor+     |

---

### 🖼️ Image Management (`/consultations` & `/images`)
| Method | Endpoint                        | Description                  | Permissions |
|--------|----------------------------------|------------------------------|-------------|
| POST   | `/consultations/{id}/images`    | Upload image for consultation.| doctor+     |
| GET    | `/consultations/{id}/images`    | Get images for consultation.  | doctor+     |
| DELETE | `/images/{id}`                  | Delete specific image.        | doctor+     |

**Note on Image Upload:**  
- Must be sent as `multipart/form-data`
- Required field: `image` (file)  
- Optional field: `description` (string)

---

### 📞 Reminder Management (`/reminders`)
| Method | Endpoint        | Description                       | Permissions |
|--------|-----------------|-----------------------------------|-------------|
| GET    | `/reminders`    | Get customers to remind.          | reception+  |
| POST   | `/reminders`    | Log reminder completion.          | reception+  |

---

## 3. Workflow Example – First-Time Patient Visit
1. **Receptionist Logs In:**  
   `POST /auth/login` → get token.
2. **Receptionist Fetches Data for Forms:**  
   - `GET /lookups/skin-concerns`  
   - `GET /lookups/health-conditions`  
   - `GET /users/role/doctor`
3. **Receptionist Creates Customer:**  
   `POST /customers` with full profile & `assigned_doctor_id`.
4. **Doctor Logs In:**  
   `POST /auth/login` → get token.
5. **Doctor Views Patient Queue:**  
   `GET /customers`