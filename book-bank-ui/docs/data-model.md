# Book Bank Management System — Shared Data Model & Business Rules Contract

> **Implementation Note:** All entities are maintained in a single synchronized source of truth (`src/data/libraryStore.jsx`), persisting in `localStorage` (`bb_library_data_v2`) and dynamically synchronizing across open browser tabs via `window.addEventListener('storage', ...)`.
> `// TODO: replace with backend API calls.`

---

## 1. Entity Schemas & Relationships

### 1.1 Members (`members`)
Students and faculty registered in the system. The librarian is a system operator role and does not have a member record.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (PK) | Unique Member identifier, e.g. `"STU-001"`, `"LIB-0001"` |
| `name` | `string` | Full name, e.g. `"Aisha Patel"` |
| `email` | `string` (Unique) | University email address, lowercase |
| `studentId` | `string` (Unique) | University Student ID (e.g. `"STU-001"`) |
| `dept` | `string` | Academic department, e.g. `"Computer Science"` |
| `status` | `string` | `"active"` \| `"suspended"` |
| `joined` | `string` | Registration month and year, e.g. `"AUG 2024"` |
| `role` | `string` | Member role: `"student"` |

#### Derived Member Fields (computed live):
- `booksOut`: Count of active loans (`loans.filter(l => l.status === 'active').length`).
- `overdueCount`: Count of overdue active loans (`loans.filter(l => l.isOverdue).length`).
- `fixedUnpaidFines`: Sum of invoiced unpaid fines (`fines.filter(f => f.status === 'unpaid')`).
- `accruingFines`: Sum of live fines on currently overdue items (`daysLate * ₹5`).
- `totalFinesDue`: `fixedUnpaidFines + accruingFines`.
- `hasUnpaidFines`: Boolean (`totalFinesDue > 0`).

---

### 1.2 Books (`books`)
All library titles in the catalogue.

| Field | Type | Description |
|---|---|---|
| `accession` | `string` (PK) | Library accession tag, e.g. `"BB-0001"` |
| `id` | `string` | Legacy / UUID fallback identifier |
| `title` | `string` | Full book title |
| `author` | `string` | Author names |
| `category` | `string` | Category (`Computer Science`, `Literature`, etc.) |
| `format` | `string` | `"Hardcover"` \| `"Paperback"` |
| `edition` | `string?` | Edition text, e.g. `"4th Edition"` |
| `publisher` | `string?` | Publisher name |
| `totalCopies` | `number` | Total inventory copies owned (integer $\ge 1$) |
| `isbn` | `string?` | ISBN-10 or ISBN-13 |
| `description` | `string?` | Synopsis / overview |
| `coverGrid` | `string?` | Thumbnail URL or Data URL |
| `coverLarge` | `string?` | High-res cover URL or Data URL |
| `uploadedCover` | `string?` | Custom uploaded Data URL (`image/jpeg`, `image/png`, `image/webp`, max 2MB) |
| `retired` | `boolean` | `true` if decommissioned from active circulation |

#### Derived Book Fields (computed live):
- `activeLoansCount`: Count of active loans for this accession (`loans.filter(l => l.accession === accession && l.status === 'active').length`).
- `activeHoldsCount`: Count of pickup holds currently ready (`reservations.filter(r => r.accession === accession && r.status === 'ready').length`).
- `availableCopies`: $\max(0, \text{totalCopies} - \text{activeLoansCount} - \text{activeHoldsCount})$.
- `bookStatus`: 5-status enum:
  - `"Retired"`: if `book.retired === true`
  - `"Overdue"`: if any active loan for this accession is currently overdue
  - `"On Loan"`: if $\text{availableCopies} = 0$ and loans exist without overdue status
  - `"Reserved"`: if active hold exists and $\text{availableCopies} = 0$
  - `"Available"`: if $\text{availableCopies} > 0$

---

