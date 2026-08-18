<p align="center">
  <h1 align="center">🏥 Chirper — Modern Healthcare & Clinic Management ERP</h1>
  <p align="center">
    <strong>An end-to-end, multi-branch Electronic Medical Records (EMR), AI-powered clinical assistant, real-time appointment booking, billing, and practice management platform.</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-v13.x-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel 13">
  <img src="https://img.shields.io/badge/Inertia.js-v2.0-9553E9?style=for-the-badge&logo=inertia" alt="Inertia.js v2">
  <img src="https://img.shields.io/badge/React-v18.x-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind v4">
  <img src="https://img.shields.io/badge/PHP-v8.3+-777BB4?style=for-the-badge&logo=php" alt="PHP 8.3+">
  <img src="https://img.shields.io/badge/Pest_PHP-v4.x-FF4088?style=for-the-badge&logo=pest" alt="Pest 4">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features & System Modules](#-key-features--system-modules)
- [Architecture & System Design Decisions](#-architecture--system-design-decisions)
- [Tech Stack](#-tech-stack)
- [Environment Configuration & Database Setup](#-environment-configuration--database-setup)
- [Getting Started](#-getting-started)
- [Default Demo Credentials](#-default-demo-credentials)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

**Chirper** is a production-grade Practice Management ERP designed for modern outpatient clinics, chiropractic practices, and multi-specialty healthcare centers. 

It unifies **Electronic Medical Records (EMR)**, **AI Clinical Assistance**, **Patient Self-Booking**, **Insurance Claim Workflows**, **Billing & Invoicing**, and **Multi-Branch Resource Isolation** into a seamless, high-performance web application.

Rather than acting as a traditional REST backend with separate client apps, Chirper leverages **Laravel 13 + Inertia.js v2 + React 18** to deliver a reactive Single Page Application (SPA) experience with complete server-side security, strict static typing, and zero API boilerplate overhead.

---

## ⚡ Key Features & System Modules

### 🩺 1. Electronic Medical Records (EMR) & Diagnostic Imaging
- **Patient Health Profiles**: Complete medical history, vitals log, ongoing conditions, emergency contacts, and active prescriptions.
- **Diagnostic Radiology Viewer**: Upload and compare X-Ray, MRI, and CT scan images side-by-side with zoom and inspection tooling.
- **Session Notes & Attachments**: Attach PDF reports, lab results, and clinical documents directly to patient encounter logs.

### 🤖 2. AI Clinical Assistant
- **Automated SOAP Notes**: Summarize raw clinical notes into structured Subjective, Objective, Assessment, and Plan format.
- **ICD-10 Code Suggestion**: Intelligent diagnostic suggestions based on doctor observations and chief complaints.
- **Treatment Plan Generation**: Automated drafting of multi-session care strategies and rehabilitation milestones.
- **Patient Visit Summaries**: One-click generation of patient-friendly discharge summaries.

### 📅 3. Real-Time Appointment Engine & Patient Booking Portal
- **Real-Time Slot Availability**: Algorithmic slot generation with zero double-booking across doctors and branch schedules.
- **Self-Service Patient Booking**: Intuitive booking portal wizard allowing patients to choose services, doctors, and time slots.
- **Status Lifecycle & Rescheduling**: Full status tracking (`scheduled`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`).

### 📝 4. Custom Intake Form Builder & Digital E-Signatures
- **No-Code Drag-and-Drop Form Builder**: Build custom patient intake forms with text inputs, dropdowns, checkboxes, and date selectors.
- **Public Patient Intake Portal**: Shareable public intake URLs for online patient registration prior to visits.
- **E-Signature Digital Consent**: Legally-binding digital signature capture for informed consent forms with timestamp audit logs.

### 💳 5. Billing, Financial Dashboards & Insurance Claims Lifecycle
- **Automated Invoicing Engine**: Itemized invoices tied to treatment sessions, diagnostic imaging, and medication.
- **Payment Gateway Log**: Record partial and full payments with real-time balance remaining calculations.
- **Insurance Policy & Claims Management**: Track patient insurance policies, generate claims, and manage claims submission workflows (`pending` → `submitted` → `approved` / `rejected`).
- **Financial Analytics**: Interactive visual dashboards (Chart.js) charting total revenue, outstanding collections, and claim approval rates.

### 📦 6. Clinic Inventory & Supply Stock Management
- **Automated Stock Deduction**: Automatically decrement supply stock upon logging treatment sessions.
- **Restock Workflows & Low Stock Alerts**: Threshold monitoring with instant notification triggers for critical medical supplies.

### 🏢 7. Multi-Branch Operations & HR Attendance Portal
- **Branch Context Switching**: Seamless switching between clinic branches with database-level isolation.
- **Staff Attendance & Working Hours**: Biometric/manual clock-in/clock-out tracking with overtime calculations.
- **Leave Request Management**: Vacation and sick leave submission and administrative approval workflow.

### 📊 8. Reports & Analytics Export Engine
- **KPI Dashboard**: Patient retention rates, appointment show rates, and revenue metrics.
- **Multi-Format Export**: One-click export of clinical and financial reports into formatted PDF and CSV files.

---

## 📐 Architecture & System Design Decisions

### 1. Modern Monolith via Inertia.js v2
* **Trade-off Decision**: Instead of building decoupled Microservices or separate REST/GraphQL endpoints + SPA clients (which introduces network latency, serialization overhead, and duplicate validation logic), Chirper uses **Inertia.js v2**.
* **Benefit**: Retains single-repository developer velocity, server-driven routing, full PHP authorization middleware, and seamless React component state.

### 2. Overlap-Free Slot Allocation Algorithm
* **Design Pattern**: Appointment slot availability calculation computes physician working hours minus existing bookings and branch closures.
* **Concurrency Protection**: Atomic database transactions combined with unique date-time-physician indexes eliminate double-booking even under concurrent traffic spikes.

### 3. Dynamic JSON Schema Pattern for Custom Forms
* **Design Pattern**: Custom forms store element definitions as validated JSON schemas in PostgreSQL/SQLite columns rather than dynamic database table migrations.
* **Benefit**: Enables non-technical clinic administrators to construct arbitrarily complex intake questionnaires instantly without requiring database schema updates.

### 4. RBAC & Multi-Branch Context Middleware
* **Security Model**: Strict authorization layers (`EnsureHasRole`) guard administrative, financial, and clinical endpoints.
* **Branch Isolation**: User session context binds clinic operational queries to active branch IDs to prevent cross-location data bleeding.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | [Laravel 13.x](https://laravel.com) |
| **Frontend Adapter** | [Inertia.js 2.0](https://inertiajs.com) |
| **Frontend Framework** | [React 18](https://react.dev) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com), [Headless UI](https://headlessui.com) |
| **Language** | PHP 8.3+ / TypeScript 5.x |
| **Database** | SQLite (Default / Zero-config) / MySQL / PostgreSQL |
| **Testing Framework** | [Pest PHP 4.x](https://pestphp.com) |
| **Code Formatter** | [Laravel Pint](https://laravel.com/docs/pint) |
| **Development Server** | Vite 8.x + Concurrently |

---

## ⚙️ Environment Configuration & Database Setup

Chirper follows strict environment separation standards. All database credentials, mail drivers, API keys, and application configs are externalized into `.env`.

### Environment Template (`.env.example`)
```ini
APP_NAME="Chirper Clinic ERP"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration (Default: SQLite)
DB_CONNECTION=sqlite
# For MySQL / PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=chirper
# DB_USERNAME=root
# DB_PASSWORD=secret

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Mailer Driver
MAIL_MAILER=log
```

---

## 🚀 Getting Started

### Prerequisites
- **PHP** >= 8.3 with SQLite/MySQL extensions
- **Composer** >= 2.x
- **Node.js** >= 18.x & **npm**

### Quick Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdUllahO7/Chriper.git
   cd Chirper
   ```

2. **Run Automated Setup Script**:
   ```bash
   composer run setup
   ```
   *(This automatically installs PHP dependencies, creates `.env`, generates app keys, runs migrations, installs npm packages, and builds frontend assets).*

3. **Or Manual Installation**:
   ```bash
   # Install PHP dependencies
   composer install

   # Setup Environment File
   cp .env.example .env
   php artisan key:generate

   # Run Database Migrations & Seeders
   php artisan migrate:fresh --seed

   # Install & Build Frontend Assets
   npm install
   npm run build
   ```

4. **Start Development Environment**:
   ```bash
   composer run dev
   ```
   *(Launches HTTP server, queue listener, log streamer, and Vite dev server simultaneously).*

5. **Access Application**:
   Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🔐 Default Demo Credentials

When running `php artisan db:seed` or `php artisan migrate --seed`, the database is populated with full demo data and 3 default user roles:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@chirper.com` | `password` | Full System Access, Financials, Settings, User Management |
| **Clinic Receptionist** | `receptionist@chirper.com` | `password` | Appointments, Patient Registration, Billing, Attendance |
| **Chiropractor / Doctor** | `chiropractor@chirper.com` | `password` | EMR Records, AI Clinical Assistant, Treatment Plans, Imaging |

---

## 🧪 Testing & Quality Assurance

Chirper uses **Pest 4** for unit and feature testing.

### Running Test Suite

```bash
# Run all automated tests
php artisan test

# Run tests with compact summary
php artisan test --compact

# Filter specific test suite
php artisan test --filter=AppointmentTest
```

### Key Tested Workflows
- ✅ User Authentication & Role-Based Access Enforcement
- ✅ Patient Profile CRUD & EMR Attachment Validation
- ✅ Doctor Availability & Overlap Slot Calculation
- ✅ Invoicing Status Transitions (Unpaid / Paid / Overdue)
- ✅ Insurance Claim Filing & Status Workflow
- ✅ Attendance Clock-In / Clock-Out Computations

### Code Formatting
```bash
# Format PHP code to Laravel standards
vendor/bin/pint --dirty
```

---

## 📂 Project Structure

```
chirper/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # EMR, AI, Billing, Booking & Admin Controllers
│   │   └── Middleware/        # RBAC & Branch Context Middleware
│   └── Models/                # Eloquent Models (Patient, Doctor, Invoice, etc.)
├── database/
│   ├── factories/             # Model Factories for Testing & Seeding
│   ├── migrations/            # Database Schema Migrations
│   └── seeders/               # Production-grade Seeder Dataset
├── resources/
│   └── js/                    # React 18 + Inertia.js Pages & Components
│       ├── Components/        # UI Design System (Cards, Modals, Tables, Charts)
│       ├── Layouts/           # Authenticated & Guest Application Shells
│       └── Pages/             # Application Views (Dashboard, EMR, Booking, etc.)
├── routes/
│   ├── web.php                # Inertia Authenticated Routes
│   └── auth.php               # Authentication Gateway Routes
├── tests/
│   └── Feature/               # Pest PHP Integration & Business Logic Tests
├── CLAUDE.md                  # Project Architecture Guidelines
└── README.md                  # Project Documentation
```

---

## 📄 License

This application is open-source software licensed under the [MIT License](LICENSE).

---

<p align="center">
  Crafted with ❤️ for Modern Healthcare Software Excellence.
</p>

