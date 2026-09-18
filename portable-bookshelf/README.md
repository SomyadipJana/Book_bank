# Portable Interactive Bookshelf

This is the extracted implementation currently responsible for the bookshelf visual in the source Lovable project. It contains only the shelf visual and its interaction.

## Important terminology note

The source project contains a **bookshelf**, not an iceberg. There is no iceberg, water, underwater, dissolve, shard, particle, mask, blur animation, shake loop, floating loop, or scroll-based animation in the current implementation. Those effects therefore cannot be exported as “actual” source behavior. This package preserves every behavior that does exist: realistic spine artwork, wooden backdrop, warm lighting, book lean, hover/focus/click pull-out motion, shadow transition, active title transition, mouse-leave reset, and reduced-motion handling.

## Structure

```text
portable-bookshelf/
├── components/
│   └── Shelf.tsx
├── styles/
│   └── shelf.css
├── assets/
│   ├── shelf-backdrop.jpg
│   └── spine-01.png ... spine-26.png
├── index.ts
└── README.md
```

## Dependencies

No animation or UI library is used. The only runtime peer dependencies are React and React DOM.

```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
```

- `react`: `useState` powers the active-book interaction.
- `react-dom`: required by the destination React application, not imported directly by this component.
- `typescript` and React type packages: compile the TSX and typed props.

The destination bundler must support image imports. Vite, Create React App, Next.js, and most modern React toolchains do. If your toolchain does not, move the images to `public/assets/bookshelf/` and replace imports with public URL strings.

## Installation

1. Copy this entire folder into your source tree, for example `src/features/portable-bookshelf/`.
2. Import the component:

```tsx
import Shelf from "./features/portable-bookshelf";

export function LibraryArea() {
  return (
    <div style={{ width: "min(100%, 1152px)" }}>
      <Shelf />
    </div>
  );
}
```

`Shelf.tsx` imports `shelf.css`, so no separate stylesheet import is needed.

## Props

```ts
type ShelfProps = {
  books?: ShelfBook[];
  idleLabel?: string;
  ariaLabel?: string;
  className?: string;
};

type ShelfBook = {
  title: string;
  src: string;
  height: number;
  lean?: number;
};
```

All props are optional. With no props, the exact 26-book source collection is used.

Example with a replacement collection:

```tsx
import Shelf, { type ShelfBook } from "./features/portable-bookshelf";
import myBook from "./assets/my-book.png";

const books: ShelfBook[] = [
  { title: "My Book", src: myBook, height: 172, lean: -3 },
];

<Shelf books={books} idleLabel="Choose a volume" />;
```

## Asset manifest

Place every file below in the package's `assets/` directory, adjacent to `components/` and `styles/`:

- `shelf-backdrop.jpg` — JPEG wooden shelf background; imported in `components/Shelf.tsx` and assigned to `--shelf-backdrop`.
- `spine-01.png` through `spine-26.png` — transparent PNG realistic book-spine artwork; imported in `components/Shelf.tsx` and referenced by `DEFAULT_BOOKS`.

All asset files are included in this package. There are no external URLs, SVGs, masks, clip paths, or filters requiring additional files. The visual drop shadows and lighting are native CSS.

## Animation behavior

- Hovering a book, tab-focusing it, or clicking/tapping it sets that book active.
- The active spine moves upward 30px, straightens, and scales to 1.05.
- Its drop shadow deepens during the same 300ms ease-out transition.
- Activating another spine returns the prior spine to its original position and lean.
- Moving the pointer outside the shelf resets the active spine.
- Keyboard focus is visible and updates the title.
- On narrow screens, the full collection remains available through horizontal scrolling.
- `prefers-reduced-motion: reduce` reduces transition time to 1ms.

## Styling and sizing

The CSS is namespaced under `.portable-shelf`; it does not require Tailwind. The component fills its parent width. For the source appearance, give its parent a maximum width of `1152px`.

The original label uses JetBrains Mono when available and falls back to system monospace. Loading that optional font is not required. To load it, add a normal stylesheet `<link>` in your document head.