### 1.3 Loans (`loans`)
Checkout records for books borrowed by students.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (PK) | Loan identifier, e.g. `"LN-0001"` |
| `accession` | `string` (FK $\to$ Books) | Accession number of borrowed title |
| `memberId` | `string` (FK $\to$ Members) | Member ID of borrower |
| `issuedDate` | `string` (YYYY-MM-DD) | Date the book was issued |
| `dueDate` | `string` (YYYY-MM-DD) | Due date (standard: `issuedDate` + 14 days) |
| `returnedDate` | `string?` (YYYY-MM-DD) | Actual return date, or `null` if still out |
| `renewCount` | `number` | Number of times renewed ($\le 2$) |
| `status` | `string` | `"active"` \| `"returned"` |

#### Derived Loan Fields (computed live):
- `isOverdue`: `status === 'active' && today > dueDate`
- `daysLate`: If overdue, difference in calendar days between `dueDate` and `today`; else 0.
- `daysLeft`: If active, difference in calendar days between `today` and `dueDate`; else 0.
- `accruedFine`: `daysLate * ₹5.00`

---

### 1.4 Reservations (`reservations`)
Pickup holds and waitlists for books.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (PK) | Reservation ID, e.g. `"RES-0001"` |
| `accession` | `string` (FK $\to$ Books) | Accession number of reserved title |
| `memberId` | `string` (FK $\to$ Members) | Student placing reservation |
| `createdAt` | `string` (YYYY-MM-DD) | Date placed |
| `status` | `string` | `"ready"` \| `"waiting"` \| `"fulfilled"` \| `"expired"` \| `"cancelled"` |
| `queuePosition` | `number` | First-come-first-served position ($\ge 1$) |
| `holdExpiresAt` | `string?` (YYYY-MM-DD) | 5-day expiration date when status is `"ready"`; else `null` |
| `pickupLocation` | `string?` | Shelf location, e.g. `"Desk Bay 2 — Shelf R-04"` |

---

### 1.5 Fines (`fines`)
Fixed ledger charges assessed on late returns, damages, or administrative fees.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (PK) | Fine invoice ID, e.g. `"FINE-0001"` |
| `memberId` | `string` (FK $\to$ Members) | Member assessed |
| `accession` | `string?` | Associated title accession |
| `loanId` | `string?` | Associated loan record |
| `amount` | `number` | Fine amount in INR (₹) |
| `reason` | `string` | Explanation (e.g. `"Overdue loan (3 days @ ₹5/day)"`) |
| `status` | `string` | `"unpaid"` \| `"paid"` |
| `dateIncurred` | `string` (YYYY-MM-DD) | Assessment date |
| `paidDate` | `string?` (YYYY-MM-DD) | Settlement date |

---

### 1.6 Audit Activity Log (`activityLog`)
Append-only log of every state-mutating event across the application.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (PK) | Activity entry ID, e.g. `"ACT-1698745-1234"` |
| `timestamp` | `string` (ISO 8601) | Timestamp of event |
| `action` | `string` | Event type: `"book_issued"`, `"book_returned"`, `"loan_renewed"`, `"fine_assessed"`, `"fine_paid"`, `"hold_placed"`, `"hold_ready"`, `"hold_expired"`, `"member_registered"`, `"member_suspended"`, `"book_retired"`, etc. |
| `actor` | `string` | Performer: `"Librarian"` or Student Name |
| `memberId` | `string?` | Target member ID |
| `memberName` | `string?` | Target member name |
| `accession` | `string?` | Related book accession |
| `bookTitle` | `string?` | Related book title |
| `description` | `string` | Human-readable audit narrative |

---

## 2. Invariant Business Rules Checklist

The backend implementation must enforce the following invariants:

