# Book Bank Management System

## 1. Project Overview

The Book Bank Management System is a full-stack web application designed to automate the process of managing students, books, book issues, book returns, reservations, book orders, vendors, fines, notifications, and reports.

The system follows the functional requirements described in the Software Engineering Lab specification:

- Student registration and information management
- Librarian administration
- Book and magazine management
- Book search
- Book issue
- Book return
- Book reservation when an item is unavailable
- Notification when a reserved item becomes available
- New book entry and inventory management
- Book purchasing and vendor management
- Student/member management
- Reports and system records
- Secure handling of user information and uploaded documents

The original specification uses Visual Basic and Oracle 11g. This implementation modernizes the same system as a web application using React, Python/Django, Django REST Framework, and PostgreSQL.

---

## 2. Project Objectives

The main objectives are:

1. Automate Book Bank operations that would otherwise be performed manually.
2. Provide separate interfaces for students, librarians, and vendors.
3. Maintain centralized and secure book and user records.
4. Reduce the time required for issuing and returning books.
5. Allow students to search for books and reserve unavailable books.
6. Automatically update inventory after issue, return, purchase, or removal.
7. Maintain reservation, issue, return, and fine records.
8. Provide reports to the librarian for administration and decision-making.
9. Provide notifications for reservations, due dates, approvals, and other important events.
10. Maintain a scalable architecture that can be extended in future.

---

# 3. Technology Stack

## Frontend

- React.js
- Tailwind CSS
- Axios
- React Router

## Backend

- Python
- Firebase
- Django REST Framework
- Django REST Framework Simple JWT
- Python packages required by the project

## Database

- PostgreSQL 
- Firebase
- pgAdmin

## Authentication and Security

- JWT authentication + bcrypt
- Password hashing using Django's authentication system
- Role-based authorization
- Protected API endpoints

## File and Document Management

- Django file upload handling
- Cloud storage can be added for scanned student documents

## Notifications

- Django email support
- SMTP/Nodemailer equivalent functionality through Python email services
- Optional asynchronous processing using Celery

## Development and Testing Tools

- Visual Studio Code
- Git
- GitHub
- Postman(Email verification)
- Draw.io / diagrams.net
- Chrome or another modern browser

---

# 4. System Actors

The system has three primary actors.

## 4.1 Student

A student can:

- Register/login
- Submit personal information
- Upload required documents
- Search books
- View book details
- Request an available book
- Reserve an unavailable book
- View issued books
- View reservation status
- View due dates
- View fines
- Receive notifications
- Manage profile information

## 4.2 Librarian

The librarian is the central authority of the system.

A librarian can:

- Authenticate into the administration panel
- Manage students
- Manage books and magazines
- Add new books
- Update book information
- Remove outdated or damaged books
- Manage inventory and copies
- Search book information
- Approve book issues
- Process book returns
- Calculate/manage fines
- Manage reservations
- Manage vendors(add later)
- Create/manage purchase orders
- Generate reports
- Send or trigger notifications

## 4.3 Vendor

A vendor/supplier can:

- View assigned book orders
- View order details
- Update supply status
- Confirm supplied books
- Provide book information required for purchasing

---

# 5. High-Level System Architecture

```text
                         USER
                          |
          +---------------+---------------+
          |               |               |
       Student         Librarian        Vendor
          |               |               |
          +---------------+---------------+
                          |
                          v
                React.js Frontend
                          |
                     REST API
                          |
                          v
             Django + Django REST Framework
                          |
        +-----------------+------------------+
        |                 |                  |
        v                 v                  v
 Authentication      Business Logic      File Handling
        |                 |                  |
        +-----------------+------------------+
                          |
                          v
                    PostgreSQL
                          |
              +-----------+-----------+
              |                       |
              v                       v
        Notification Service      Reports
```

---

# 6. Complete Application Workflow

## 6.1 Application Entry

```text
Open Website
     |
     v
Landing Page
     |
     +--------------------+
     |                    |
     v                    v
 Login                Register
     |                    |
     v                    v
Authentication       Registration Form
     |                    |
     +---------+----------+
               |
               v
        Verify Credentials
               |
               v
          Check User Role
          /      |       \
         /       |        \
        v        v         v
    Student   Librarian   Vendor
    Dashboard Dashboard   Dashboard
```

