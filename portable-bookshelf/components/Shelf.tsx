import { useState, type CSSProperties } from "react";
import "../styles/shelf.css";

import shelfBackdrop from "../assets/shelf-backdrop.jpg";
import spine01 from "../assets/spine-01.png";
import spine02 from "../assets/spine-02.png";
import spine03 from "../assets/spine-03.png";
import spine04 from "../assets/spine-04.png";
import spine05 from "../assets/spine-05.png";
import spine06 from "../assets/spine-06.png";
import spine07 from "../assets/spine-07.png";
import spine08 from "../assets/spine-08.png";
import spine09 from "../assets/spine-09.png";
import spine10 from "../assets/spine-10.png";
import spine11 from "../assets/spine-11.png";
import spine12 from "../assets/spine-12.png";
import spine13 from "../assets/spine-13.png";
import spine14 from "../assets/spine-14.png";
import spine15 from "../assets/spine-15.png";
import spine16 from "../assets/spine-16.png";
import spine17 from "../assets/spine-17.png";
import spine18 from "../assets/spine-18.png";
import spine19 from "../assets/spine-19.png";
import spine20 from "../assets/spine-20.png";
import spine21 from "../assets/spine-21.png";
import spine22 from "../assets/spine-22.png";
import spine23 from "../assets/spine-23.png";
import spine24 from "../assets/spine-24.png";
import spine25 from "../assets/spine-25.png";
import spine26 from "../assets/spine-26.png";

export type ShelfBook = {
  title: string;
  src: string;
  height: number;
  lean?: number;
};

export type ShelfProps = {
  /** Optional replacement collection. Heights are source pixels and scale with the shelf. */
  books?: ShelfBook[];
  /** Text displayed while no book is active. */
  idleLabel?: string;
  /** Optional accessible name for the shelf. */
  ariaLabel?: string;
  /** Optional class added to the outer shelf element. */
  className?: string;
};

export const DEFAULT_BOOKS: ShelfBook[] = [
  { title: "Pride and Prejudice", src: spine01, height: 172 },
  { title: "Poetical Works of Longfellow", src: spine02, height: 178 },
  { title: "Complete Works of Shakespeare", src: spine03, height: 182 },
  { title: "The Red and the Black", src: spine04, height: 176 },
  { title: "Uncle Tom's Cabin", src: spine05, height: 180 },
  { title: "The Pilgrim's Progress", src: spine06, height: 168 },
  { title: "Ivanhoe", src: spine07, height: 174 },
  { title: "Tales of Scott", src: spine08, height: 158, lean: -5 },
  { title: "A Tale of Two Cities", src: spine09, height: 170 },
  { title: "The Divine Comedy", src: spine10, height: 177 },
  { title: "Gulliver's Travels", src: spine11, height: 172 },
  { title: "The Princess Casamassima", src: spine12, height: 166 },
  { title: "Holy Bible", src: spine13, height: 160 },
  { title: "Nineveh and Its Remains", src: spine14, height: 165 },
  { title: "Life of Charlotte Brontë", src: spine15, height: 158 },
  { title: "Poems by Tennyson", src: spine16, height: 168 },
  { title: "The Three Musketeers", src: spine17, height: 162 },
  { title: "The Vicar of Wakefield", src: spine18, height: 167 },
  { title: "The Scottish Chiefs", src: spine19, height: 163 },
  { title: "The Pilgrim's Progress (Bunyan)", src: spine20, height: 184 },
  { title: "Adam Bede", src: spine21, height: 170 },
  { title: "Lorna Doone", src: spine22, height: 165 },
  { title: "The Water Babies", src: spine23, height: 168 },
  { title: "The Jungle Book", src: spine24, height: 171 },
  { title: "A Yank at Oxford", src: spine25, height: 166, lean: 4 },
  { title: "Under the Deodars", src: spine26, height: 169 },
];

type BookStyle = CSSProperties & {
  "--book-height": string;
  "--book-lean": string;
};

function BookSpine({
  book,
  pulled,
  onActivate,
}: {
  book: ShelfBook;
  pulled: boolean;
  onActivate: () => void;
}) {
  const style: BookStyle = {
    "--book-height": `${book.height}px`,
    "--book-lean": `${book.lean ?? 0}deg`,
  };

  return (
    <button
      type="button"
      aria-label={`Pull out ${book.title}`}
      aria-pressed={pulled}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className={`portable-shelf__book${pulled ? " portable-shelf__book--pulled" : ""}`}
      style={style}
    >
      <img src={book.src} alt="" draggable={false} loading="lazy" />
    </button>
  );
}

export function Shelf({
  books = DEFAULT_BOOKS,
  idleLabel = "Browse the shelf",
  ariaLabel = "Library book shelf — hover or focus a book to pull it out",
  className = "",
}: ShelfProps) {
  const [pulledIndex, setPulledIndex] = useState<number | null>(null);
  const activeTitle = pulledIndex === null ? idleLabel : books[pulledIndex]?.title ?? idleLabel;

  return (
    <section
      className={`portable-shelf ${className}`.trim()}
      aria-label={ariaLabel}
      onMouseLeave={() => setPulledIndex(null)}
      style={{ "--shelf-backdrop": `url(${shelfBackdrop})` } as CSSProperties}
    >
      <div className="portable-shelf__light" aria-hidden="true" />
      <div className="portable-shelf__books">
        {books.map((book, index) => (
          <BookSpine
            key={`${book.title}-${index}`}
            book={book}
            pulled={pulledIndex === index}
            onActivate={() => setPulledIndex(index)}
          />
        ))}
      </div>
      <div className="portable-shelf__board" aria-hidden="true" />
      <p className="portable-shelf__label" aria-live="polite">{activeTitle}</p>
    </section>
  );
}

export default Shelf;
