# Book Search API

Standalone FastAPI service that proxies the Google Books Volumes API for the Book Bank frontend.

## Setup

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Swagger docs are available at http://localhost:8000/docs once the server is running.

## Configuration

Copy `.env.example` to `.env` (or set the variable in your shell) before starting:

```
GOOGLE_BOOKS_API_KEY=<your-google-books-api-key>
```

The service **will not start** if `GOOGLE_BOOKS_API_KEY` is absent — a clear error message will tell you what to add.

## Endpoint

```
GET /api/books/external-search?q=<query>
```

| Status | Meaning |
|--------|---------|
| `200`  | JSON array of matching volume objects |
| `400`  | `q` parameter is missing or empty |
| `502`  | Google Books API returned an error |

Each volume object contains:

```json
{
  "title":         "string",
  "authors":       ["string"],
  "description":   "string",
  "publisher":     "string",
  "publishedDate": "string",
  "categories":    ["string"],
  "isbn_13":       "string",
  "thumbnail":     "string (URL or empty)",
  "pageCount":     123
}
```

## CORS

By default the service allows requests from `http://localhost:5173` (Vite) and
`http://localhost:3000`. Add the deployed frontend URL to `ALLOWED_ORIGINS` in
`main.py` before going to production.

## Notes

- No authentication is wired up here — that will be added when this merges into the team's main backend.
- The `GOOGLE_BOOKS_API_KEY` is never logged or included in error responses.