---

# 7. Authentication Workflow

## 7.1 Student/Librarian/Vendor Login

```text
Login Page
   |
   v
Enter User ID / Email
   |
   v
Enter Password
   |
   v
Submit Login
   |
   v
Django Authentication API
   |
   v
Validate Credentials
   |
   +----------------------+
   |                      |
 Invalid                Valid
   |                      |
   v                      v
Error Message         Generate JWT
                          |
                          v
                    Identify Role
                          |
             +------------+------------+
             |            |            |
             v            v            v
          Student      Librarian      Vendor
          Dashboard    Dashboard      Dashboard
```

## 7.2 Registration

```text
Registration
     |
     v
Enter Personal Information
     |
     v
Enter Account Information
     |
     v
Upload Required Documents
     |
     v
Validate Data
     |
     v
Create User Record
     |
     v
Assign Student Role
     |
     v
Account Created
```

The specification states that students may be required to submit personal information and scanned documents.

---

# 8. Student Workflow

## 8.1 Student Dashboard

After successful authentication, the student enters the dashboard.

The dashboard should contain:

- Search books
- Currently issued books
- Reserved books
- Due dates
- Fine information
- Notifications
- Profile
- Document information

```text
Student Login
     |
     v
Student Dashboard
     |
     +----------------+----------------+----------------+
     |                |                |                |
     v                v                v                v
Search Books       My Books       Reservations    Notifications
     |                |                |                |
     v                v                v                v
Book Details     Issue/Return     Reservation      View Alerts
```

---

# 9. Book Search Workflow

```text
Student Dashboard
      |
      v
Search Books
      |
      v
Enter Title / Author / Book ID / Keyword
      |
      v
Send Search Request
      |
      v
Django API
      |
      v
PostgreSQL Query
      |
      v
Return Matching Books
      |
      v
Display Book List
      |
      v
Select Book
      |
      v
Book Details Page
```

The book details page should display information such as:

- Book ID
- Title
- Author
- Edition
- Publication details
- Vendor
- Price
- Purchase date
- Total copies
- Available copies
- Current status

---

# 10. Book Issue Workflow

```text
Student selects book
        |
        v
Check Availability
        |
        +----------------------+
        |                      |
    Available              Unavailable
        |                      |
        v                      v
Request Issue             Reservation
        |                      |
        v                      v
Librarian Review         Reservation Saved
        |
        v
Approve Request
        |
        v
Create Issue Record
        |
        v
Decrease Available Copies
        |
        v
Book Issued
        |
        v
Student Notification
```

The system must only issue a book to a valid registered member.

---

# 11. Book Reservation Workflow

When a requested book is unavailable:

```text
Student searches book
       |
       v
Book unavailable
       |
       v
Reserve Book
       |
       v
Create Reservation
       |
       v
Reservation Status = Waiting
       |
       v
Book becomes available
       |
       v
System checks reservations
       |
       v
Select eligible reservation
       |
       v
Notify student
       |
       v
Reservation status updated
```

The specification explicitly states that a member can reserve an unavailable book and should be notified when the book is returned or purchased.

---

# 12. Book Return Workflow

```text
Student Returns Book
        |
        v
Librarian Receives Return
        |
        v
Enter Book ID
        |
        v
Find Issue Record
        |
        v
Verify Return Date
        |
        v
Check Due Date
        |
        +------------------------+
        |                        |
     On Time                  Late
        |                        |
        v                        v
No Fine                    Calculate Fine
        |                        |
        +------------+-----------+
                     |
                     v
             Complete Return
                     |
                     v
            Update Return Record
                     |
                     v
           Increase Available Copies
                     |
                     v
           Check Pending Reservations
                     |
                     v
             Send Notification
```

If a book is returned late, the system should display/manage a fine.

---

# 13. Book Management Workflow

The librarian can maintain the book catalogue and inventory.

```text
Librarian Dashboard
        |
        v
Manage Books
        |
        +-------------------+-------------------+------------------+
        |                   |                   |
        v                   v                   v
     Add Book            Update Book        Remove Book
        |                   |                   |
        v                   v                   v
Enter Details          Edit Details      Mark Removed
        |                   |                   |
        +-------------------+-------------------+
                            |
                            v
                     Update Database
```