- [x] **Borrow Limit:** A member cannot hold more than 5 active loans at any time.
- [x] **Account Suspension:** Suspended members cannot borrow or reserve titles.
- [x] **Unpaid Fines Block:** A member with unpaid fines (either accrued or invoiced) cannot issue or renew any loans.
- [x] **Duplicate Borrow Block:** A member cannot borrow two copies of the same accession simultaneously.
- [x] **Retired Titles:** Retired titles cannot be checked out or placed on waitlist.
- [x] **Retire With Active Loans Block:** Decommissioning/retiring a title with active loans is blocked: `"Cannot retire: title has active loans."`
- [x] **Renewal Limits:** Maximum 2 renewals per loan (+14 days each).
- [x] **Overdue Renewal Block:** Overdue loans cannot be renewed; they must be returned and settled.
- [x] **Reserved Renewal Block:** If another student has placed a reservation or waitlist on the title, renewal is prohibited.
- [x] **Overdue Fine Computation:** Accrues continuously at ₹5.00 per working day from `dueDate` until return.
- [x] **Return Accounting:** Returning immediately restores 1 available copy. If late, a fixed fine invoice is created with `status: 'unpaid'`.
- [x] **Return Waitlist Transfer:** If a returning book has a waiting reservation queue:
  1. The next student in queue (#1) is transitioned to `"ready"` status.
  2. A 5-day hold is set (`holdExpiresAt = today + 5 days`).
  3. Subsequent waitlist positions shift forward ($2 \to 1, 3 \to 2$, etc.).
- [x] **Hold Expiry Hand-Off:** When `today > holdExpiresAt`:
  1. Expired hold is marked `"expired"`.
  2. The copy automatically transfers to the next waitlisted student with a fresh 5-day hold.
- [x] **Fine Settlement:** Fines remain unpaid until a librarian explicitly marks them paid via `POST /api/fines/{id}/pay`.
- [x] **Unique Identity:** Registration requires unique student ID and unique email address.

---

## 3. Backend REST API Specification

To transition from the local synchronized store to a persistent backend:

### Authentication & Roles
- `POST /api/auth/login`: `{ email, password }` $\to$ `{ token, user: { id, name, email, role: "librarian" | "student", memberId } }`
- `POST /api/auth/register`: `{ name, email, studentId, dept, password }` $\to$ Creates Member & User record; returns token & member profile.

### Books & Catalogue
- `GET /api/books`: Query parameters: `search`, `category`, `status`, `page`, `limit`. Returns paginated books with derived `availableCopies` and `bookStatus`.
- `GET /api/books/{accession}`: Returns full title record, copies, active loans, and reservation queue status.
- `POST /api/books`: `{ accession, title, author, category, totalCopies, format, isbn, publisher, edition, description, cover }`.
- `PUT /api/books/{accession}`: Updates book details.
- `POST /api/books/{accession}/retire`: Retires book. Returns 400 if active loans exist.
- `POST /api/books/{accession}/cover`: Multipart image upload (JPEG/PNG/WebP, max 2MB).

### Loans & Circulation
- `GET /api/loans`: Query parameters: `memberId`, `status` (`active` \| `overdue` \| `returned`).
- `POST /api/loans/issue`: `{ accession, memberId }`. Validates all 6 borrow invariants. Returns created loan.
- `POST /api/loans/{id}/renew`: Extends due date by 14 days. Validates max renewals, overdue status, unpaid fines, and reservations.
- `POST /api/loans/{id}/return`: Marks loan returned, records fine if overdue, and triggers next reservation hold if waitlisted.

### Reservations & Waitlists
- `GET /api/reservations`: Filter by `memberId` or `accession`.
- `POST /api/reservations`: `{ accession, memberId }`. Automatically allocates ready hold (if copy available) or assigns FIFO queue position.
- `DELETE /api/reservations/{id}`: Cancels hold or leaves waitlist, advancing remaining queue.

### Fines & Settlement
- `GET /api/fines`: List all fine invoices. Filter by `memberId`, `status`.
- `POST /api/fines/{id}/pay`: Marks fine settled with `paidDate` and records audit entry.

### System & Audit Log
- `GET /api/activity`: Returns recent audit events with pagination.
- `GET /api/reports/{type}`: Returns tabular data for `overdue`, `inventory`, `most-borrowed`, or `fines` (with CSV streaming).

