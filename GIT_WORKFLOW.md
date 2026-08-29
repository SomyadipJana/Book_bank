# Git Workflow — Book Bank Management System

## Branch Structure

```
main
 └── develop
      ├── frontend
      └── backend
```

| Branch     | Purpose                                                   | Who works here       |
|------------|-----------------------------------------------------------|----------------------|
| `main`     | Stable, production-ready releases only                    | No direct commits    |
| `develop`  | Integration branch — receives completed frontend/backend  | Both (via PR/merge)  |
| `frontend` | Long-lived branch for all frontend (React/UI) development | Friend (frontend)    |
| `backend`  | Long-lived branch for backend, database, API development  | Krish (backend)      |

---

## Rules

- **Never commit directly to `main`.**
- **Never commit directly to `develop`** — always use a Pull Request from `frontend` or `backend`.
- Always `pull` or `fetch` before starting new work.
- Always resolve merge conflicts carefully — never discard the other person's valid work.
- Never use `git reset --hard` on shared/published branches.
- Never `force-push` to any shared branch (`main`, `develop`, `frontend`, `backend`).
- Write meaningful commit messages.

---

## A. Friend's Frontend Workflow

```bash
# Switch to your frontend branch
git switch frontend

# Always pull latest changes before starting
git pull origin frontend

# ... do your frontend work (React, UI, etc.) ...

# Stage and commit your changes
git add .
git commit -m "feat: describe what you changed"

# Push to remote
git push origin frontend
```

Then open a **Pull Request** on GitHub:
> `frontend` → `develop`

Have it reviewed, then merge. **Do not merge into `main` directly.**

---

## B. Krish's Backend Workflow

```bash
# Switch to your backend branch
git switch backend

# Always pull latest changes before starting
git pull origin backend

# ... do your backend work (Django, DRF, PostgreSQL, models, APIs) ...

# Stage and commit your changes
git add .
git commit -m "feat: describe what you changed"

# Push to remote
git push origin backend
```

Then open a **Pull Request** on GitHub:
> `backend` → `develop`

Have it reviewed, then merge. **Do not merge into `main` directly.**

---

## C. How Krish Gets the Latest Frontend Changes

After the friend's frontend changes have been merged into `develop` via a Pull Request:

```bash
git switch backend
git fetch origin
git merge origin/develop
```

This brings the latest integrated `develop` changes (including frontend updates) into your `backend` branch so your work stays up to date.

---

## D. How the Friend Gets the Latest Backend Changes

After Krish's backend changes have been merged into `develop` via a Pull Request:

```bash
git switch frontend
git fetch origin
git merge origin/develop
```

This brings the latest integrated `develop` changes (including backend updates) into the `frontend` branch.

---

## E. Final Release Workflow

When a feature/milestone is complete and fully tested on `develop`:

1. **Merge frontend work into develop** (via Pull Request)
2. **Merge backend work into develop** (via Pull Request)
3. **Test and verify** the integrated `develop` branch
4. **Open a Pull Request** on GitHub:
   > `develop` → `main`
5. Merge after approval — this becomes a stable release on `main`

---

## Remote Tracking Summary

| Local Branch | Tracks Remote      |
|--------------|--------------------|
| `main`       | `origin/main`      |
| `develop`    | `origin/develop`   |
| `frontend`   | `origin/frontend`  |
| `backend`    | `origin/backend`   |

---

## Quick Cheat Sheet

```bash
# Start working (any branch)
git switch <branch>
git pull origin <branch>

# After working
git add .
git commit -m "type: short description"
git push origin <branch>

# Get teammate's latest changes (after their PR is merged to develop)
git fetch origin
git merge origin/develop

# Check what branch you're on
git branch

# See all branches (local + remote)
git branch -a
```

---

## Database & Backend Note

The `backend` branch is reserved for:
- Python / Django / Django REST Framework setup
- PostgreSQL configuration
- Database models (ORM)
- API endpoints
- JWT authentication
- Any server-side logic

These technologies will be added to the `backend` branch only. Frontend code lives exclusively in the `frontend` branch.
