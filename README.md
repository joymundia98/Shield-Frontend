# Church / Organization Management System – Frontend

---

# 📌 Executive Summary

This frontend application is a **modular, enterprise-grade, multi-tenant Church / Organization Management System** built using **React + TypeScript + Vite**.

It is architected using a **feature-driven (domain-based) modular structure**, enabling scalability, maintainability, and clean separation of concerns across multiple organizational domains.

The system supports:

* Multi-tenant organizational hierarchy (HQ → Branch)
* Role-Based Access Control (RBAC)
* Secure authentication & protected routing
* Financial management
* Human resource management
* Asset tracking & depreciation
* Congregation & membership management
* Donor & donation tracking
* Program & event management
* Governance oversight

This structure is designed for **long-term production scalability**, team collaboration, and enterprise-level extensibility.

---

# 🏗 System Architecture Overview

## 🧱 Architectural Philosophy

The frontend follows:

> **Feature-Based Modular Architecture with Layered Separation**

Instead of grouping by file type (components, services, etc.), the system is grouped by **business domain modules**, improving:

* Team scalability
* Domain ownership
* Reduced coupling
* Clear feature boundaries
* Long-term maintainability

---

# 🛠 Tech Stack

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| React (TypeScript) | UI framework                |
| Vite               | Build tool & dev server     |
| React Router       | Client-side routing         |
| Context API        | Global state management     |
| Custom Hooks       | Business logic abstraction  |
| Axios (API Layer)  | Backend communication       |
| Environment Config | Dev / Production separation |
| Vercel             | Deployment platform         |

---

# 📂 High-Level Project Structure

```
client/
│
├── dist/                     # Production build output
├── node_modules/             # Installed dependencies
├── public/                   # Static public assets
├── src/                      # Main application source
│   ├── api/                  # API communication layer
│   ├── assets/               # Images & media
│   ├── components/           # Reusable UI components
│   ├── constants/            # Static configuration
│   ├── context/              # Global state providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Feature/domain modules
│   ├── styles/               # Global styling
│   ├── utils/                # Utility helpers
│   ├── App.tsx               # Root application component
│   └── main.tsx              # Application entry point
│
├── .env.local
├── .env.production
├── vite.config.ts
├── package.json
└── vercel.json
```

---

# 📊 File Statistics

> Based strictly on the provided directory structure.

## 🔢 Estimated Totals

| Category                   | Approximate Count |
| -------------------------- | ----------------- |
| Total Project Files        | 210+              |
| Files inside `src/`        | 165+              |
| Feature/Page Files         | 110+              |
| Image Assets               | 35+               |
| Config / SQL / Environment | 15+               |

This indicates a **large-scale frontend application**, not a small prototype.

---

# 📁 Domain Module Breakdown (`src/pages/`)

Each module represents an independent business domain.

| Module          | File Count | Responsibility                            |
| --------------- | ---------- | ----------------------------------------- |
| Assets          | 14         | Asset tracking, depreciation, maintenance |
| Congregation    | 20         | Members, visitors, converts, attendance   |
| Donor           | 13         | Donors, donations, categories             |
| Finance         | 16         | Income, expenses, budgets, payroll        |
| HR              | 16         | Staff, leave, payroll, departments        |
| HQ              | 11         | Branch oversight, admin control           |
| Organization    | 20         | Org profile, roles, permissions           |
| Programs        | 11         | Events, attendees, calendar               |
| Governance      | 2          | Governance dashboards                     |
| Ministry        | 2          | Ministry oversight                        |
| Pastoral        | 1          | Pastoral dashboard                        |
| Class           | 1          | Class dashboard                           |
| Landing         | 5          | Marketing pages                           |
| Expired Session | 2          | Session management                        |
| Core Pages      | 10         | Login, dashboard, errors, global pages    |

Total modules: **15+ feature domains**

---

# 🔐 Security & Access Control Architecture

The system implements **Role-Based Access Control (RBAC)** via:

* `AuthContext`
* `permissionsMap`
* `ProtectedRoute`
* Role-based routing guards

## Access Flow

1. User logs in
2. Auth token stored
3. User role retrieved
4. Permissions mapped
5. Routes conditionally rendered
6. Unauthorized routes redirect to Forbidden page