Book entry should support information such as:

- Book ID
- Title
- Author
- Edition
- Publication information
- Vendor
- Price
- Purchase date
- Number of copies
- Reference information

---

# 14. Student Management Workflow

```text
Librarian Dashboard
        |
        v
Manage Students
        |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
    Add Student          Update Student        Remove/Disable
        |                     |                     |
        +---------------------+---------------------+
                              |
                              v
                       Database Updated
```

Student records can include:

- Enrollment number
- Name
- Date of birth
- Parent/guardian information
- Address
- Department
- State
- PIN code
- Phone/contact
- Batch/year
- Book borrowing limit

---

# 15. Vendor and Purchase Workflow

```text
Librarian
    |
    v
Book unavailable / Additional copies required
    |
    v
Create Purchase Order
    |
    v
Select Vendor
    |
    v
Send Order
    |
    v
Vendor Views Order
    |
    v
Vendor Confirms Supply
    |
    v
Book Received
    |
    v
Librarian Adds Book to Inventory
    |
    v
Update Book Copies
    |
    v
Complete Order
```

---

# 16. Fine Management Workflow

```text
Book Return
    |
    v
Compare Return Date with Due Date
    |
    v
Is the book overdue?
    |
    +-------------------+
    |                   |
    No                  Yes
    |                   |
    v                   v
No Fine             Calculate Fine
                        |
                        v
                   Save Fine Record
                        |
                        v
                   Notify Student
```

Possible fine fields:

- Fine ID
- Student ID
- Book ID
- Issue ID
- Due date
- Return date
- Number of late days
- Fine amount
- Payment/status

The exact fine calculation rule is not specified in the supplied PDF, so the final project should define this rule separately.

---

# 17. Notification Workflow

Notifications can be generated for:

- Issue approval
- Book issued
- Book due soon
- Book overdue
- Reservation available
- Reservation approved
- Purchase/order updates
- Other librarian actions

```text
System Event
     |
     v
Notification Service
     |
     +--------------------+
     |                    |
     v                    v
In-App Notification     Email
     |                    |
     +---------+----------+
               |
               v
             Student
```

---

# 18. Librarian Dashboard Workflow

```text
Librarian Login
      |
      v
Librarian Dashboard
      |
      +----------------------------------------------------------+
      |              |              |            |               |
      v              v              v            v               v
  Manage Books   Students       Issue/Return Reservations      Reports
      |              |              |            |               |
      v              v              v            v               v
 Inventory        Accounts       Transactions   Approval      Analytics
      |
      +-------------------+
      |
      v
 Vendors / Orders
      |
      v
 Purchase Management
```

---

# 19. Reports Module

The librarian should be able to generate reports such as:

- Total books
- Available books
- Issued books
- Returned books
- Reserved books
- Overdue books
- Student borrowing records
- Fine records
- Purchase records
- Vendor records

```text
Librarian
    |
    v
Reports
    |
    v
Select Report Type
    |
    v
Apply Filters
    |
    v
Query Database
    |
    v
Generate Report
    |
    +-------------------+
    |                   |
    v                   v
View in Browser      Export File
```

---

# 20. Database Design

The database should be normalized around the main entities.

Suggested tables:

```text
users
students
librarians
vendors
books
book_copies
issues
returns
reservations
fines
purchase_orders
purchase_order_items
notifications
documents
```

## Main relationships

```text
User
 |
 +---- Student
 |
 +---- Librarian
 |
 +---- Vendor

Student
 |
 +---- Issues
 |
 +---- Returns
 |
 +---- Reservations
 |
 +---- Fines
 |
 +---- Documents
 |
 +---- Notifications

Book
 |
 +---- Book Copies
 |
 +---- Issues
 |
 +---- Returns
 |
 +---- Reservations
 |
 +---- Purchase Order Items

Vendor
 |
 +---- Purchase Orders
```

---

# 21. Suggested Backend API Structure

Base URL:

```text
/api/
```

## Authentication

```text
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/refresh/
POST   /api/auth/logout/
```

## Students

```text
GET    /api/students/
GET    /api/students/{id}/
POST   /api/students/
PUT    /api/students/{id}/
DELETE /api/students/{id}/
```

