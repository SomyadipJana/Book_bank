# Book Bank - Git Workflow Guide

This document defines the Git branching strategy and daily workflow for the **Book Bank Management System** team.

---

## Branch Structure

```
main
 L develop
      |-- frontend
      L-- backend
```

| Branch     | Purpose                                                        | Who works here          |
|------------|----------------------------------------------------------------|-------------------------|
| `main`     | Stable, production-ready releases only                         | Merged from `develop`   |
| `develop`  | Integration branch - all finished features land here first     | Both team members (via PRs) |
| `frontend` | Long-lived branch for all frontend (React/Vite) development    | Friend (frontend dev)   |
| `backend`  | Long-lived branch for all backend (Django/Python/PostgreSQL)   | Backend developer (you) |

---

## Ground Rules

- NEVER commit directly to `main` or `develop`
- NEVER force-push any shared branch (`main`, `develop`, `frontend`, `backend`)
- NEVER use `git reset --hard` on shared branches
- ALWAYS `pull` / `fetch` before starting work
- Use Pull Requests to merge `frontend` -> `develop` and `backend` -> `develop`
- Merge `develop` into your working branch to receive integrated updates
- Write meaningful, descriptive commit messages

---

## A. Friend's Frontend Workflow

```bash
# 1. Switch to the frontend branch
git switch frontend

# 2. Always pull the latest changes before starting work
git pull origin frontend

# 3. ... work on React / Vite / UI code ...

# 4. Stage and commit your changes
git add .
git commit -m "feat: add book search results component"

# 5. Push to remote
git push origin frontend
```

Then open a **Pull Request** on GitHub:
> `frontend` -> `develop`

Have the other team member review and approve before merging.

---

## B. Backend Developer Workflow (You)

```bash
# 1. Switch to the backend branch
git switch backend

# 2. Always pull the latest changes before starting work
git pull origin backend

# 3. ... work on Django / Python / PostgreSQL / API endpoints ...

# 4. Stage and commit your changes
git add .
git commit -m "feat: add Book model and REST API endpoint"

# 5. Push to remote
git push origin backend
```

Then open a **Pull Request** on GitHub:
> `backend` -> `develop`

Have the other team member review and approve before merging.

---

## C. How You Receive Your Friend's Latest Frontend Work

Once your friend's frontend changes are merged into `develop` via a Pull Request:

```bash
git switch backend
git fetch origin
git merge origin/develop
```

This fetches all remote branch updates without changing your local code, then merges
the latest `develop` (which contains the frontend updates) into your `backend` branch.
Resolve any merge conflicts carefully.

---

## D. How Your Friend Receives Your Latest Backend Work

Once your backend changes are merged into `develop` via a Pull Request:

```bash
git switch frontend
git fetch origin
git merge origin/develop
```

This fetches all remote branch updates, then merges the latest `develop` (which contains
the backend updates) into the `frontend` branch. Both branches stay in sync through
`develop` as the shared integration point.

---

## E. Final Release Workflow (Merging to main)

When both frontend and backend work is complete, tested, and stable in `develop`:

```bash
# 1. Ensure develop is up to date
git switch develop
git pull origin develop

# 2. Switch to main
git switch main
git pull origin main

# 3. Merge develop into main
git merge --no-ff develop -m "release: v1.0.0 - Book Bank initial release"

# 4. Push the release to origin/main
git push origin main

# 5. (Optional) Tag the release
git tag -a v1.0.0 -m "Version 1.0.0 - Initial release"
git push origin v1.0.0
```

Full release flow:
```
frontend  --PR--.
                +---> develop --PR---> main
backend   --PR--'
```

---

## Daily Sync Cheatsheet

| Task | Command |
|------|---------|
| Start a work session | `git switch <your-branch>` then `git pull origin <your-branch>` |
| Get integrated updates from team | `git fetch origin` then `git merge origin/develop` |
| Stage all changes | `git add .` |
| Commit | `git commit -m "type: short description"` |
| Push to remote | `git push origin <your-branch>` |
| See local branches | `git branch` |
| See all branches (local + remote) | `git branch -a` |
| See recent commits | `git log --oneline --decorate -10` |

---

## Backend Tech Stack (Planned for backend branch)

- Python + Django + Django REST Framework
- PostgreSQL database configuration
- Database models (Book, User, Loan, etc.)
- REST API endpoints
- Authentication / Authorization

NOTE: Do not install or configure these technologies until the `backend` branch is active.

---

## Repository

- GitHub: https://github.com/SomyadipJana/Book_bank
- Frontend dev server: http://localhost:5173 (Vite)
- Backend API server: http://localhost:8000 (uvicorn)
- API Docs: http://localhost:8000/docs
