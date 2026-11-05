# Book Bank — Backend

Django REST Framework backend for the Book Bank Management System.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Python 3.11+, Django 4.2, Django REST Framework 3.15 |
| Auth | JWT via `djangorestframework-simplejwt` (access + refresh + blacklist) |
| Database | PostgreSQL (default) or SQLite (for quick local dev) |
| Filtering | `django-filter` |
| File Uploads | `Pillow` (document uploads) |

---

## Quick Start

### 1. Create & activate virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set SECRET_KEY, DB_* credentials, etc.
# For quick dev with SQLite: set USE_SQLITE=True in .env
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create the librarian account

```bash
python manage.py create_librarian --email librarian@bookbank.local --password Library@123
```

### 6. Seed sample books (optional)

```bash
python manage.py seed_books
```

### 7. Start the development server

```bash
python manage.py runserver 8001
```

The API is now available at `http://localhost:8001/`.
Django Admin panel: `http://localhost:8001/admin/`

---

## Running Tests

```bash
# Install pytest-django (already in requirements.txt)
pytest                        # all tests
pytest tests.py -v            # verbose
pytest tests.py -k "auth"     # filter by name
```

> Tests use SQLite in-memory automatically via `pytest.ini`.

---

## Scheduled Background Jobs

Run these daily via cron or Windows Task Scheduler:

```bash
# 1. Mark overdue loans and notify students (run at midnight)
python manage.py update_overdue_status

# 2. Send due-soon reminders (run at 8 AM)
python manage.py send_due_soon_notifications

# Dry-run preview (no DB changes):
python manage.py update_overdue_status --dry-run
python manage.py send_due_soon_notifications --dry-run --days 5
```

### Windows Task Scheduler (example)

Create two tasks in Task Scheduler pointing to:
```
pythonw.exe "D:\book bank\Book_bank\backend\manage.py" update_overdue_status
pythonw.exe "D:\book bank\Book_bank\backend\manage.py" send_due_soon_notifications
```

---

## API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register/` | Public | Register new student |
| POST | `/api/auth/login/` | Public | Login → JWT tokens |
| POST | `/api/auth/logout/` | Auth | Blacklist refresh token |
| POST | `/api/auth/refresh/` | Public | Get new access token |
| GET  | `/api/auth/me/` | Auth | Current user profile |
| POST | `/api/auth/change-password/` | Auth | Change own password |
| POST | `/api/auth/create-vendor/` | Librarian | Create vendor account |

### Books
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/books/` | Auth | Paginated catalogue |
| GET | `/api/books/search/?q=` | Auth | Full-text search |
| GET | `/api/books/categories/` | Auth | List all categories |
| GET | `/api/books/<accession>/` | Auth | Book detail |
| POST | `/api/books/` | Librarian | Add book |
| PUT | `/api/books/<accession>/` | Librarian | Update book |
| DELETE | `/api/books/<accession>/` | Librarian | Soft-delete |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/students/` | Auth | List students |
| GET | `/api/students/me/` | Student | Own profile |
| GET | `/api/students/<id>/loans/` | Auth | Active loans |
| GET | `/api/students/<id>/history/` | Auth | Loan history |
| GET | `/api/students/<id>/reservations/` | Auth | Reservations |
| GET | `/api/students/<id>/fines/` | Auth | Fines |
| GET/POST | `/api/students/<id>/documents/` | Auth | Documents |
| DELETE | `/api/students/<id>/documents/<doc_id>/` | Auth | Delete document |

### Issues (Checkout)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/issues/` | Auth | List issues |
| POST | `/api/issues/` | Student | Request checkout |
| GET | `/api/issues/<pk>/` | Auth | Issue detail |
| POST | `/api/issues/<pk>/renew/` | Auth | Renew loan |
| POST | `/api/issues/mark-overdue/` | Librarian | Mark overdue issues |

### Returns
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/returns/` | Auth | List returns |
| POST | `/api/returns/` | Librarian | Process a return |
| GET | `/api/returns/<pk>/` | Auth | Return detail |

### Reservations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reservations/` | Auth | List reservations |
| POST | `/api/reservations/` | Student | Create reservation |
| GET | `/api/reservations/<pk>/` | Auth | Reservation detail |
| PUT | `/api/reservations/<pk>/cancel/` | Auth | Cancel reservation |
| POST | `/api/reservations/<pk>/fulfill/` | Librarian | Fulfill reservation → creates issue |

### Fines
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/fines/` | Auth | List fines |
| GET | `/api/fines/<pk>/` | Auth | Fine detail |
| POST | `/api/fines/<pk>/pay/` | Auth | Mark paid |
| POST | `/api/fines/<pk>/waive/` | Librarian | Waive fine |

### Vendors
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET/POST | `/api/vendors/` | Librarian | List/create vendors |
| GET/PUT/DELETE | `/api/vendors/<id>/` | Librarian | CRUD |

### Purchase Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET/POST | `/api/orders/` | Lib/Vendor | List/create orders |
| GET/PUT | `/api/orders/<pk>/` | Lib/Vendor | Detail/update status |
| POST | `/api/orders/<pk>/items/` | Lib/Vendor | Add line item |

### Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications/` | Auth | Own notifications |
| PUT | `/api/notifications/<pk>/read/` | Auth | Mark read |
| POST | `/api/notifications/mark-all-read/` | Auth | Mark all read |
| DELETE | `/api/notifications/<pk>/` | Auth | Delete notification |

### Reports (Librarian only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary/` | Dashboard stats |
| GET | `/api/reports/issued/` | Active loans |
| GET | `/api/reports/overdue/` | Overdue books |
| GET | `/api/reports/inventory/` | Inventory by category |
| GET | `/api/reports/fines/` | All fines |
| GET | `/api/reports/students/` | Student summary |

---

## Business Rules

| Rule | Default | Setting |
|------|---------|---------|
| Fine per overdue day | ₹2 | `FINE_PER_DAY` |
| Loan duration | 14 days | `LOAN_DURATION_DAYS` |
| Max renewals per loan | 2 | `MAX_RENEWALS` |
| Borrowing limit per student | 3 books | `DEFAULT_BORROWING_LIMIT` |
| Reservation pickup deadline | 3 days | `PICKUP_DEADLINE_DAYS` |
| Due-soon alert window | 3 days | `DUE_SOON_DAYS` |

---

## Git Workflow

This backend lives on the `backend` branch. See `GIT_WORKFLOW.md` in the repo root.

```bash
git switch backend
git pull origin backend
# ... make changes ...
git add .
git commit -m "feat: add <feature>"
git push origin backend
# Then open PR: backend → develop
```