## Books

```text
GET    /api/books/
GET    /api/books/{id}/
POST   /api/books/
PUT    /api/books/{id}/
DELETE /api/books/{id}/
```

## Issues

```text
GET    /api/issues/
GET    /api/issues/{id}/
POST   /api/issues/
PUT    /api/issues/{id}/
```

## Returns

```text
GET    /api/returns/
POST   /api/returns/
GET    /api/returns/{id}/
```

## Reservations

```text
GET    /api/reservations/
POST   /api/reservations/
PUT    /api/reservations/{id}/
DELETE /api/reservations/{id}/
```

## Vendors

```text
GET    /api/vendors/
POST   /api/vendors/
PUT    /api/vendors/{id}/
DELETE /api/vendors/{id}/
```

## Orders

```text
GET    /api/orders/
POST   /api/orders/
PUT    /api/orders/{id}/
```

## Notifications

```text
GET    /api/notifications/
PUT    /api/notifications/{id}/read/
```

---

# 22. Frontend Page Structure

Suggested React page structure:

```text
src/
├── components/
├── layouts/
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ForgotPassword.jsx
│   │
│   ├── student/
│   │   ├── Dashboard.jsx
│   │   ├── Books.jsx
│   │   ├── BookDetails.jsx
│   │   ├── MyBooks.jsx
│   │   ├── Reservations.jsx
│   │   ├── Notifications.jsx
│   │   └── Profile.jsx
│   │
│   ├── librarian/
│   │   ├── Dashboard.jsx
│   │   ├── Books.jsx
│   │   ├── Students.jsx
│   │   ├── Issues.jsx
│   │   ├── Returns.jsx
│   │   ├── Reservations.jsx
│   │   ├── Vendors.jsx
│   │   ├── Orders.jsx
│   │   ├── Fines.jsx
│   │   └── Reports.jsx
│   │
│   └── vendor/
│       ├── Dashboard.jsx
│       ├── Orders.jsx
│       └── SupplyStatus.jsx
│
├── services/
│   └── api.js
│
├── context/
├── hooks/
├── routes/
├── utils/
└── App.jsx
```

---

# 23. Backend Project Structure

Suggested Django structure:

```text
backend/
├── manage.py
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── accounts/
│   ├── students/
│   ├── books/
│   ├── issues/
│   ├── returns/
│   ├── reservations/
│   ├── vendors/
│   ├── orders/
│   ├── fines/
│   ├── notifications/
│   └── reports/
│
├── media/
├── static/
├── requirements.txt
└── .env
```

Each Django application should contain its own:

```text
models.py
serializers.py
views.py
urls.py
permissions.py
tests.py
```

where required.

---

# 24. Role-Based Access Control

The frontend and backend must both enforce permissions.

```text
                    AUTHENTICATED USER
                           |
                 Check Assigned Role
                           |
           +---------------+---------------+
           |               |               |
           v               v               v
        STUDENT         LIBRARIAN        VENDOR
           |               |               |
           v               v               v
 Student Functions   Admin Functions   Supply Functions
```

Examples:

- A student must not access librarian APIs.
- A vendor must not manage student accounts.
- A librarian can access administrative functions.
- Sensitive database operations must only be available to authorized roles.

---

# 25. Security Workflow

```text
User Login
    |
    v
Validate Credentials
    |
    v
Password Verification
    |
    v
JWT Token
    |
    v
Authenticated Request
    |
    v
Permission Check
    |
    v
Role Check
    |
    v
Django API
    |
    v
Database
```

Security measures should include:

- Password hashing
- JWT authentication
- Role-based authorization
- Protected API routes
- Input validation
- File validation
- Environment variables for secrets
- HTTPS in production
- Database access restrictions
- Secure error handling

---

# 26. Development Workflow

## Phase 1: Project Setup

```text
Install software
      |
      v
Create Git repository
      |
      v
Create React frontend
      |
      v
Create Django backend
      |
      v
Configure PostgreSQL
      |
      v
Connect Django to database
```

## Phase 2: Authentication

```text
Create User Model
      |
      v
Registration
      |
      v
Login
      |
      v
JWT
      |
      v
Role-based access
```

