"""
main.py — Book Search API

Runs as a standalone FastAPI service.
When this merges into the team's main backend, wire the router in instead.

Start locally:
    uvicorn main:app --reload --port 8000

Docs (auto-generated):
    http://localhost:8000/docs
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from google_books import GoogleBooksAPIError, search_books

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Book Bank — Google Books Search",
    description="Thin proxy around the Google Books Volumes API.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Add the deployed frontend URL here when this service goes to production.
# DO NOT use allow_origins=["*"] in production.

ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server (default)
    "http://localhost:3000",  # Create-React-App / Next.js dev (alternate)
    # "https://bookbank.example.com",  # <-- add production URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/api/books/external-search",
    summary="Search Google Books",
    response_description="List of matching volumes from the Google Books API",
    tags=["books"],
)
async def external_search(
    q: str = Query(
        default="",
        description="Free-text search query: title, author, ISBN, etc.",
    ),
):
    """
    Proxy search requests to the Google Books Volumes API and return
    a normalised list of volume records.

    - **q** – required; the search string
    - Returns **400** when `q` is empty
    - Returns **502** when Google Books is unreachable or returns an error
    """
    if not q.strip():
        return JSONResponse(
            status_code=400,
            content={"detail": "q parameter is required."},
        )

    try:
        results = await search_books(q)
    except GoogleBooksAPIError:
        return JSONResponse(
            status_code=502,
            content={
                "detail": (
                    "Could not retrieve results from Google Books. "
                    "Please try again shortly."
                )
            },
        )

    return results