This ensures:

* Secure page access
* Permission-driven UI rendering
* Multi-level administrative control

---

# 🧠 Application Layer Architecture

## 1️⃣ Presentation Layer

**Location:**

* `pages/`
* `components/`
* CSS files

Responsibilities:

* UI rendering
* User interaction
* Form handling
* Dashboard layouts

---

## 2️⃣ Domain Layer (Feature Modules)

Each folder inside `pages/` encapsulates:

* Dashboard
* CRUD operations
* Views
* Edit forms
* Upload functionality
* Domain-specific headers

Each module operates semi-independently.

---

## 3️⃣ State Management Layer

**Location:**

* `context/`
* `hooks/`

Responsibilities:

* Authentication state
* Global asset state
* Permission mapping
* Session handling

Pattern used:

> React Context + Custom Hooks

---

## 4️⃣ API Layer

**Location:**

* `api/api.ts`
* `api/auth.ts`
* `constants/api.ts`

Responsibilities:

* Axios configuration
* Token injection
* Centralized API endpoints
* Backend communication abstraction

Benefits:

* Cleaner page components
* Reusable API logic
* Easy backend switching

---

## 5️⃣ Configuration Layer

* `.env.local`
* `.env.production`
* `vite.config.ts`
* `vercel.json`

Enables:

* Environment-specific builds
* Production optimization
* Deployment portability

---

# 🖼 Detailed Visual Architecture Diagram

```
                               ┌────────────────────────┐
                               │         Browser        │
                               └────────────┬───────────┘
                                            │
                               ┌────────────▼───────────┐
                               │      React Router      │
                               └────────────┬───────────┘
                                            │
         ┌────────────────────────────────────────────────────────────┐
         │                     Feature Modules                        │
         │  HQ | Org | Finance | HR | Assets | Donor | Programs      │
         │  Congregation | Governance | Ministry | etc                │
         └────────────────────────────────────────────────────────────┘
                                            │
                               ┌────────────▼───────────┐
                               │     Reusable Components │
                               └────────────┬───────────┘
                                            │
                               ┌────────────▼───────────┐
                               │   Context Providers     │
                               │  (Auth, Assets, Roles)  │
                               └────────────┬───────────┘
                                            │
                               ┌────────────▼───────────┐
                               │      Custom Hooks       │
                               └────────────┬───────────┘
                                            │
                               ┌────────────▼───────────┐
                               │        API Layer        │
                               │  Axios + Endpoints      │
                               └────────────┬───────────┘
                                            │
                               ┌────────────▼───────────┐
                               │        Backend API      │
                               └────────────────────────┘
```

---

# 📈 Scalability & Engineering Strengths

✔ Domain isolation
✔ Clear role-permission mapping
✔ Multi-tenant readiness
✔ Strong separation of concerns
✔ Production build optimization (Vite)
✔ Environment isolation
✔ Modular growth capability
✔ Enterprise-ready structure

---

# 🚀 Production Readiness Indicators

* Structured feature modules
* Centralized API layer
* Role-based route guards
* Organized context providers
* Deployment configuration
* Separate environment configs
* Strong TypeScript typing

This is not a prototype structure — it is built for scale.

---

# 🛠 Suggested Future Enhancements

* Add lazy loading for modules
* Introduce centralized UI component library
* Add testing layer (Jest / React Testing Library)
* Add CI/CD pipeline
* Introduce performance monitoring
* Add documentation per module

---

# 🏁 Conclusion

This frontend application demonstrates:

* Enterprise-level modular architecture
* Clear domain separation
* Secure access control
* Scalable feature growth
* Clean API abstraction
* Deployment readiness

It is well-suited for:

* Large church networks
* Multi-branch organizations
* Non-profits
* Institutional management platforms
* SaaS conversion in the future

---

# 📚 Recommended Additional Documentation Files

To elevate this to enterprise-grade documentation:

* `ARCHITECTURE.md`
* `PERMISSIONS_MATRIX.md`
* `ENVIRONMENT_SETUP.md`
* `DEPLOYMENT_GUIDE.md`
* `CONTRIBUTING.md`
* `CHANGELOG.md`

---

**Maintained with a domain-driven, scalable, production-first philosophy.**