## Phase 3: Core Database

Create models for:

```text
Student
Book
BookCopy
Issue
Return
Reservation
Vendor
PurchaseOrder
Fine
Notification
Document
```

## Phase 4: Core Book Operations

Implement:

```text
Book Search
Book Details
Book Entry
Book Update
Book Removal
Inventory Management
```

## Phase 5: Transaction Operations

Implement:

```text
Book Issue
Book Return
Reservation
Fine
Renewal, if included in final requirements
```

## Phase 6: Administrative Operations

Implement:

```text
Student Management
Vendor Management
Purchase Orders
Reports
```

## Phase 7: Notifications

Implement:

```text
Issue notifications
Reservation notifications
Due date notifications
Overdue notifications
```

## Phase 8: Testing

Test:

```text
Authentication
Authorization
Book Search
Book Issue
Book Return
Reservation
Fine
Inventory
Vendor Orders
Reports
Notifications
```

## Phase 9: Deployment

```text
Build Frontend
      |
      v
Deploy React Application
      |
      v
Deploy Django API
      |
      v
Deploy PostgreSQL Database
      |
      v
Configure Environment Variables
      |
      v
Configure CORS
      |
      v
Configure HTTPS
      |
      v
Production Testing
```

---

# 27. Git and GitHub Workflow

Recommended branch structure:

```text
main
 |
 +---- development
        |
        +---- feature/auth
        +---- feature/books
        +---- feature/issues
        +---- feature/returns
        +---- feature/reservations
        +---- feature/vendors
        +---- feature/reports
```

Typical workflow:

```text
Create branch
    |
    v
Implement feature
    |
    v
Run tests
    |
    v
Commit changes
    |
    v
Push branch to GitHub
    |
    v
Create Pull Request
    |
    v
Review
    |
    v
Merge into development
    |
    v
Final tested version
    |
    v
Merge into main
```

---

# 28. Software Engineering Diagrams

The project should document the system using the following diagrams.

## Use-Case Diagram

Actors:

```text
Student
Librarian
Vendor
```

Main use cases:

```text
Student:
- Search Book
- Borrow Book
- Return Book
- Renew Book, if supported
- Reserve Book
- View Notifications

Librarian:
- Manage Books
- Manage Students
- Issue Books
- Return Books
- Manage Reservations
- Manage Vendors
- Manage Orders
- Generate Reports
- Manage Inventory

Vendor:
- View Orders
- Supply Books
- Update Supply Status
```

## Activity Diagram

Create activity diagrams for:

- Login
- Book Issue
- Book Return
- Reservation
- Book Purchase

## Class Diagram

The main classes should include:

```text
User
Student
Librarian
Vendor
Book
BookCopy
Issue
Return
Reservation
Fine
PurchaseOrder
Notification
Document
```

## Sequence Diagram

At minimum create sequence diagrams for:

- Book Issue
- Book Return
- Book Reservation
- Login

The supplied specification also describes sequence interactions between Student, Library System, Librarian, and Book Database.

## State Diagram

A suitable book state flow is:

```text
Available
   |
   v
Requested
   |
   +----------------+
   |                |
   v                v
Issued           Reserved
   |                |
   v                |
Returned <----------+
   |
   v
Available
```

## Component Diagram

```text
React Frontend
      |
      v
Django REST API
      |
      +------------+
      |            |
      v            v
Authentication   Business Modules
      |            |
      +-----+------+
            |
            v
       PostgreSQL
```

## Deployment Diagram

```text
User Browser
     |
     v
Frontend Server
     |
     v
Application Server
     |
     v
PostgreSQL Database
```

---

# 29. Testing phase

Testing should be performed at multiple levels.

## Unit Testing

Test individual functions and services.

Examples:

- Fine calculation
- Availability calculation
- Reservation priority
- User validation

## API Testing

Use Postman to test:

- Authentication APIs
- Book APIs
- Issue APIs
- Return APIs
- Reservation APIs
- Vendor APIs
- Report APIs

## Integration Testing

Verify:

```text
Frontend
   |
   v
API
   |
   v
Database
```

works as a complete flow.

## User Acceptance Testing

Test the complete real-world scenarios:

### Scenario 1: Available Book

