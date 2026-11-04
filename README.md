# Book Bank Management System

A modern full-stack web application designed to automate and streamline academic library operations: student accounts, book catalog search, issues, returns, reservations, inventory control, vendor orders, fines, and administrative reporting.

---

##  Project Overview

The **Book Bank Management System** modernizes traditional academic library operations into a responsive, modular web platform. It caters to distinct user roles with dedicated interfaces:

- **Students / Members:** Search catalogue, view availability, reserve out-of-stock titles, track active loans, and review fine histories.
- **Librarians / Administrators:** Manage book catalog, track real-time issue/return workflows, monitor overdue loans, manage vendor procurement, and generate summary reports.
- **Vendors:** Manage and fulfill book procurement orders.

---

## 🛠️ Architecture & Tech Stack

### Frontend (`book-bank-ui`)
- **Core:** React 19, Vite
- **Styling:** Bespoke Vanilla CSS with design tokens, responsive layouts, and curated typography (`Fraunces` editorial serif + `IBM Plex Mono` / `JetBrains Mono`)
- **State & Auth:** React Context API (`AuthContext`) with persistent session handling
- **Routing:** Hash-based SPA router with role-gated admin views

### Search Microservice (`book-search-api`)
- **Framework:** Python 3, FastAPI, Uvicorn
- **Integration:** Google Books API client for metadata and cover retrieval
- **Configuration:** Python-dotenv, Pydantic settings

### Core Backend & Database *(in development)*
- **API Engine:** Python, Django REST Framework
- **Database:** PostgreSQL
- **Security:** JWT authentication, role-based access control (RBAC), bcrypt hashing

---

## 📂 Repository Structure

```text
Book_Management_system/
├── book-bank-ui/             # React + Vite frontend application
│   ├── public/               # Static assets & icons
│   └── src/
│       ├── components/       # Reusable UI components (Tag, Navbar, Cards)
│       ├── context/          # AuthContext & global state
│       ├── data/             # Mock books catalogue & test data
│       ├── pages/            # Page views (Landing, Catalog, Detail, Account, Admin)
│       ├── App.jsx           # Client router
│       ├── index.css         # Global design tokens & styling
│       └── main.jsx          # App entry point
├── book-search-api/          # FastAPI service for book discovery
│   ├── config.py             # App configuration & environment variables
│   ├── google_books.py       # Google Books API integration
│   ├── main.py               # API routes & server entry
│   └── requirements.txt      # Python dependencies
├── GIT_WORKFLOW.md           # Branching strategy & collaboration guide
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18 or newer
- **Python:** 3.10 or newer
- **Git**

---

### 1. Frontend Setup (`book-bank-ui`)

```bash
cd book-bank-ui

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be accessible at: `http://localhost:5173`

#### Demo Test Credentials:
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | Any email (or register new) | any password | Catalogue search, account dashboard, reservations |
| **Librarian / Admin** | `admin@bookbank.edu` | `admin123` | Full Admin Shell access (`#admin`), catalogue management, stat chips |

---

### 2. Search Microservice Setup (`book-search-api`)

```bash
cd book-search-api

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --port 8000
```

Interactive API documentation will be available at: `http://localhost:8000/docs`

---

## 📖 Key Workflows

1. **Book Discovery & Search:**
   - Filter by category, author, keyword, or ISBN.
   - Real-time status indicators: `Available`, `Reserved`, or `Out of Stock`.

2. **Issue & Return Lifecycle:**
   - Real-time tracking of borrowed books and due dates.
   - Fine computation for overdue returns.

3. **Smart Reservation System:**
   - When all copies of a book are checked out, students can place a reservation queue request.
   - Automatic notification triggers when a returned book becomes ready for pickup.

4. **Admin Shell & Catalogue Management:**
   - Fixed ink-green navigation bar (`240px`) with distinct administrative density rules.
   - Real-time stat chips: Total Books, Books on Loan, Overdue Count.
   - Dedicated table controls for catalogue operations.

---

##  Git & Branching Strategy

The repository follows a role-based feature-branching model (see [`GIT_WORKFLOW.md`](./GIT_WORKFLOW.md) for full details):

- `main`: Production-ready, stable releases.
- `develop`: Integration branch for tested features.
- `frontend`: Frontend development (`book-bank-ui`).
- `backend`: Backend API development.
- `database`: Database migrations, schemas, and seed scripts.

---

## 📄 License

This project is developed as part of the Software Engineering Lab curriculum. All rights reserved.
