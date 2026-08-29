"""
config.py — application settings loaded from .env

python-dotenv reads the .env file in this directory.
If GOOGLE_BOOKS_API_KEY is missing, startup fails with a clear message
so developers know exactly what to fix.
"""

import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_BOOKS_API_KEY: str = os.getenv("GOOGLE_BOOKS_API_KEY", "")

if not GOOGLE_BOOKS_API_KEY:
    raise RuntimeError(
        "\n\n[book-search-api] GOOGLE_BOOKS_API_KEY is not set.\n"
        "Add it to the .env file in the project root:\n\n"
        "    GOOGLE_BOOKS_API_KEY=<your-key>\n\n"
        "You can obtain a key from https://console.cloud.google.com/ "
        "(Books API → Credentials).\n"
    )