```text
Student logs in
-> searches book
-> book is available
-> requests book
-> librarian approves
-> book is issued
-> inventory decreases
```

### Scenario 2: Unavailable Book

```text
Student logs in
-> searches book
-> book unavailable
-> student reserves book
-> reservation saved
-> book returned later
-> system detects reservation
-> student is notified
```

### Scenario 3: Late Return

```text
Student returns book
-> librarian verifies issue
-> return date checked
-> overdue detected
-> fine calculated
-> return record updated
-> inventory updated
```

### Scenario 4: New Book Purchase

```text
Librarian identifies missing book
-> creates purchase order
-> selects vendor
-> vendor supplies book
-> librarian enters book
-> inventory updated
```

---

# 30. Final User Journey

The complete system can be summarized as:

```text
                     START
                       |
                       v
                Open Book Bank
                       |
                       v
                Login / Register
                       |
                       v
                Verify User
                       |
         +-------------+-------------+
         |             |             |
         v             v             v
      Student       Librarian       Vendor
         |             |             |
         v             v             v
    Dashboard      Dashboard      Dashboard
         |             |             |
         v             v             v
    Search Books   Manage Books   View Orders
         |             |             |
         v             v             v
   Book Available?  Issue/Return   Supply Books
      /       \
    Yes        No
     |          |
     v          v
   Request    Reserve
     |          |
     v          v
  Approval   Wait for
     |       Availability
     |          |
     v          v
   Issue     Notification
     |          |
     +-----+----+
           |
           v
        Return
           |
           v
      Check Due Date
           |
      +----+----+
      |         |
     Late     On Time
      |         |
      v         v
     Fine      No Fine
      |         |
      +----+----+
           |
           v
    Update Inventory
           |
           v
    Update Database
           |
           v
        COMPLETE
```

---

# 31. Recommended Minimum Viable Product

The first working version should focus on these features:

```text
1. Login/Register
2. Role-based authentication
3. Student dashboard
4. Librarian dashboard
5. Book CRUD
6. Book search
7. Book issue
8. Book return
9. Reservation
10. Inventory update
11. Fine calculation
12. Notifications
13. Student management
14. Vendor/order management
15. Reports
```

Features such as advanced analytics, online fine payment, recommendation systems, barcode/QR scanning, and mobile applications can be added later.

---

# 32. Final Project Architecture

```text
                         BOOK BANK MANAGEMENT SYSTEM

                              FRONTEND
                         React + Tailwind CSS
                                  |
                                  | REST API
                                  v
                              BACKEND
                         Python + Django
                         Django REST Framework
                                  |
                 +----------------+----------------+
                 |                |                |
                 v                v                v
            Authentication   Core Services    Notifications
                 |                |                |
                 +----------------+----------------+
                                  |
                                  v
                              DATABASE
                              PostgreSQL
                                  |
                    +-------------+-------------+
                    |             |             |
                    v             v             v
                  Books        Students      Transactions
                                  |
                         Issues / Returns
                                  |
                         Reservations/Fines
                                  |
                         Vendors / Orders
```

---

# 33. Project Completion Criteria

The project will be considered complete when:

- Students can securely register and log in.
- Librarians can securely access administrative functionality.
- Vendors can access their permitted supply/order functionality.
- Books can be added, updated, searched, and removed.
- Students can request available books.
- Students can reserve unavailable books.
- Librarians can process book issues.
- Librarians can process returns.
- Late returns can generate fines.
- Inventory is automatically updated.
- Reservations are updated when books become available.
- Notifications are generated for relevant events.
- Student, book, issue, return, reservation, vendor, and order data are stored correctly.
- Reports can be generated.
- The frontend and backend communicate through secure APIs.
- The application is tested before deployment.
- The complete source code is maintained in GitHub.

---

## 34. Conclusion

This project implements the Book Bank Management System as a modern full-stack web application while retaining the main functional requirements of the supplied Software Engineering Lab specification.

The recommended architecture is:

```text
React.js
    +
Tailwind CSS
    +
Python
    +
Django
    +
Django REST Framework
    +
PostgreSQL
```

This architecture provides a clear separation between the presentation layer, business logic, API layer, and database, making the system easier to develop, test, maintain, and extend.
