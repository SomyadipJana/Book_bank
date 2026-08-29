"""
google_books.py — async Google Books Volumes API client

Public interface
----------------
search_books(query, max_results=10) -> list[dict]
    Returns a list of clean volume dicts.
    Raises GoogleBooksAPIError on non-200 responses from Google.
"""

import httpx
from config import GOOGLE_BOOKS_API_KEY

BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"
REQUEST_TIMEOUT = 5.0  # seconds


class GoogleBooksAPIError(Exception):
    """Raised when the Google Books API returns a non-200 status code."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Google Books API error {status_code}: {detail}")


def _extract_isbn13(industry_identifiers: list[dict]) -> str:
    """Pull the ISBN-13 string from industryIdentifiers, or return ''."""
    for entry in industry_identifiers or []:
        if entry.get("type") == "ISBN_13":
            return entry.get("identifier", "")
    return ""


def _parse_volume(item: dict) -> dict:
    """Map a single Volumes API item to a clean application dict."""
    info: dict = item.get("volumeInfo", {})
    return {
        "title": info.get("title", ""),
        "authors": info.get("authors", []),
        "description": info.get("description", ""),
        "publisher": info.get("publisher", ""),
        "publishedDate": info.get("publishedDate", ""),
        "categories": info.get("categories", []),
        "isbn_13": _extract_isbn13(info.get("industryIdentifiers", [])),
        "thumbnail": info.get("imageLinks", {}).get("thumbnail", ""),
        "pageCount": info.get("pageCount"),
    }


async def search_books(query: str, max_results: int = 10) -> list[dict]:
    """
    Search the Google Books Volumes API.

    Parameters
    ----------
    query : str
        Free-text search query (title, author, ISBN, etc.)
    max_results : int
        Maximum number of volumes to return (1–40).

    Returns
    -------
    list[dict]
        Parsed volume records, empty list if Google returns no items.

    Raises
    ------
    GoogleBooksAPIError
        If Google responds with a non-200 HTTP status.
    """
    params = {
        "q": query,
        "maxResults": max_results,
        "key": GOOGLE_BOOKS_API_KEY,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.get(BOOKS_API_URL, params=params)

    if response.status_code != 200:
        raise GoogleBooksAPIError(
            status_code=response.status_code,
            detail="Upstream Google Books API returned an error.",
        )

    data = response.json()
    items: list[dict] = data.get("items", [])
    return [_parse_volume(item) for item in items]
