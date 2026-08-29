/* ── Spine colours by category ─────────────────────────────── */
export const SPINE = {
  'Computer Science': '#1A3848',
  Engineering:        '#1E3D32',
  Mathematics:        '#281E4A',
  'Algorithms & DS':  '#18294A',
  'Systems & OS':     '#2B2620',
  Networks:           '#38330E',
  Fiction:            '#3B1F2B',
  Psychology:         '#4A1E2A',
  Management:         '#2E2A24',
}

export const CATEGORIES    = [
  'Computer Science',
  'Algorithms & DS',
  'Engineering',
  'Mathematics',
  'Systems & OS',
  'Networks',
  'Fiction',
  'Psychology',
  'Management',
]
export const AVAILABILITIES = ['Available', 'On Loan']
export const FORMATS        = ['Book', 'Magazine', 'Reference']

/* ── Helper — OpenLibrary cover URL ─────────────────────────── */
export function coverUrl(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}

/* ── Book records — college book bank ─────────────────────── */
export const ALL_BOOKS = [
  /* ── Algorithms & Data Structures ──────────────────────── */
  {
    id: 1, accession: 'BB-0001', category: 'Algorithms & DS', format: 'Book',
    isbn: '9780262046305',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    edition: '4th Edition', publisher: 'MIT Press',
    addedDate: '2023-06-12', totalCopies: 5, availableCopies: 3, available: true,
    description: `Universally known as CLRS, this is the definitive undergraduate and graduate textbook on algorithms. Covers sorting, graph algorithms, dynamic programming, NP-completeness, and more with rigorous mathematical analysis and clear pseudocode.`,
  },
  {
    id: 2, accession: 'BB-0002', category: 'Algorithms & DS', format: 'Book',
    isbn: '9783030542559',
    title: 'The Algorithm Design Manual',
    author: 'Steven S. Skiena',
    edition: '3rd Edition', publisher: 'Springer',
    addedDate: '2023-08-20', totalCopies: 3, availableCopies: 0, available: false,
    description: `Skiena balances theory with practice — the first half covers design techniques (dynamic programming, backtracking, heuristics) while the second half is a unique "hitchhiker's guide" catalog of algorithmic problems and off-the-shelf solutions.`,
  },
  {
    id: 3, accession: 'BB-0003', category: 'Algorithms & DS', format: 'Book',
    isbn: '9780133907681',
    title: 'Data Structures and Algorithm Analysis in C++',
    author: 'Mark Allen Weiss',
    edition: '4th Edition', publisher: 'Pearson',
    addedDate: '2023-04-05', totalCopies: 4, availableCopies: 2, available: true,
    description: `A focused treatment of fundamental data structures — lists, trees, heaps, hash tables, graphs — alongside algorithm analysis using Big-O notation. Written in C++ with clean implementations and end-of-chapter exercises widely used in university courses.`,
  },

  /* ── Theory of Computation / Formal Languages ──────────── */
  {
    id: 4, accession: 'BB-0004', category: 'Computer Science', format: 'Book',
    isbn: '9781133187790',
    title: 'Introduction to the Theory of Computation',
    author: 'Michael Sipser',
    edition: '3rd Edition', publisher: 'Cengage Learning',
    addedDate: '2023-05-18', totalCopies: 4, availableCopies: 2, available: true,
    description: `Sipser's accessible and precise introduction to automata theory, formal languages, computability, and complexity. The go-to textbook for any undergraduate course on theory of computation, praised for its clarity and well-crafted problem sets.`,
  },
  {
    id: 5, accession: 'BB-0005', category: 'Computer Science', format: 'Book',
    isbn: '9780132051347',
    title: 'Automata, Computability and Complexity',
    author: 'Elaine Rich',
    edition: '1st Edition', publisher: 'Pearson',
    addedDate: '2023-11-02', totalCopies: 3, availableCopies: 3, available: true,
    description: `A comprehensive and modern treatment of automata theory, computability, and computational complexity with strong coverage of reductions, NP-completeness proofs, and approximation algorithms. Well-suited for advanced undergraduate courses.`,
  },

  /* ── Software Engineering ───────────────────────────────── */
  {
    id: 6, accession: 'BB-0006', category: 'Engineering', format: 'Book',
    isbn: '9780132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    edition: '1st Edition', publisher: 'Prentice Hall',
    addedDate: '2024-01-10', totalCopies: 4, availableCopies: 0, available: false,
    description: `Martin's influential guide to writing clean, readable, and maintainable code, complete with examples of bad code transformed into good code. Essential reading for any developer who cares about long-term software quality.`,
  },
  {
    id: 7, accession: 'BB-0007', category: 'Engineering', format: 'Book',
    isbn: '9780201633610',
    title: 'Design Patterns',
    author: 'Gamma, Helm, Johnson, Vlissides (Gang of Four)',
    edition: '1st Edition', publisher: 'Addison-Wesley',
    addedDate: '2024-02-14', totalCopies: 3, availableCopies: 1, available: true,
    description: `The seminal catalog of 23 reusable object-oriented design patterns that solve common software architecture problems. An essential reference that introduced a shared vocabulary for talking about design solutions.`,
  },
  {
    id: 8, accession: 'BB-0008', category: 'Engineering', format: 'Book',
    isbn: '9780135957059',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    edition: '20th Anniversary Ed.', publisher: 'Addison-Wesley',
    addedDate: '2023-09-25', totalCopies: 3, availableCopies: 2, available: true,
    description: `A practical guide to becoming a better programmer through timeless principles and concrete advice, from career development to technical craftsmanship. Widely cited as the book that changed how developers think about their work.`,
  },
  {
    id: 9, accession: 'BB-0009', category: 'Engineering', format: 'Book',
    isbn: '9780133943030',
    title: 'Software Engineering',
    author: 'Ian Sommerville',
    edition: '10th Edition', publisher: 'Pearson',
    addedDate: '2023-10-08', totalCopies: 5, availableCopies: 0, available: false,
    description: `The standard undergraduate software engineering textbook covering requirements engineering, agile methods, architectural design, testing, and project management. A comprehensive survey of the discipline used in engineering programs worldwide.`,
  },

  /* ── Systems / OS ───────────────────────────────────────── */
  {
    id: 10, accession: 'BB-0010', category: 'Systems & OS', format: 'Book',
    isbn: '9781119800361',
    title: 'Operating System Concepts',
    author: 'Silberschatz, Galvin, Gagne',
    edition: '10th Edition', publisher: 'Wiley',
    addedDate: '2024-03-22', totalCopies: 5, availableCopies: 3, available: true,
    description: `Known as the "Dinosaur Book", this is the definitive text for operating systems courses. Covers processes, threads, CPU scheduling, memory management, file systems, I/O, and security with exercises linked to a Linux simulation environment.`,
  },
  {
    id: 11, accession: 'BB-0011', category: 'Systems & OS', format: 'Book',
    isbn: '9780134997193',
    title: 'Computer Organization and Architecture',
    author: 'William Stallings',
    edition: '11th Edition', publisher: 'Pearson',
    addedDate: '2023-07-14', totalCopies: 4, availableCopies: 2, available: true,
    description: `A thorough treatment of CPU design, instruction sets, memory hierarchies, pipelining, and I/O organisation. Balances hardware concepts with software-level implications, making it suitable for both CS and ECE programmes.`,
  },

  /* ── Databases ──────────────────────────────────────────── */
  {
    id: 12, accession: 'BB-0012', category: 'Computer Science', format: 'Book',
    isbn: '9780078022159',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth, Sudarshan',
    edition: '7th Edition', publisher: 'McGraw-Hill',
    addedDate: '2023-12-01', totalCopies: 4, availableCopies: 0, available: false,
    description: `The leading database textbook covering the relational model, SQL, normalisation, transactions, concurrency control, recovery, and NoSQL systems. Used in both introductory and advanced database courses at universities worldwide.`,
  },

  /* ── Networks ───────────────────────────────────────────── */
  {
    id: 13, accession: 'BB-0013', category: 'Networks', format: 'Book',
    isbn: '9780136439677',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    edition: '6th Edition', publisher: 'Pearson',
    addedDate: '2023-08-30', totalCopies: 4, availableCopies: 3, available: true,
    description: `Tanenbaum's comprehensive treatment of the layered network model, covering physical layer, data link, network, transport, and application protocols with detailed examples. A classic reference used in networking courses for four decades.`,
  },
  {
    id: 14, accession: 'BB-0014', category: 'Networks', format: 'Book',
    isbn: '9780136681557',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose, Keith W. Ross',
    edition: '8th Edition', publisher: 'Pearson',
    addedDate: '2024-01-28', totalCopies: 3, availableCopies: 1, available: true,
    description: `Takes a unique top-down approach, starting from application-layer protocols (HTTP, DNS, SMTP) before descending to transport, network, and link layers. Widely adopted for its intuitive explanations and Wireshark lab exercises.`,
  },

  /* ── Mathematics ────────────────────────────────────────── */
  {
    id: 15, accession: 'BB-0015', category: 'Mathematics', format: 'Book',
    isbn: '9780072899054',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    edition: '8th Edition', publisher: 'McGraw-Hill',
    addedDate: '2023-05-03', totalCopies: 6, availableCopies: 2, available: true,
    description: `The standard discrete mathematics textbook for computer science students, covering logic, sets, functions, number theory, induction, combinatorics, graph theory, and Boolean algebra with hundreds of examples and exercises.`,
  },
  {
    id: 16, accession: 'BB-0016', category: 'Mathematics', format: 'Book',
    isbn: '9780980232776',
    title: 'Linear Algebra and Its Applications',
    author: 'Gilbert Strang',
    edition: '5th Edition', publisher: 'Cengage Learning',
    addedDate: '2023-06-20', totalCopies: 4, availableCopies: 0, available: false,
    description: `Strang's celebrated textbook makes linear algebra both accessible and profound, emphasising geometric intuition alongside computation. Accompanied by MIT OpenCourseWare lectures, it is the most-watched mathematics course on the internet.`,
  },

  /* ── Non-technical general titles ───────────────────────── */
  {
    id: 17, accession: 'BB-0017', category: 'Management', format: 'Book',
    isbn: '9780201835953',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    edition: 'Anniversary Edition', publisher: 'Addison-Wesley',
    addedDate: '2023-09-15', totalCopies: 3, availableCopies: 1, available: true,
    description: `Brooks's classic essays on software project management, most famous for the observation that adding manpower to a late project makes it later. Remarkably relevant decades after its first publication.`,
  },
  {
    id: 18, accession: 'BB-0018', category: 'Psychology', format: 'Book',
    isbn: '9780374533557',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    edition: '1st Edition', publisher: 'Farrar, Straus and Giroux',
    addedDate: '2024-02-05', totalCopies: 3, availableCopies: 2, available: true,
    description: `Kahneman explains the two systems that drive human thought — fast, intuitive System 1 and slow, deliberate System 2 — and how their interplay leads to predictable errors of judgment. Essential reading for engineers and managers alike.`,
  },
  {
    id: 19, accession: 'BB-0019', category: 'Fiction', format: 'Book',
    isbn: '9780330508537',
    title: `The Hitchhiker's Guide to the Galaxy`,
    author: 'Douglas Adams',
    edition: '25th Anniversary Ed.', publisher: 'Pan Books',
    addedDate: '2023-11-18', totalCopies: 3, availableCopies: 2, available: true,
    description: `Adams's comedic sci-fi classic follows Arthur Dent after Earth is demolished to make way for a hyperspace bypass. A beloved staple of any college library, it teaches systems thinking through absurdist wit.`,
  },
  {
    id: 20, accession: 'BB-0020', category: 'Management', format: 'Book',
    isbn: '9781942788294',
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    edition: '5th Anniversary Ed.', publisher: 'IT Revolution Press',
    addedDate: '2023-07-22', totalCopies: 3, availableCopies: 0, available: false,
    description: `A novel about IT, DevOps, and helping your business win. Bill Palmer must save a failing IT project in 90 days, learning along the way that IT work is just like manufacturing plant work. The go-to book for understanding DevOps culture.`,
  },

  /* ── Reference ──────────────────────────────────────────── */
  {
    id: 21, accession: 'BB-0021', category: 'Computer Science', format: 'Reference',
    isbn: '9780199688975',
    title: 'Oxford Dictionary of Computer Science',
    author: 'Oxford University Press',
    edition: '6th Edition', publisher: 'Oxford University Press',
    addedDate: '2023-08-01', totalCopies: 2, availableCopies: 2, available: true,
    description: `A comprehensive reference covering over 6,500 terms across all areas of computing, from algorithms and data structures to networks and artificial intelligence. An authoritative desk reference for students and practitioners alike.`,
  },
]
