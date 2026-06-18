// Elevana e-learning catalog seed data.
// Pure data module — no imports, no Mongoose. Just typed interfaces + the exported `seedCourses` array.

export interface SeedOption {
  optionText: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  questionText: string;
  points?: number;
  options: SeedOption[];
}

export interface SeedQuiz {
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  questions: SeedQuestion[];
}

export interface SeedLevel {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  requiredScore?: number;
  quiz?: SeedQuiz;
}

export interface SeedCourse {
  id: string; // url slug, e.g. "react-foundations"
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string; // e.g. Frontend, Backend, Data Science, Design, DevOps, Mobile, AI, Cloud
  duration: number; // total hours
  price: number; // 0 for free, otherwise e.g. 29.99
  imageUrl: string;
  instructor: string;
  rating: number; // 4.0 - 5.0
  totalStudents: number; // realistic, e.g. 1200 - 40000
  tags: string[];
  levels: SeedLevel[];
}

export const seedCourses: SeedCourse[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. React Foundations (local cover image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "react-foundations",
    title: "React Foundations",
    description:
      "Build modern, component-driven user interfaces with React. Learn JSX, props, state, hooks, and effects through hands-on projects that mirror real production code.",
    difficulty: "beginner",
    category: "Frontend",
    duration: 14,
    price: 0,
    imageUrl: "/images/courses/react-foundations.jpg",
    instructor: "Sophia Bennett",
    rating: 4.8,
    totalStudents: 38420,
    tags: ["react", "javascript", "frontend", "hooks", "components"],
    levels: [
      {
        id: "react-foundations-level-1",
        title: "Thinking in Components & JSX",
        description: "Understand React's component model and the JSX syntax that powers it.",
        content:
          "React lets you describe UI as a tree of **components** — reusable functions that return JSX. JSX is syntactic sugar that compiles to `React.createElement` calls, so an element like `<h1>Hi</h1>` becomes a plain JavaScript object (a React element) describing what to render. Components must return a single root node, which is why we often wrap siblings in a fragment (`<>...</>`). Because JSX is JavaScript, you embed expressions with curly braces (`{user.name}`) and use `className` instead of `class`. Thinking in components means breaking an interface into small, focused, composable pieces with a clear single responsibility.",
        videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        duration: 35,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          description: "Check your understanding of components and JSX.",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does JSX compile down to under the hood?",
              points: 1,
              options: [
                { optionText: "Direct DOM mutations via document.createElement", isCorrect: false },
                { optionText: "Calls to React.createElement that return React element objects", isCorrect: true },
                { optionText: "An HTML string injected with innerHTML", isCorrect: false },
                { optionText: "A WebAssembly module", isCorrect: false },
              ],
            },
            {
              questionText: "Why must a component return a single root element?",
              points: 1,
              options: [
                { optionText: "Because React elements describe one node; siblings need a wrapper or fragment", isCorrect: true },
                { optionText: "Because JavaScript functions can only return strings", isCorrect: false },
                { optionText: "Because the browser forbids multiple root tags", isCorrect: false },
                { optionText: "It is only a styling convention with no real reason", isCorrect: false },
              ],
            },
            {
              questionText: "Which attribute replaces HTML's `class` in JSX?",
              points: 1,
              options: [
                { optionText: "cssClass", isCorrect: false },
                { optionText: "class", isCorrect: false },
                { optionText: "className", isCorrect: true },
                { optionText: "classList", isCorrect: false },
              ],
            },
            {
              questionText: "How do you embed a JavaScript expression inside JSX?",
              points: 1,
              options: [
                { optionText: "Wrap it in double curly braces like {{value}}", isCorrect: false },
                { optionText: "Wrap it in single curly braces like {value}", isCorrect: true },
                { optionText: "Use ${value} template syntax", isCorrect: false },
                { optionText: "Use <%= value %> tags", isCorrect: false },
              ],
            },
            {
              questionText: "What is the empty `<>...</>` syntax called?",
              points: 1,
              options: [
                { optionText: "A portal", isCorrect: false },
                { optionText: "A fragment", isCorrect: true },
                { optionText: "A slot", isCorrect: false },
                { optionText: "A template literal", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "react-foundations-level-2",
        title: "Props & Composition",
        description: "Pass data down the tree and compose components together.",
        content:
          "**Props** are the read-only inputs a parent passes to a child component, received as a single `props` object (or destructured in the parameter list). Props create a one-way data flow: data flows down from parent to child, and children never mutate the props they receive. The special `children` prop lets a component render whatever JSX you nest inside it, which is the basis of composition patterns like layout wrappers and cards. Because props are immutable, a component re-renders only when its parent passes new prop values. Good component design favors composition over deep prop drilling — passing whole elements through `children` instead of threading many individual props.",
        videoUrl: "https://www.youtube.com/watch?v=PHaECbrKgs0",
        duration: 30,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the direction of data flow with props in React?",
              points: 1,
              options: [
                { optionText: "Bidirectional between parent and child", isCorrect: false },
                { optionText: "One-way, from parent down to child", isCorrect: true },
                { optionText: "Upward, from child to parent", isCorrect: false },
                { optionText: "Sideways, between sibling components", isCorrect: false },
              ],
            },
            {
              questionText: "Can a child component mutate the props it receives?",
              points: 1,
              options: [
                { optionText: "No, props are read-only", isCorrect: true },
                { optionText: "Yes, by reassigning props.value", isCorrect: false },
                { optionText: "Yes, but only inside useEffect", isCorrect: false },
                { optionText: "Only if the prop is an object", isCorrect: false },
              ],
            },
            {
              questionText: "What does the special `children` prop contain?",
              points: 1,
              options: [
                { optionText: "The component's internal state", isCorrect: false },
                { optionText: "The JSX nested between the component's opening and closing tags", isCorrect: true },
                { optionText: "A list of the component's DOM event handlers", isCorrect: false },
                { optionText: "The parent component's props", isCorrect: false },
              ],
            },
            {
              questionText: "Which technique helps avoid excessive 'prop drilling'?",
              points: 1,
              options: [
                { optionText: "Passing elements via children / composition", isCorrect: true },
                { optionText: "Storing props in global variables", isCorrect: false },
                { optionText: "Mutating props in place", isCorrect: false },
                { optionText: "Re-declaring props with var", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "react-foundations-level-3",
        title: "State with useState",
        description: "Make components interactive with local state.",
        content:
          "The `useState` hook adds local, reactive state to a function component: `const [count, setCount] = useState(0)` returns the current value and a setter. Calling the setter schedules a re-render with the new value — you must never mutate state directly, because React compares values to decide what to update. State updates are batched and asynchronous, so when the next value depends on the previous one you should use the functional form `setCount(prev => prev + 1)`. State is local and isolated: each instance of a component keeps its own copy, and updating one does not affect another. Initial state passed to `useState` is only used on the first render.",
        videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
        duration: 38,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does `useState(0)` return?",
              points: 1,
              options: [
                { optionText: "A single state value only", isCorrect: false },
                { optionText: "An array of the current value and a setter function", isCorrect: true },
                { optionText: "An object with get and set methods", isCorrect: false },
                { optionText: "A Promise that resolves to the state", isCorrect: false },
              ],
            },
            {
              questionText: "Why should you avoid mutating state directly?",
              points: 1,
              options: [
                { optionText: "React relies on new references/values to detect changes and re-render", isCorrect: true },
                { optionText: "Direct mutation throws a runtime error every time", isCorrect: false },
                { optionText: "Mutation permanently freezes the component", isCorrect: false },
                { optionText: "It is allowed and identical to using the setter", isCorrect: false },
              ],
            },
            {
              questionText: "When the next state depends on the previous, which form is safest?",
              points: 1,
              options: [
                { optionText: "setCount(count + 1)", isCorrect: false },
                { optionText: "count = count + 1", isCorrect: false },
                { optionText: "setCount(prev => prev + 1)", isCorrect: true },
                { optionText: "useState(count + 1)", isCorrect: false },
              ],
            },
            {
              questionText: "How is the initial value passed to useState used?",
              points: 1,
              options: [
                { optionText: "It is applied on every render", isCorrect: false },
                { optionText: "It is used only on the first render", isCorrect: true },
                { optionText: "It overwrites state whenever props change", isCorrect: false },
                { optionText: "It is ignored entirely", isCorrect: false },
              ],
            },
            {
              questionText: "Is state shared between two instances of the same component?",
              points: 1,
              options: [
                { optionText: "Yes, all instances share one state object", isCorrect: false },
                { optionText: "No, each instance keeps its own isolated state", isCorrect: true },
                { optionText: "Only if they have the same key", isCorrect: false },
                { optionText: "Only when rendered inside a list", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "react-foundations-level-4",
        title: "Side Effects with useEffect",
        description: "Synchronize components with external systems.",
        content:
          "`useEffect` runs code *after* render to synchronize a component with something outside React — network requests, subscriptions, timers, or the DOM. Its second argument, the **dependency array**, controls when it re-runs: `[]` runs it once after mount, `[a, b]` re-runs when `a` or `b` change, and omitting it runs the effect after every render. An effect can return a **cleanup function** that React calls before the next run and on unmount — essential for clearing timers and removing event listeners to avoid leaks. Effects should not be used for data you can compute during render; prefer deriving values directly. Treat the dependency array honestly: include every reactive value the effect reads.",
        videoUrl: "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
        duration: 42,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "When does the effect in `useEffect(fn, [])` run?",
              points: 1,
              options: [
                { optionText: "On every render", isCorrect: false },
                { optionText: "Once, after the component first mounts", isCorrect: true },
                { optionText: "Only when the component unmounts", isCorrect: false },
                { optionText: "Synchronously before render", isCorrect: false },
              ],
            },
            {
              questionText: "What is the purpose of the function an effect can return?",
              points: 1,
              options: [
                { optionText: "It is the cleanup function run before re-running and on unmount", isCorrect: true },
                { optionText: "It is the new component render output", isCorrect: false },
                { optionText: "It sets the next state value", isCorrect: false },
                { optionText: "It is ignored by React", isCorrect: false },
              ],
            },
            {
              questionText: "What controls how often an effect re-runs?",
              points: 1,
              options: [
                { optionText: "The component's key", isCorrect: false },
                { optionText: "The dependency array passed as the second argument", isCorrect: true },
                { optionText: "The order of hooks in the file", isCorrect: false },
                { optionText: "The browser refresh rate", isCorrect: false },
              ],
            },
            {
              questionText: "Which task is a good fit for useEffect?",
              points: 1,
              options: [
                { optionText: "Subscribing to a WebSocket and cleaning it up later", isCorrect: true },
                { optionText: "Computing a derived value already available during render", isCorrect: false },
                { optionText: "Reading a prop's value", isCorrect: false },
                { optionText: "Defining JSX markup", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. TypeScript Essentials (local cover image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "typescript-essentials",
    title: "TypeScript Essentials",
    description:
      "Add static types to JavaScript and ship more reliable code. Master types, interfaces, generics, narrowing, and the compiler configuration that real teams depend on.",
    difficulty: "intermediate",
    category: "Frontend",
    duration: 12,
    price: 29.99,
    imageUrl: "/images/courses/typescript-essentials.jpg",
    instructor: "Daniel Cho",
    rating: 4.7,
    totalStudents: 21750,
    tags: ["typescript", "javascript", "types", "generics", "tooling"],
    levels: [
      {
        id: "typescript-essentials-level-1",
        title: "Types, Inference & Annotations",
        description: "Understand the building blocks of TypeScript's type system.",
        content:
          "TypeScript is a **superset of JavaScript** that adds an optional, structural static type system checked at compile time and erased at runtime. You can annotate variables (`let age: number = 30`), but TypeScript also **infers** types automatically, so explicit annotations are often unnecessary. Core primitive types include `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, and `bigint`, plus the special `any` (opts out of checking) and `unknown` (a safe top type you must narrow before use). The compiler's `strict` mode enables important checks like `strictNullChecks`, which forces you to handle `null`/`undefined` explicitly. Because the type system is **structural**, compatibility is based on shape, not on the name of a type.",
        videoUrl: "https://www.youtube.com/watch?v=BCg4U1FzODs",
        duration: 33,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What happens to TypeScript types at runtime?",
              points: 1,
              options: [
                { optionText: "They are erased; the emitted JavaScript has no type info", isCorrect: true },
                { optionText: "They are enforced by the browser at runtime", isCorrect: false },
                { optionText: "They are compiled into reflection metadata by default", isCorrect: false },
                { optionText: "They become runtime assertions automatically", isCorrect: false },
              ],
            },
            {
              questionText: "How does `unknown` differ from `any`?",
              points: 1,
              options: [
                { optionText: "They are identical", isCorrect: false },
                { optionText: "`unknown` is type-safe and must be narrowed before use; `any` disables checks", isCorrect: true },
                { optionText: "`unknown` disables all type checking", isCorrect: false },
                { optionText: "`any` cannot be assigned to other types", isCorrect: false },
              ],
            },
            {
              questionText: "TypeScript's type compatibility is based on what?",
              points: 1,
              options: [
                { optionText: "The declared name of the type (nominal typing)", isCorrect: false },
                { optionText: "The shape/structure of the type (structural typing)", isCorrect: true },
                { optionText: "The file the type is declared in", isCorrect: false },
                { optionText: "Memory layout at runtime", isCorrect: false },
              ],
            },
            {
              questionText: "What does enabling `strictNullChecks` require of you?",
              points: 1,
              options: [
                { optionText: "Explicitly handling possible null/undefined values", isCorrect: true },
                { optionText: "Using only the any type", isCorrect: false },
                { optionText: "Disabling type inference", isCorrect: false },
                { optionText: "Compiling to ES3", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "typescript-essentials-level-2",
        title: "Interfaces, Types & Unions",
        description: "Model object shapes and combine types.",
        content:
          "You describe object shapes with `interface` or `type` aliases — both work for objects, but only `interface` supports declaration merging, while `type` can also alias unions, tuples, and primitives. A **union type** like `string | number` means a value may be one of several types; an **intersection** `A & B` combines members of both. **Literal types** (`'left' | 'right'`) let you constrain a value to specific allowed strings or numbers, which is great for state machines and props. Optional members use `?` (`name?: string`) and become `T | undefined`. Prefer `interface` for public object contracts that may be extended, and `type` for unions and computed/mapped types.",
        videoUrl: "https://www.youtube.com/watch?v=2pZmKW9-I_k",
        duration: 36,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does the union type `string | number` express?",
              points: 1,
              options: [
                { optionText: "A value that must be both a string and a number", isCorrect: false },
                { optionText: "A value that may be either a string or a number", isCorrect: true },
                { optionText: "An array of strings and numbers", isCorrect: false },
                { optionText: "A function taking a string and returning a number", isCorrect: false },
              ],
            },
            {
              questionText: "Which capability is unique to `interface` over `type`?",
              points: 1,
              options: [
                { optionText: "Declaration merging", isCorrect: true },
                { optionText: "Describing object shapes", isCorrect: false },
                { optionText: "Being used as a generic constraint", isCorrect: false },
                { optionText: "Aliasing primitive types", isCorrect: false },
              ],
            },
            {
              questionText: "What is the effect of marking a member optional with `?`?",
              points: 1,
              options: [
                { optionText: "It makes the type read-only", isCorrect: false },
                { optionText: "Its type becomes `T | undefined` and it may be omitted", isCorrect: true },
                { optionText: "It forces the member to be present", isCorrect: false },
                { optionText: "It removes the member from the type", isCorrect: false },
              ],
            },
            {
              questionText: "What does an intersection type `A & B` produce?",
              points: 1,
              options: [
                { optionText: "A type with the members of both A and B", isCorrect: true },
                { optionText: "A type that is either A or B", isCorrect: false },
                { optionText: "A type with only the shared members", isCorrect: false },
                { optionText: "A tuple of A and B", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "typescript-essentials-level-3",
        title: "Generics",
        description: "Write reusable, type-safe abstractions.",
        content:
          "**Generics** let you write components and functions that work over many types while preserving type information. A generic function like `function identity<T>(value: T): T` captures the caller's type in the type parameter `T`, so the return type tracks the input. You can constrain a type parameter with `extends` (`<T extends { id: number }>`) to require certain members, and supply defaults (`<T = string>`). Generics power the standard library — `Array<T>`, `Promise<T>`, `Map<K, V>` — and your own reusable utilities. The key benefit over `any` is that generics keep the relationship between inputs and outputs, so the compiler still catches mistakes.",
        videoUrl: "https://www.youtube.com/watch?v=nViEqpgwxHE",
        duration: 40,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the main advantage of generics over using `any`?",
              points: 1,
              options: [
                { optionText: "They run faster at runtime", isCorrect: false },
                { optionText: "They preserve the relationship between input and output types", isCorrect: true },
                { optionText: "They disable type checking for flexibility", isCorrect: false },
                { optionText: "They reduce the bundle size", isCorrect: false },
              ],
            },
            {
              questionText: "How do you require a type parameter to have certain members?",
              points: 1,
              options: [
                { optionText: "Using `T implements Shape`", isCorrect: false },
                { optionText: "Using a constraint like `<T extends { id: number }>`", isCorrect: true },
                { optionText: "Using `T as Shape`", isCorrect: false },
                { optionText: "Generics cannot be constrained", isCorrect: false },
              ],
            },
            {
              questionText: "In `function identity<T>(value: T): T`, what is the return type for `identity('hi')`?",
              points: 1,
              options: [
                { optionText: "string", isCorrect: true },
                { optionText: "any", isCorrect: false },
                { optionText: "unknown", isCorrect: false },
                { optionText: "T", isCorrect: false },
              ],
            },
            {
              questionText: "Which of these is a built-in generic type?",
              points: 1,
              options: [
                { optionText: "Promise<T>", isCorrect: true },
                { optionText: "strict<T>", isCorrect: false },
                { optionText: "infer<T>", isCorrect: false },
                { optionText: "guard<T>", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "typescript-essentials-level-4",
        title: "Narrowing & Type Guards",
        description: "Refine union types to safe, specific types.",
        content:
          "**Narrowing** is how TypeScript reduces a broad type (like a union) to a more specific one inside a code branch. Common narrowing tools include `typeof` checks for primitives, `instanceof` for class instances, the `in` operator for property presence, and equality checks. You can also write a **user-defined type guard** — a function returning `value is Fish` — to teach the compiler about custom predicates. Using a **discriminated union** (a shared literal `kind` field) lets a `switch` exhaustively narrow each variant, and pairing it with a `never` default catches unhandled cases at compile time. Narrowing is what makes union types ergonomic and safe to work with.",
        videoUrl: "https://www.youtube.com/watch?v=pa4P0fX4xUM",
        duration: 37,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the return type annotation of a user-defined type guard?",
              points: 1,
              options: [
                { optionText: "boolean", isCorrect: false },
                { optionText: "value is SomeType", isCorrect: true },
                { optionText: "asserts SomeType", isCorrect: false },
                { optionText: "keyof SomeType", isCorrect: false },
              ],
            },
            {
              questionText: "Which operator checks whether a property exists on an object for narrowing?",
              points: 1,
              options: [
                { optionText: "the `in` operator", isCorrect: true },
                { optionText: "the `of` operator", isCorrect: false },
                { optionText: "the `as` operator", isCorrect: false },
                { optionText: "the `is` operator", isCorrect: false },
              ],
            },
            {
              questionText: "What distinguishes a discriminated union?",
              points: 1,
              options: [
                { optionText: "Every member shares a common literal 'tag' property", isCorrect: true },
                { optionText: "It can only contain two members", isCorrect: false },
                { optionText: "All members must be primitives", isCorrect: false },
                { optionText: "It disables type narrowing", isCorrect: false },
              ],
            },
            {
              questionText: "How can a `never` typed default branch help in a switch?",
              points: 1,
              options: [
                { optionText: "It speeds up the switch at runtime", isCorrect: false },
                { optionText: "It produces a compile-time error if a union case is unhandled", isCorrect: true },
                { optionText: "It silences all type errors", isCorrect: false },
                { optionText: "It converts the value to any", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Next.js App Router (local cover image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nextjs-app-router",
    title: "Next.js App Router",
    description:
      "Build full-stack React apps with the Next.js App Router. Master Server Components, routing conventions, data fetching, caching, and Server Actions for modern web apps.",
    difficulty: "intermediate",
    category: "Frontend",
    duration: 16,
    price: 49.99,
    imageUrl: "/images/courses/nextjs-app-router.jpg",
    instructor: "Maya Rodriguez",
    rating: 4.9,
    totalStudents: 18900,
    tags: ["nextjs", "react", "ssr", "app-router", "fullstack"],
    levels: [
      {
        id: "nextjs-app-router-level-1",
        title: "File-System Routing & Layouts",
        description: "Understand how the app/ directory maps to routes.",
        content:
          "In the App Router, the `app/` directory defines routes by folder structure: each folder is a URL segment, and a `page.tsx` file makes that segment publicly routable. A `layout.tsx` wraps its segment and all nested children, preserving state across navigation and enabling shared UI like navbars. Special files give you conventions for free: `loading.tsx` shows an instant loading state (via Suspense), `error.tsx` is an error boundary, and `not-found.tsx` renders 404s. Dynamic segments use bracket folders like `[id]`, and route groups `(group)` organize folders without affecting the URL. Layouts nest, so a root layout (which must include `<html>` and `<body>`) wraps every page.",
        videoUrl: "https://www.youtube.com/watch?v=gSSsZreIFRk",
        duration: 34,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which file makes a route segment publicly accessible?",
              points: 1,
              options: [
                { optionText: "route.tsx", isCorrect: false },
                { optionText: "page.tsx", isCorrect: true },
                { optionText: "index.tsx", isCorrect: false },
                { optionText: "view.tsx", isCorrect: false },
              ],
            },
            {
              questionText: "What is the purpose of `layout.tsx`?",
              points: 1,
              options: [
                { optionText: "It defines a 404 page", isCorrect: false },
                { optionText: "It wraps a segment and its children with shared, persistent UI", isCorrect: true },
                { optionText: "It declares server-only API endpoints", isCorrect: false },
                { optionText: "It configures the build pipeline", isCorrect: false },
              ],
            },
            {
              questionText: "How do you create a dynamic route segment for an id?",
              points: 1,
              options: [
                { optionText: "A folder named {id}", isCorrect: false },
                { optionText: "A folder named [id]", isCorrect: true },
                { optionText: "A folder named :id", isCorrect: false },
                { optionText: "A file named id.dynamic.tsx", isCorrect: false },
              ],
            },
            {
              questionText: "What does a route group folder like `(marketing)` do?",
              points: 1,
              options: [
                { optionText: "Organizes routes without adding a URL segment", isCorrect: true },
                { optionText: "Creates a required dynamic parameter", isCorrect: false },
                { optionText: "Makes the route server-only", isCorrect: false },
                { optionText: "Adds 'marketing' to the URL path", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nextjs-app-router-level-2",
        title: "Server vs Client Components",
        description: "Know when code runs on the server or the browser.",
        content:
          "In the App Router, components are **Server Components by default** — they run only on the server, can be `async`, can access the database or secrets directly, and send zero JavaScript to the browser. To add interactivity (state, effects, event handlers, browser APIs), you opt a component into the client with the `'use client'` directive at the top of the file. A client component and everything it imports becomes part of the client bundle, so you push `'use client'` as far down the tree (toward the leaves) as possible. Server Components can render client components, but you pass data down as serializable props. This split reduces bundle size and keeps sensitive logic on the server.",
        videoUrl: "https://www.youtube.com/watch?v=RBM03RihZVs",
        duration: 38,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "By default, what kind of component is created in the App Router?",
              points: 1,
              options: [
                { optionText: "A Client Component", isCorrect: false },
                { optionText: "A Server Component", isCorrect: true },
                { optionText: "A static HTML file", isCorrect: false },
                { optionText: "An edge function", isCorrect: false },
              ],
            },
            {
              questionText: "Which directive opts a component into the client?",
              points: 1,
              options: [
                { optionText: "'use server'", isCorrect: false },
                { optionText: "'use client'", isCorrect: true },
                { optionText: "'client only'", isCorrect: false },
                { optionText: "'use browser'", isCorrect: false },
              ],
            },
            {
              questionText: "Which feature requires a Client Component?",
              points: 1,
              options: [
                { optionText: "Using the useState hook and onClick handlers", isCorrect: true },
                { optionText: "Reading from a database with async/await", isCorrect: false },
                { optionText: "Accessing a server-side secret key", isCorrect: false },
                { optionText: "Rendering static markup", isCorrect: false },
              ],
            },
            {
              questionText: "Why push `'use client'` toward the leaves of the tree?",
              points: 1,
              options: [
                { optionText: "To minimize how much code ships to the browser bundle", isCorrect: true },
                { optionText: "Because the root layout cannot render client components", isCorrect: false },
                { optionText: "To enable async server data fetching in the client", isCorrect: false },
                { optionText: "It has no effect; placement is arbitrary", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nextjs-app-router-level-3",
        title: "Data Fetching & Caching",
        description: "Fetch data on the server and control caching.",
        content:
          "Server Components fetch data directly with `async/await`, often using the extended `fetch` API, eliminating the need for client-side data hooks for initial loads. Next.js augments `fetch` with caching options: by default, requests can be cached, and you control freshness with `{ next: { revalidate: 60 } }` for time-based revalidation or `{ cache: 'no-store' }` to always fetch fresh. **Incremental Static Regeneration (ISR)** lets statically generated pages update in the background after a revalidation window. You can also tag fetches and invalidate them on demand with `revalidateTag`. Streaming with Suspense lets parts of a page render as their data resolves, improving perceived performance.",
        videoUrl: "https://www.youtube.com/watch?v=O5cmLDVTgAs",
        duration: 41,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "How do Server Components typically fetch initial data?",
              points: 1,
              options: [
                { optionText: "With useEffect and useState on the client", isCorrect: false },
                { optionText: "Directly with async/await in the component", isCorrect: true },
                { optionText: "Only through a global Redux store", isCorrect: false },
                { optionText: "They cannot fetch data", isCorrect: false },
              ],
            },
            {
              questionText: "Which option forces fetch to always get fresh data?",
              points: 1,
              options: [
                { optionText: "{ cache: 'force-cache' }", isCorrect: false },
                { optionText: "{ next: { revalidate: 3600 } }", isCorrect: false },
                { optionText: "{ cache: 'no-store' }", isCorrect: true },
                { optionText: "{ static: true }", isCorrect: false },
              ],
            },
            {
              questionText: "What does `{ next: { revalidate: 60 } }` do?",
              points: 1,
              options: [
                { optionText: "Revalidates the cached data after 60 seconds", isCorrect: true },
                { optionText: "Retries the request 60 times", isCorrect: false },
                { optionText: "Caches the response for 60 days only", isCorrect: false },
                { optionText: "Disables caching entirely", isCorrect: false },
              ],
            },
            {
              questionText: "What does ISR (Incremental Static Regeneration) enable?",
              points: 1,
              options: [
                { optionText: "Static pages that update in the background after a revalidation window", isCorrect: true },
                { optionText: "Client-only rendering for SEO", isCorrect: false },
                { optionText: "Disabling all caching forever", isCorrect: false },
                { optionText: "Bundling images into the HTML", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nextjs-app-router-level-4",
        title: "Server Actions & Mutations",
        description: "Mutate data securely without a separate API layer.",
        content:
          "**Server Actions** are async functions marked with the `'use server'` directive that run on the server but can be invoked directly from components, including from a `<form action={...}>`. They let you handle mutations — creating, updating, deleting data — without manually writing API route handlers or client fetch calls. Because they execute on the server, they can safely access secrets and the database, and Next.js handles the network round-trip for you. After a mutation you typically call `revalidatePath` or `revalidateTag` to refresh cached data, or `redirect` to navigate. Server Actions support progressive enhancement: forms work even before JavaScript loads.",
        videoUrl: "https://www.youtube.com/watch?v=dDpZfOQBMaU",
        duration: 39,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which directive marks a function as a Server Action?",
              points: 1,
              options: [
                { optionText: "'use client'", isCorrect: false },
                { optionText: "'use server'", isCorrect: true },
                { optionText: "'use action'", isCorrect: false },
                { optionText: "'server only'", isCorrect: false },
              ],
            },
            {
              questionText: "What is a primary benefit of Server Actions?",
              points: 1,
              options: [
                { optionText: "They handle mutations without a separate API route or manual fetch", isCorrect: true },
                { optionText: "They run entirely in the browser for speed", isCorrect: false },
                { optionText: "They replace the need for a database", isCorrect: false },
                { optionText: "They disable server rendering", isCorrect: false },
              ],
            },
            {
              questionText: "After a successful mutation, what do you commonly call?",
              points: 1,
              options: [
                { optionText: "useEffect", isCorrect: false },
                { optionText: "revalidatePath or revalidateTag", isCorrect: true },
                { optionText: "localStorage.clear", isCorrect: false },
                { optionText: "ReactDOM.render", isCorrect: false },
              ],
            },
            {
              questionText: "How can a Server Action be triggered from a form?",
              points: 1,
              options: [
                { optionText: "Via the form's `action` prop", isCorrect: true },
                { optionText: "Only through a useState setter", isCorrect: false },
                { optionText: "By importing it into a CSS file", isCorrect: false },
                { optionText: "It cannot be used with forms", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Node.js Backend (local cover image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nodejs-backend",
    title: "Node.js Backend Development",
    description:
      "Build fast, scalable backend services with Node.js and Express. Learn the event loop, REST APIs, middleware, authentication, and connecting to databases the right way.",
    difficulty: "intermediate",
    category: "Backend",
    duration: 18,
    price: 39.99,
    imageUrl: "/images/courses/nodejs-backend.jpg",
    instructor: "Arjun Patel",
    rating: 4.6,
    totalStudents: 27300,
    tags: ["nodejs", "express", "backend", "api", "rest"],
    levels: [
      {
        id: "nodejs-backend-level-1",
        title: "The Event Loop & Async Model",
        description: "Understand how Node handles concurrency.",
        content:
          "Node.js runs JavaScript on a **single main thread** using a non-blocking, event-driven model powered by the libuv **event loop**. Instead of blocking on I/O (files, network, databases), Node offloads those operations and registers callbacks that run when the work completes, letting one thread handle many concurrent connections. The event loop processes phases (timers, pending callbacks, poll, check, close) in order; `setImmediate` runs in the check phase while `process.nextTick` and Promise microtasks run before the loop continues. Because the thread is shared, CPU-heavy synchronous work blocks everything — offload it to worker threads or break it up. Modern Node favors Promises and `async/await` over nested callbacks.",
        videoUrl: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
        duration: 40,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "How many threads does Node.js use to run your JavaScript by default?",
              points: 1,
              options: [
                { optionText: "One main thread", isCorrect: true },
                { optionText: "One thread per CPU core automatically", isCorrect: false },
                { optionText: "One thread per request", isCorrect: false },
                { optionText: "It does not use threads at all", isCorrect: false },
              ],
            },
            {
              questionText: "What happens when Node performs non-blocking I/O?",
              points: 1,
              options: [
                { optionText: "The main thread waits idly until I/O completes", isCorrect: false },
                { optionText: "The operation is offloaded and a callback runs when it finishes", isCorrect: true },
                { optionText: "The process forks a new copy of itself", isCorrect: false },
                { optionText: "The request is rejected", isCorrect: false },
              ],
            },
            {
              questionText: "Why is CPU-bound synchronous work problematic in Node?",
              points: 1,
              options: [
                { optionText: "It blocks the single event-loop thread, stalling other requests", isCorrect: true },
                { optionText: "It automatically crashes the process", isCorrect: false },
                { optionText: "It only runs at night", isCorrect: false },
                { optionText: "It cannot be written in JavaScript", isCorrect: false },
              ],
            },
            {
              questionText: "Which runs first relative to the event loop continuing?",
              points: 1,
              options: [
                { optionText: "setTimeout callbacks", isCorrect: false },
                { optionText: "process.nextTick and Promise microtasks", isCorrect: true },
                { optionText: "close event callbacks", isCorrect: false },
                { optionText: "setImmediate callbacks", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nodejs-backend-level-2",
        title: "Building REST APIs with Express",
        description: "Define routes, handle requests, and send responses.",
        content:
          "**Express** is a minimal web framework that maps HTTP methods and paths to handler functions via its routing API (`app.get`, `app.post`, etc.). A handler receives the `req` (request) and `res` (response) objects; you read inputs from `req.params`, `req.query`, and `req.body`, then send a reply with `res.json(...)` or `res.status(201).send(...)`. A well-designed REST API uses nouns for resources (`/users/:id`), the correct HTTP verbs (GET to read, POST to create, PUT/PATCH to update, DELETE to remove), and meaningful status codes (200, 201, 400, 404, 500). To parse JSON request bodies you mount the built-in `express.json()` middleware. Keep routes thin and push business logic into separate service modules.",
        videoUrl: "https://www.youtube.com/watch?v=SccSCuHhOw0",
        duration: 44,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which HTTP method is conventionally used to create a new resource?",
              points: 1,
              options: [
                { optionText: "GET", isCorrect: false },
                { optionText: "POST", isCorrect: true },
                { optionText: "DELETE", isCorrect: false },
                { optionText: "HEAD", isCorrect: false },
              ],
            },
            {
              questionText: "Where does Express put route parameters like the `:id` in `/users/:id`?",
              points: 1,
              options: [
                { optionText: "req.body", isCorrect: false },
                { optionText: "req.query", isCorrect: false },
                { optionText: "req.params", isCorrect: true },
                { optionText: "req.headers", isCorrect: false },
              ],
            },
            {
              questionText: "What is needed to parse a JSON request body in Express?",
              points: 1,
              options: [
                { optionText: "The express.json() middleware", isCorrect: true },
                { optionText: "Nothing; it is automatic", isCorrect: false },
                { optionText: "A call to JSON.stringify on res", isCorrect: false },
                { optionText: "The cors() middleware", isCorrect: false },
              ],
            },
            {
              questionText: "Which status code best indicates a successfully created resource?",
              points: 1,
              options: [
                { optionText: "200 OK", isCorrect: false },
                { optionText: "201 Created", isCorrect: true },
                { optionText: "404 Not Found", isCorrect: false },
                { optionText: "500 Internal Server Error", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nodejs-backend-level-3",
        title: "Middleware & Error Handling",
        description: "Compose request processing and handle failures.",
        content:
          "**Middleware** are functions with the signature `(req, res, next)` that run in order during the request lifecycle; calling `next()` passes control to the next middleware, while sending a response ends the chain. They are ideal for cross-cutting concerns: logging, authentication, body parsing, CORS, and rate limiting. Express recognizes **error-handling middleware** by its four-argument signature `(err, req, res, next)`; you forward errors to it by calling `next(err)`. Register error handlers last so they catch failures from earlier middleware and routes. In async route handlers, wrap logic in try/catch (or a helper) and pass thrown errors to `next` so they are not swallowed.",
        videoUrl: "https://www.youtube.com/watch?v=lY6icfhap2o",
        duration: 36,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the standard signature of an Express middleware function?",
              points: 1,
              options: [
                { optionText: "(req, res)", isCorrect: false },
                { optionText: "(req, res, next)", isCorrect: true },
                { optionText: "(next, req, res)", isCorrect: false },
                { optionText: "(err, next)", isCorrect: false },
              ],
            },
            {
              questionText: "How does Express identify error-handling middleware?",
              points: 1,
              options: [
                { optionText: "By its name being 'errorHandler'", isCorrect: false },
                { optionText: "By its four-argument signature (err, req, res, next)", isCorrect: true },
                { optionText: "By being defined in a separate file", isCorrect: false },
                { optionText: "By returning a Promise", isCorrect: false },
              ],
            },
            {
              questionText: "What does calling `next()` do in middleware?",
              points: 1,
              options: [
                { optionText: "Immediately sends a 200 response", isCorrect: false },
                { optionText: "Passes control to the next middleware in the chain", isCorrect: true },
                { optionText: "Restarts the server", isCorrect: false },
                { optionText: "Aborts the request", isCorrect: false },
              ],
            },
            {
              questionText: "Where should error-handling middleware be registered?",
              points: 1,
              options: [
                { optionText: "Last, after the routes and other middleware", isCorrect: true },
                { optionText: "First, before everything else", isCorrect: false },
                { optionText: "Inside each route handler", isCorrect: false },
                { optionText: "It does not need to be registered", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "nodejs-backend-level-4",
        title: "Authentication with JWT",
        description: "Secure your API with stateless tokens.",
        content:
          "**JSON Web Tokens (JWT)** enable stateless authentication: after verifying a user's credentials, the server signs a token containing claims (like the user id and expiry) and returns it to the client. The client sends the token on subsequent requests, typically in the `Authorization: Bearer <token>` header, and the server verifies the signature to trust the claims without a server-side session store. A JWT has three base64url parts — header, payload, and signature — joined by dots; the signature (often HMAC-SHA256) ensures the payload was not tampered with, but the payload is only encoded, not encrypted, so never put secrets in it. Always set a reasonable expiry, keep the signing secret safe, and validate tokens in middleware before protected routes.",
        videoUrl: "https://www.youtube.com/watch?v=mbsmsi7l3r4",
        duration: 42,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Why is JWT-based auth described as 'stateless'?",
              points: 1,
              options: [
                { optionText: "The server verifies the token's signature without storing a session", isCorrect: true },
                { optionText: "It never expires", isCorrect: false },
                { optionText: "It stores all data in a database table", isCorrect: false },
                { optionText: "It requires sticky sessions on the load balancer", isCorrect: false },
              ],
            },
            {
              questionText: "Where is a bearer JWT conventionally sent?",
              points: 1,
              options: [
                { optionText: "In the URL query string", isCorrect: false },
                { optionText: "In the Authorization header as 'Bearer <token>'", isCorrect: true },
                { optionText: "In a hidden HTML field", isCorrect: false },
                { optionText: "In the response body", isCorrect: false },
              ],
            },
            {
              questionText: "Which is true about a JWT's payload?",
              points: 1,
              options: [
                { optionText: "It is encrypted and unreadable", isCorrect: false },
                { optionText: "It is only base64url-encoded, so do not store secrets there", isCorrect: true },
                { optionText: "It contains the private signing key", isCorrect: false },
                { optionText: "It cannot hold an expiry claim", isCorrect: false },
              ],
            },
            {
              questionText: "What are the three parts of a JWT?",
              points: 1,
              options: [
                { optionText: "Header, payload, and signature", isCorrect: true },
                { optionText: "Username, password, and salt", isCorrect: false },
                { optionText: "Request, response, and cookie", isCorrect: false },
                { optionText: "Key, value, and hash", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Python Fundamentals (local cover image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "python-fundamentals",
    title: "Python Fundamentals",
    description:
      "Start programming with Python, one of the most popular and readable languages. Learn variables, data structures, control flow, functions, and how to write clean, idiomatic code.",
    difficulty: "beginner",
    category: "Backend",
    duration: 15,
    price: 0,
    imageUrl: "/images/courses/python-fundamentals.jpg",
    instructor: "Elena Marquez",
    rating: 4.8,
    totalStudents: 41200,
    tags: ["python", "programming", "beginner", "data-structures"],
    levels: [
      {
        id: "python-fundamentals-level-1",
        title: "Variables, Types & Operators",
        description: "Learn Python's core data types and how to work with them.",
        content:
          "Python is a **dynamically typed** language: you assign values to names without declaring a type, and the type travels with the value, not the variable. Core built-in types include `int`, `float`, `str`, `bool`, and `NoneType` (the singleton `None`). Strings are immutable sequences and support rich operations and f-strings (`f\"Hi {name}\"`) for formatting. Python distinguishes truthy and falsy values — empty containers, `0`, and `None` are falsy. Operators include arithmetic (`+`, `-`, `*`, `/`, `//` for floor division, `%`, `**`), comparison, and logical (`and`, `or`, `not`). Because everything is an object, even integers have methods, and `type(x)` reveals the runtime type.",
        videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        duration: 32,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does it mean that Python is dynamically typed?",
              points: 1,
              options: [
                { optionText: "Types are declared explicitly before use", isCorrect: false },
                { optionText: "A variable's type is determined by the value it currently holds", isCorrect: true },
                { optionText: "Types cannot change at all", isCorrect: false },
                { optionText: "Only numbers are allowed", isCorrect: false },
              ],
            },
            {
              questionText: "What does the `//` operator do?",
              points: 1,
              options: [
                { optionText: "Floor (integer) division", isCorrect: true },
                { optionText: "Exponentiation", isCorrect: false },
                { optionText: "A single-line comment", isCorrect: false },
                { optionText: "Modulo", isCorrect: false },
              ],
            },
            {
              questionText: "Which of these values is falsy in Python?",
              points: 1,
              options: [
                { optionText: "'False' (the string)", isCorrect: false },
                { optionText: "[1, 2, 3]", isCorrect: false },
                { optionText: "An empty list []", isCorrect: true },
                { optionText: "The number 42", isCorrect: false },
              ],
            },
            {
              questionText: "What is true about Python strings?",
              points: 1,
              options: [
                { optionText: "They are mutable and can be changed in place", isCorrect: false },
                { optionText: "They are immutable sequences of characters", isCorrect: true },
                { optionText: "They must be declared with the char keyword", isCorrect: false },
                { optionText: "They cannot be formatted", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "python-fundamentals-level-2",
        title: "Lists, Dicts & Comprehensions",
        description: "Master Python's built-in data structures.",
        content:
          "Python's core containers are **lists** (ordered, mutable: `[1, 2, 3]`), **tuples** (ordered, immutable: `(1, 2)`), **dictionaries** (key→value maps: `{'a': 1}`), and **sets** (unordered, unique elements). Lists support indexing, slicing (`xs[1:3]`), and methods like `append`, and dictionaries provide O(1) average lookups by key. **Comprehensions** offer a concise, readable way to build collections: `[x*x for x in range(5) if x % 2 == 0]` builds a list, and the same pattern works for dicts and sets. Choosing the right structure matters: use a set for membership tests and deduplication, a dict for keyed lookup, and a tuple when the data should not change.",
        videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
        duration: 38,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which built-in type is immutable?",
              points: 1,
              options: [
                { optionText: "list", isCorrect: false },
                { optionText: "dict", isCorrect: false },
                { optionText: "tuple", isCorrect: true },
                { optionText: "set", isCorrect: false },
              ],
            },
            {
              questionText: "What does `[x*x for x in range(5)]` produce?",
              points: 1,
              options: [
                { optionText: "[0, 1, 4, 9, 16]", isCorrect: true },
                { optionText: "[1, 4, 9, 16, 25]", isCorrect: false },
                { optionText: "[0, 1, 2, 3, 4]", isCorrect: false },
                { optionText: "A syntax error", isCorrect: false },
              ],
            },
            {
              questionText: "Which structure is best for fast membership tests and removing duplicates?",
              points: 1,
              options: [
                { optionText: "A list", isCorrect: false },
                { optionText: "A set", isCorrect: true },
                { optionText: "A tuple", isCorrect: false },
                { optionText: "A string", isCorrect: false },
              ],
            },
            {
              questionText: "How do you access a value in a dictionary `d` by key 'a'?",
              points: 1,
              options: [
                { optionText: "d->a", isCorrect: false },
                { optionText: "d['a']", isCorrect: true },
                { optionText: "d.a()", isCorrect: false },
                { optionText: "d(0)", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "python-fundamentals-level-3",
        title: "Control Flow & Loops",
        description: "Branch and iterate the Pythonic way.",
        content:
          "Python uses **indentation** (not braces) to define blocks, so consistent whitespace is part of the syntax. Conditionals use `if`/`elif`/`else`, and Python has no traditional C-style `for` loop — instead, `for x in iterable:` iterates over any sequence or iterator, and `range(n)` produces numbers lazily. The `while` loop repeats until its condition is false. `break` exits a loop early, `continue` skips to the next iteration, and a loop's optional `else` clause runs only if the loop completed without breaking. To iterate with an index use `enumerate(items)`, and to walk two sequences together use `zip(a, b)`. Prefer iterating directly over collections rather than indexing by position.",
        videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
        duration: 34,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "How does Python define code blocks?",
              points: 1,
              options: [
                { optionText: "With curly braces { }", isCorrect: false },
                { optionText: "With indentation", isCorrect: true },
                { optionText: "With begin/end keywords", isCorrect: false },
                { optionText: "With semicolons", isCorrect: false },
              ],
            },
            {
              questionText: "What does `enumerate(items)` provide?",
              points: 1,
              options: [
                { optionText: "Only the items, reversed", isCorrect: false },
                { optionText: "Pairs of (index, item) while iterating", isCorrect: true },
                { optionText: "The length of the list", isCorrect: false },
                { optionText: "A sorted copy of the list", isCorrect: false },
              ],
            },
            {
              questionText: "What does the `continue` statement do inside a loop?",
              points: 1,
              options: [
                { optionText: "Exits the loop entirely", isCorrect: false },
                { optionText: "Skips the rest of the current iteration and moves to the next", isCorrect: true },
                { optionText: "Restarts the program", isCorrect: false },
                { optionText: "Pauses execution for one second", isCorrect: false },
              ],
            },
            {
              questionText: "How do you iterate over two lists in parallel?",
              points: 1,
              options: [
                { optionText: "pair(a, b)", isCorrect: false },
                { optionText: "zip(a, b)", isCorrect: true },
                { optionText: "merge(a, b)", isCorrect: false },
                { optionText: "join(a, b)", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "python-fundamentals-level-4",
        title: "Functions & Modules",
        description: "Organize code into reusable functions and modules.",
        content:
          "Functions are defined with `def name(params):` and return a value with `return` (a function with no explicit return yields `None`). Python supports positional and keyword arguments, default parameter values, and variadic parameters via `*args` (extra positionals as a tuple) and `**kwargs` (extra keywords as a dict). Beware the classic gotcha: a mutable default like `def f(items=[])` is created once and shared across calls, so use `None` as the default and create the list inside. Code is organized into **modules** (`.py` files) and **packages** (folders), imported with `import module` or `from module import name`. The `if __name__ == '__main__':` guard lets a file run as a script while still being importable.",
        videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        duration: 36,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does a Python function return if it has no `return` statement?",
              points: 1,
              options: [
                { optionText: "0", isCorrect: false },
                { optionText: "None", isCorrect: true },
                { optionText: "An empty string", isCorrect: false },
                { optionText: "It raises an error", isCorrect: false },
              ],
            },
            {
              questionText: "What does `**kwargs` collect?",
              points: 1,
              options: [
                { optionText: "Extra positional arguments as a list", isCorrect: false },
                { optionText: "Extra keyword arguments as a dictionary", isCorrect: true },
                { optionText: "The function's return values", isCorrect: false },
                { optionText: "Only the first argument", isCorrect: false },
              ],
            },
            {
              questionText: "Why is a mutable default argument like `def f(x=[])` risky?",
              points: 1,
              options: [
                { optionText: "It is created once and shared across all calls", isCorrect: true },
                { optionText: "It raises a SyntaxError", isCorrect: false },
                { optionText: "Lists cannot be parameters", isCorrect: false },
                { optionText: "It runs the function twice", isCorrect: false },
              ],
            },
            {
              questionText: "What is the purpose of `if __name__ == '__main__':`?",
              points: 1,
              options: [
                { optionText: "It runs the block only when the file is executed as a script, not when imported", isCorrect: true },
                { optionText: "It defines the program's only entry function", isCorrect: false },
                { optionText: "It imports all modules automatically", isCorrect: false },
                { optionText: "It marks the file as private", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Data Science with Pandas (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-science-pandas",
    title: "Data Analysis with Pandas",
    description:
      "Turn raw data into insight using pandas and NumPy. Load, clean, transform, group, and visualize tabular data the way working data analysts do every day.",
    difficulty: "intermediate",
    category: "Data Science",
    duration: 17,
    price: 44.99,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    instructor: "Priya Nair",
    rating: 4.7,
    totalStudents: 16400,
    tags: ["python", "pandas", "data-science", "numpy", "analytics"],
    levels: [
      {
        id: "data-science-pandas-level-1",
        title: "Series & DataFrames",
        description: "Meet pandas' two core data structures.",
        content:
          "pandas is built around two structures: the one-dimensional **Series** (a labeled array) and the two-dimensional **DataFrame** (a table of columns, each a Series, sharing an index). The **index** is a first-class label for rows and powers alignment, fast lookups, and joins. You select rows and columns by label with `.loc[]` and by integer position with `.iloc[]`; selecting a single column (`df['col']`) returns a Series. pandas is built on **NumPy**, so vectorized operations run in fast C loops rather than Python `for` loops. Inspect data quickly with `df.head()`, `df.info()`, and `df.describe()` before you do any analysis.",
        videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
        duration: 35,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is a pandas DataFrame?",
              points: 1,
              options: [
                { optionText: "A two-dimensional labeled table of columns", isCorrect: true },
                { optionText: "A single scalar value", isCorrect: false },
                { optionText: "A plotting library", isCorrect: false },
                { optionText: "A type of database connection", isCorrect: false },
              ],
            },
            {
              questionText: "Which accessor selects data by integer position?",
              points: 1,
              options: [
                { optionText: ".loc[]", isCorrect: false },
                { optionText: ".iloc[]", isCorrect: true },
                { optionText: ".at[]", isCorrect: false },
                { optionText: ".pos[]", isCorrect: false },
              ],
            },
            {
              questionText: "Selecting a single column with `df['col']` returns what?",
              points: 1,
              options: [
                { optionText: "A DataFrame", isCorrect: false },
                { optionText: "A Series", isCorrect: true },
                { optionText: "A NumPy scalar", isCorrect: false },
                { optionText: "A Python list", isCorrect: false },
              ],
            },
            {
              questionText: "Why are pandas vectorized operations fast?",
              points: 1,
              options: [
                { optionText: "They run on NumPy's optimized C implementation instead of Python loops", isCorrect: true },
                { optionText: "They use the GPU automatically", isCorrect: false },
                { optionText: "They cache every result to disk", isCorrect: false },
                { optionText: "They skip computing values", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "data-science-pandas-level-2",
        title: "Cleaning & Handling Missing Data",
        description: "Prepare messy real-world data for analysis.",
        content:
          "Real datasets are messy. pandas represents missing values as `NaN` (and `NaT` for datetimes); detect them with `df.isna()` and summarize with `df.isna().sum()`. You can drop incomplete rows or columns with `dropna()` or fill gaps with `fillna(value)` — using a constant, the column mean/median, or forward/backward fill. Removing duplicate rows is `drop_duplicates()`, and fixing types with `astype()` (for example, converting a string column to numeric or datetime) prevents subtle bugs later. Cleaning also includes trimming/standardizing strings and renaming columns. Decide deliberately whether to impute or drop missing data, because the choice affects your results.",
        videoUrl: "https://www.youtube.com/watch?v=fmgaQHnXrZk",
        duration: 40,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "How does pandas typically represent a missing numeric value?",
              points: 1,
              options: [
                { optionText: "As the string 'null'", isCorrect: false },
                { optionText: "As NaN", isCorrect: true },
                { optionText: "As 0", isCorrect: false },
                { optionText: "As -1", isCorrect: false },
              ],
            },
            {
              questionText: "Which method removes rows containing missing values?",
              points: 1,
              options: [
                { optionText: "fillna()", isCorrect: false },
                { optionText: "dropna()", isCorrect: true },
                { optionText: "isna()", isCorrect: false },
                { optionText: "merge()", isCorrect: false },
              ],
            },
            {
              questionText: "What does `df.isna().sum()` give you?",
              points: 1,
              options: [
                { optionText: "The count of missing values per column", isCorrect: true },
                { optionText: "The total of all numeric values", isCorrect: false },
                { optionText: "The number of duplicate rows", isCorrect: false },
                { optionText: "The mean of each column", isCorrect: false },
              ],
            },
            {
              questionText: "Which method removes repeated rows?",
              points: 1,
              options: [
                { optionText: "drop_duplicates()", isCorrect: true },
                { optionText: "unique()", isCorrect: false },
                { optionText: "distinct()", isCorrect: false },
                { optionText: "dedupe()", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "data-science-pandas-level-3",
        title: "GroupBy & Aggregation",
        description: "Summarize data by category.",
        content:
          "The **split-apply-combine** pattern, exposed via `groupby()`, is the heart of analytical work in pandas. You split rows into groups by one or more keys, apply an aggregation (such as `sum`, `mean`, `count`, or a custom function via `agg`), and combine the results into a new indexed structure. Grouping by multiple columns produces a hierarchical (MultiIndex) result. For spreadsheet-style cross-tabulations, `pivot_table` reshapes data with rows, columns, and an aggregation function. Aggregations ignore `NaN` by default, and you can name multiple outputs in a single `agg` call to compute several statistics at once.",
        videoUrl: "https://www.youtube.com/watch?v=txMdrV1Ut64",
        duration: 43,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What pattern does `groupby()` implement?",
              points: 1,
              options: [
                { optionText: "Map-reduce-shuffle", isCorrect: false },
                { optionText: "Split-apply-combine", isCorrect: true },
                { optionText: "Fetch-decode-execute", isCorrect: false },
                { optionText: "Read-eval-print", isCorrect: false },
              ],
            },
            {
              questionText: "Which method computes several aggregations at once?",
              points: 1,
              options: [
                { optionText: "agg()", isCorrect: true },
                { optionText: "loc()", isCorrect: false },
                { optionText: "head()", isCorrect: false },
                { optionText: "astype()", isCorrect: false },
              ],
            },
            {
              questionText: "Grouping by two columns produces what kind of result index?",
              points: 1,
              options: [
                { optionText: "A single flat index", isCorrect: false },
                { optionText: "A hierarchical MultiIndex", isCorrect: true },
                { optionText: "No index at all", isCorrect: false },
                { optionText: "A datetime index only", isCorrect: false },
              ],
            },
            {
              questionText: "Which function builds spreadsheet-style cross-tabulations?",
              points: 1,
              options: [
                { optionText: "pivot_table", isCorrect: true },
                { optionText: "concat", isCorrect: false },
                { optionText: "explode", isCorrect: false },
                { optionText: "stack_all", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "data-science-pandas-level-4",
        title: "Merging & Joining Data",
        description: "Combine multiple datasets correctly.",
        content:
          "Analysis often requires combining tables. `pd.merge()` performs SQL-style joins on one or more key columns, with the `how` parameter controlling the join type: `inner` (only matching keys), `left`/`right` (keep all rows from one side), and `outer` (keep everything, filling gaps with `NaN`). `concat()` stacks DataFrames vertically (more rows) or horizontally (more columns) along an axis, and `join()` aligns on the index. Choosing the right join is crucial: an inner join can silently drop unmatched rows, while an outer join surfaces them as missing values. Always verify row counts and check for unexpected duplication caused by many-to-many key relationships after merging.",
        videoUrl: "https://www.youtube.com/watch?v=h4hOPGo4UVU",
        duration: 38,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which `how` value keeps only rows whose keys appear in both tables?",
              points: 1,
              options: [
                { optionText: "outer", isCorrect: false },
                { optionText: "left", isCorrect: false },
                { optionText: "inner", isCorrect: true },
                { optionText: "cross", isCorrect: false },
              ],
            },
            {
              questionText: "What does an `outer` join do with unmatched rows?",
              points: 1,
              options: [
                { optionText: "Drops them entirely", isCorrect: false },
                { optionText: "Keeps them and fills missing columns with NaN", isCorrect: true },
                { optionText: "Raises an error", isCorrect: false },
                { optionText: "Duplicates them", isCorrect: false },
              ],
            },
            {
              questionText: "Which function stacks DataFrames along an axis?",
              points: 1,
              options: [
                { optionText: "concat()", isCorrect: true },
                { optionText: "groupby()", isCorrect: false },
                { optionText: "pivot()", isCorrect: false },
                { optionText: "describe()", isCorrect: false },
              ],
            },
            {
              questionText: "What is a common risk of a many-to-many merge?",
              points: 1,
              options: [
                { optionText: "Unexpected row duplication / explosion", isCorrect: true },
                { optionText: "It is impossible and always errors", isCorrect: false },
                { optionText: "It deletes the index", isCorrect: false },
                { optionText: "It converts numbers to strings", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. UI/UX Design Foundations (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "ui-ux-design-foundations",
    title: "UI/UX Design Foundations",
    description:
      "Design interfaces people love to use. Learn user-centered design, visual hierarchy, color and typography, accessibility, and how to prototype and test your ideas.",
    difficulty: "beginner",
    category: "Design",
    duration: 13,
    price: 0,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    instructor: "Liam O'Connor",
    rating: 4.6,
    totalStudents: 22800,
    tags: ["design", "ux", "ui", "accessibility", "prototyping"],
    levels: [
      {
        id: "ui-ux-design-foundations-level-1",
        title: "UX vs UI & The Design Process",
        description: "Distinguish experience design from interface design.",
        content:
          "**UX (User Experience)** design concerns the overall journey — research, information architecture, flows, and whether a product solves a real user problem — while **UI (User Interface)** design concerns the visual and interactive surface: layout, color, type, and components. A typical user-centered process moves through discover, define, ideate, prototype, and test, iterating based on feedback rather than guessing. Personas and user flows keep teams focused on real needs, and low-fidelity wireframes let you explore structure cheaply before investing in polished visuals. Good design is measured by usability and outcomes, not decoration; the best interface often feels invisible because it gets out of the user's way.",
        videoUrl: "https://www.youtube.com/watch?v=v6FffZN6904",
        duration: 28,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which best describes the difference between UX and UI?",
              points: 1,
              options: [
                { optionText: "They are the same thing", isCorrect: false },
                { optionText: "UX is the overall experience/journey; UI is the visual interface surface", isCorrect: true },
                { optionText: "UX is only about color; UI is only about research", isCorrect: false },
                { optionText: "UI happens before any user research", isCorrect: false },
              ],
            },
            {
              questionText: "Why start with low-fidelity wireframes?",
              points: 1,
              options: [
                { optionText: "To explore structure cheaply before committing to polished visuals", isCorrect: true },
                { optionText: "Because high-fidelity design is impossible", isCorrect: false },
                { optionText: "To ship to production immediately", isCorrect: false },
                { optionText: "To avoid ever testing with users", isCorrect: false },
              ],
            },
            {
              questionText: "What is the purpose of a user persona?",
              points: 1,
              options: [
                { optionText: "To represent target users' goals and needs to guide decisions", isCorrect: true },
                { optionText: "To choose the brand's font", isCorrect: false },
                { optionText: "To replace usability testing", isCorrect: false },
                { optionText: "To define the database schema", isCorrect: false },
              ],
            },
            {
              questionText: "How is good design ultimately measured?",
              points: 1,
              options: [
                { optionText: "By how decorative it looks", isCorrect: false },
                { optionText: "By usability and whether it achieves user/business outcomes", isCorrect: true },
                { optionText: "By the number of colors used", isCorrect: false },
                { optionText: "By how many features are added", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "ui-ux-design-foundations-level-2",
        title: "Visual Hierarchy & Layout",
        description: "Guide the eye with structure and contrast.",
        content:
          "**Visual hierarchy** is the arrangement of elements to signal their importance and guide the viewer's eye in the intended order. You create it with size, weight, color, contrast, and especially **whitespace**, which groups related items and gives the design room to breathe. The **Gestalt principles** — proximity, similarity, continuity, and closure — explain how people perceive grouped elements, so items placed close together read as related. A consistent **grid** and an 8-point spacing system keep layouts aligned and rhythmic. Alignment and consistent spacing reduce cognitive load; a clear hierarchy means users can scan a screen and instantly know where to look first.",
        videoUrl: "https://www.youtube.com/watch?v=2bUuVgWopHU",
        duration: 31,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is visual hierarchy?",
              points: 1,
              options: [
                { optionText: "Arranging elements to signal importance and guide the eye", isCorrect: true },
                { optionText: "Using only one font size everywhere", isCorrect: false },
                { optionText: "The order files appear in a folder", isCorrect: false },
                { optionText: "A type of database index", isCorrect: false },
              ],
            },
            {
              questionText: "According to the Gestalt principle of proximity, elements placed close together are perceived as what?",
              points: 1,
              options: [
                { optionText: "Unrelated", isCorrect: false },
                { optionText: "Related / belonging to the same group", isCorrect: true },
                { optionText: "Errors", isCorrect: false },
                { optionText: "Hidden", isCorrect: false },
              ],
            },
            {
              questionText: "What role does whitespace play in layout?",
              points: 1,
              options: [
                { optionText: "It is wasted space that should be removed", isCorrect: false },
                { optionText: "It groups related content and improves readability", isCorrect: true },
                { optionText: "It only matters in print", isCorrect: false },
                { optionText: "It increases load time significantly", isCorrect: false },
              ],
            },
            {
              questionText: "Why use a consistent grid and spacing system?",
              points: 1,
              options: [
                { optionText: "To keep layouts aligned and reduce cognitive load", isCorrect: true },
                { optionText: "To make every element a different size", isCorrect: false },
                { optionText: "To remove the need for color", isCorrect: false },
                { optionText: "Grids are only for tables", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "ui-ux-design-foundations-level-3",
        title: "Color, Typography & Accessibility",
        description: "Make designs readable and inclusive.",
        content:
          "Color and type carry meaning and emotion, but they must remain **accessible**. The WCAG guidelines require sufficient **contrast** — at least a 4.5:1 ratio for normal body text — so content is readable for low-vision users, and you should never rely on color alone to convey information. A clear **type scale** (a small set of sizes with consistent line-height) creates rhythm and readability; body text generally sits around 16px with comfortable line length. Limit your palette to a primary, a few neutrals, and accent colors, and define semantic roles (success, warning, error). Designing for accessibility — keyboard focus states, alt text, adequate target sizes — benefits everyone, not just users with disabilities.",
        videoUrl: "https://www.youtube.com/watch?v=20nKWHkY8wM",
        duration: 33,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the minimum WCAG contrast ratio for normal body text?",
              points: 1,
              options: [
                { optionText: "1:1", isCorrect: false },
                { optionText: "2:1", isCorrect: false },
                { optionText: "4.5:1", isCorrect: true },
                { optionText: "10:1", isCorrect: false },
              ],
            },
            {
              questionText: "Why should you avoid relying on color alone to convey information?",
              points: 1,
              options: [
                { optionText: "Because color-blind and low-vision users may not perceive the difference", isCorrect: true },
                { optionText: "Because color is always too expensive", isCorrect: false },
                { optionText: "Because screens cannot display color", isCorrect: false },
                { optionText: "It is fine to rely on color alone", isCorrect: false },
              ],
            },
            {
              questionText: "What is a type scale?",
              points: 1,
              options: [
                { optionText: "A consistent, limited set of font sizes with harmonious spacing", isCorrect: true },
                { optionText: "A tool that weighs fonts", isCorrect: false },
                { optionText: "The maximum number of fonts allowed", isCorrect: false },
                { optionText: "A color contrast checker", isCorrect: false },
              ],
            },
            {
              questionText: "Which is an accessibility best practice?",
              points: 1,
              options: [
                { optionText: "Providing visible keyboard focus states and alt text", isCorrect: true },
                { optionText: "Removing all focus outlines", isCorrect: false },
                { optionText: "Using tiny tap targets to save space", isCorrect: false },
                { optionText: "Hiding labels from screen readers", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "ui-ux-design-foundations-level-4",
        title: "Prototyping & Usability Testing",
        description: "Validate designs with real users.",
        content:
          "A **prototype** simulates how a design behaves so you can test ideas before engineering builds them. Fidelity ranges from clickable wireframes to high-fidelity interactive flows in tools like Figma, with interactions and transitions wired up. **Usability testing** puts a realistic prototype in front of representative users and asks them to complete tasks while you observe where they hesitate or fail — you watch behavior rather than relying on opinions. Even five participants typically surface the majority of major usability problems, so test early and often. Capture findings, prioritize the most impactful issues, iterate on the design, and re-test; design is a loop, not a one-shot deliverable.",
        videoUrl: "https://www.youtube.com/watch?v=0YL0xoSmyZI",
        duration: 30,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the main purpose of a prototype?",
              points: 1,
              options: [
                { optionText: "To simulate behavior and test ideas before building them", isCorrect: true },
                { optionText: "To replace the final production code", isCorrect: false },
                { optionText: "To write the backend API", isCorrect: false },
                { optionText: "To compile the app", isCorrect: false },
              ],
            },
            {
              questionText: "During usability testing, what do you primarily rely on?",
              points: 1,
              options: [
                { optionText: "Users' stated opinions about aesthetics", isCorrect: false },
                { optionText: "Observed behavior as users attempt real tasks", isCorrect: true },
                { optionText: "The designer's personal preference", isCorrect: false },
                { optionText: "Server logs only", isCorrect: false },
              ],
            },
            {
              questionText: "Roughly how many test participants typically reveal most major usability issues?",
              points: 1,
              options: [
                { optionText: "About 5", isCorrect: true },
                { optionText: "At least 100", isCorrect: false },
                { optionText: "Exactly 1", isCorrect: false },
                { optionText: "1000 or more", isCorrect: false },
              ],
            },
            {
              questionText: "What does it mean that 'design is a loop'?",
              points: 1,
              options: [
                { optionText: "You iterate: test, learn, improve, and re-test", isCorrect: true },
                { optionText: "You design once and never change it", isCorrect: false },
                { optionText: "You must use the loop() function", isCorrect: false },
                { optionText: "Designs must be circular", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Docker & Containers (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "docker-containers",
    title: "Docker & Containers in Practice",
    description:
      "Package, ship, and run applications anywhere with Docker. Master images, containers, Dockerfiles, volumes, networking, and Docker Compose for multi-service apps.",
    difficulty: "intermediate",
    category: "DevOps",
    duration: 14,
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80",
    instructor: "Marcus Hale",
    rating: 4.7,
    totalStudents: 19500,
    tags: ["docker", "containers", "devops", "compose", "deployment"],
    levels: [
      {
        id: "docker-containers-level-1",
        title: "Images vs Containers",
        description: "Understand the core Docker building blocks.",
        content:
          "An **image** is an immutable, read-only template — a stack of layers — that contains your application and everything it needs to run. A **container** is a running (or stopped) instance of an image, with a thin writable layer on top, isolated from the host using Linux namespaces and cgroups. Unlike a virtual machine, a container shares the host kernel, so it is lightweight and starts in milliseconds. Images are identified by name and tag (`nginx:1.27`) and stored in registries like Docker Hub. The key mental model: you build an image once, then run many containers from it, and containers should be treated as disposable and stateless.",
        videoUrl: "https://www.youtube.com/watch?v=pg19Z8LL06w",
        duration: 30,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the relationship between an image and a container?",
              points: 1,
              options: [
                { optionText: "A container is a running instance of an image", isCorrect: true },
                { optionText: "An image is a running instance of a container", isCorrect: false },
                { optionText: "They are unrelated concepts", isCorrect: false },
                { optionText: "An image can only run one container ever", isCorrect: false },
              ],
            },
            {
              questionText: "How do containers differ from virtual machines?",
              points: 1,
              options: [
                { optionText: "Containers share the host kernel and are more lightweight", isCorrect: true },
                { optionText: "Containers each include a full guest operating system", isCorrect: false },
                { optionText: "Containers are always slower to start", isCorrect: false },
                { optionText: "There is no difference", isCorrect: false },
              ],
            },
            {
              questionText: "What does the tag in `nginx:1.27` represent?",
              points: 1,
              options: [
                { optionText: "A specific version/variant of the image", isCorrect: true },
                { optionText: "The container's IP address", isCorrect: false },
                { optionText: "The number of running containers", isCorrect: false },
                { optionText: "The host port", isCorrect: false },
              ],
            },
            {
              questionText: "How are Docker images structured?",
              points: 1,
              options: [
                { optionText: "As a single monolithic binary", isCorrect: false },
                { optionText: "As a stack of read-only layers", isCorrect: true },
                { optionText: "As a live database", isCorrect: false },
                { optionText: "As a plain text file", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "docker-containers-level-2",
        title: "Writing Dockerfiles",
        description: "Define reproducible images as code.",
        content:
          "A **Dockerfile** is a script of instructions that builds an image layer by layer. Common instructions include `FROM` (the base image), `WORKDIR` (set the working directory), `COPY` (add files), `RUN` (execute build commands like installing dependencies), `EXPOSE` (document a port), and `CMD`/`ENTRYPOINT` (the default process). Each instruction creates a cached layer, so ordering matters: copy and install dependencies before copying your changing source code to maximize cache hits and speed up rebuilds. A `.dockerignore` file keeps junk out of the build context. **Multi-stage builds** let you compile in a heavy build image and copy only the artifacts into a small runtime image, dramatically shrinking the final size.",
        videoUrl: "https://www.youtube.com/watch?v=wskg5903K0E",
        duration: 38,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which Dockerfile instruction sets the base image?",
              points: 1,
              options: [
                { optionText: "BASE", isCorrect: false },
                { optionText: "FROM", isCorrect: true },
                { optionText: "IMAGE", isCorrect: false },
                { optionText: "START", isCorrect: false },
              ],
            },
            {
              questionText: "Why copy dependency manifests and install before copying source code?",
              points: 1,
              options: [
                { optionText: "To maximize Docker layer cache reuse on rebuilds", isCorrect: true },
                { optionText: "Because COPY must always come last", isCorrect: false },
                { optionText: "It is required syntax", isCorrect: false },
                { optionText: "To make the image larger on purpose", isCorrect: false },
              ],
            },
            {
              questionText: "What is the main benefit of a multi-stage build?",
              points: 1,
              options: [
                { optionText: "It produces a smaller final image by copying only needed artifacts", isCorrect: true },
                { optionText: "It runs multiple containers automatically", isCorrect: false },
                { optionText: "It encrypts the image", isCorrect: false },
                { optionText: "It removes the need for a base image", isCorrect: false },
              ],
            },
            {
              questionText: "What is the purpose of a `.dockerignore` file?",
              points: 1,
              options: [
                { optionText: "To exclude files from the build context", isCorrect: true },
                { optionText: "To list which containers to start", isCorrect: false },
                { optionText: "To set environment variables", isCorrect: false },
                { optionText: "To define network ports", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "docker-containers-level-3",
        title: "Volumes & Networking",
        description: "Persist data and connect containers.",
        content:
          "Containers are ephemeral, so any data written to their writable layer disappears when they are removed. **Volumes** are Docker-managed storage that persists data independently of a container's lifecycle and is the preferred way to keep databases and uploads; **bind mounts** map a host directory into a container, which is handy for live-reloading source during development. For networking, Docker provides bridge networks so containers on the same user-defined network can reach each other by **container name** as a hostname via Docker's embedded DNS. You publish a container port to the host with `-p hostPort:containerPort`. Keeping state in volumes (not the container) is what makes containers safely replaceable.",
        videoUrl: "https://www.youtube.com/watch?v=GsLs2ALhAfk",
        duration: 35,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What happens to data in a container's writable layer when it is removed?",
              points: 1,
              options: [
                { optionText: "It is lost unless stored in a volume or bind mount", isCorrect: true },
                { optionText: "It is automatically backed up to Docker Hub", isCorrect: false },
                { optionText: "It moves to another container", isCorrect: false },
                { optionText: "It is always preserved", isCorrect: false },
              ],
            },
            {
              questionText: "On a user-defined bridge network, how can containers reach each other?",
              points: 1,
              options: [
                { optionText: "By container name via Docker's embedded DNS", isCorrect: true },
                { optionText: "Only by hard-coded public IP", isCorrect: false },
                { optionText: "They cannot communicate", isCorrect: false },
                { optionText: "Only through the host's localhost", isCorrect: false },
              ],
            },
            {
              questionText: "What does `-p 8080:80` do?",
              points: 1,
              options: [
                { optionText: "Maps host port 8080 to container port 80", isCorrect: true },
                { optionText: "Limits the container to 80 MB of memory", isCorrect: false },
                { optionText: "Runs 80 replicas", isCorrect: false },
                { optionText: "Sets an environment variable", isCorrect: false },
              ],
            },
            {
              questionText: "Which is best for persisting a database's data?",
              points: 1,
              options: [
                { optionText: "A Docker-managed volume", isCorrect: true },
                { optionText: "The container's writable layer", isCorrect: false },
                { optionText: "An environment variable", isCorrect: false },
                { optionText: "The image itself", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "docker-containers-level-4",
        title: "Docker Compose",
        description: "Define and run multi-container applications.",
        content:
          "**Docker Compose** describes a multi-service application in a single declarative YAML file (`compose.yaml`), then brings the whole stack up with `docker compose up`. Each entry under `services` defines a container — its image or build context, ports, environment variables, volumes, and dependencies. Compose automatically creates a shared network so services can talk to each other by service name, which is ideal for an app plus its database and cache. `depends_on` controls start order, while named volumes under the top-level `volumes` key persist data. Compose is perfect for local development and small deployments because it captures the entire environment as version-controlled code that anyone can reproduce with one command.",
        videoUrl: "https://www.youtube.com/watch?v=HG6yIjZapSA",
        duration: 36,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does Docker Compose primarily let you do?",
              points: 1,
              options: [
                { optionText: "Define and run multi-container apps from a single YAML file", isCorrect: true },
                { optionText: "Replace the Linux kernel", isCorrect: false },
                { optionText: "Build images without a Dockerfile", isCorrect: false },
                { optionText: "Edit container source code live", isCorrect: false },
              ],
            },
            {
              questionText: "How do services reach each other in a Compose project?",
              points: 1,
              options: [
                { optionText: "By service name over the shared network Compose creates", isCorrect: true },
                { optionText: "Only via the public internet", isCorrect: false },
                { optionText: "They are fully isolated and cannot connect", isCorrect: false },
                { optionText: "By sharing the same process id", isCorrect: false },
              ],
            },
            {
              questionText: "Which key influences the start order of services?",
              points: 1,
              options: [
                { optionText: "depends_on", isCorrect: true },
                { optionText: "restart_first", isCorrect: false },
                { optionText: "priority", isCorrect: false },
                { optionText: "order", isCorrect: false },
              ],
            },
            {
              questionText: "Which command brings up the whole stack?",
              points: 1,
              options: [
                { optionText: "docker compose up", isCorrect: true },
                { optionText: "docker run all", isCorrect: false },
                { optionText: "docker build stack", isCorrect: false },
                { optionText: "docker start --all-services", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Flutter Mobile Development (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "flutter-mobile-dev",
    title: "Flutter Mobile Development",
    description:
      "Build beautiful, natively compiled mobile apps for iOS and Android from one codebase with Flutter and Dart. Master widgets, layout, state, and navigation.",
    difficulty: "intermediate",
    category: "Mobile",
    duration: 19,
    price: 54.99,
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    instructor: "Hana Suzuki",
    rating: 4.6,
    totalStudents: 14300,
    tags: ["flutter", "dart", "mobile", "ios", "android"],
    levels: [
      {
        id: "flutter-mobile-dev-level-1",
        title: "Dart & Everything Is a Widget",
        description: "Learn Flutter's core philosophy and language.",
        content:
          "Flutter apps are written in **Dart**, a typed, object-oriented language that compiles ahead-of-time to native ARM code for production and uses just-in-time compilation for hot reload during development. In Flutter, **everything is a widget** — layout, styling, and even the app itself are widgets composed into a tree. Widgets are immutable descriptions of part of the UI; when state changes, Flutter rebuilds the affected widgets and efficiently updates the underlying render tree. Flutter draws its own pixels with the Skia/Impeller engine rather than wrapping native components, which is why the same code looks consistent across platforms. Composition over inheritance is the guiding principle: you build complex UIs by nesting small, focused widgets.",
        videoUrl: "https://www.youtube.com/watch?v=1xipg02Wu8s",
        duration: 34,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which language are Flutter apps written in?",
              points: 1,
              options: [
                { optionText: "Kotlin", isCorrect: false },
                { optionText: "Dart", isCorrect: true },
                { optionText: "Swift", isCorrect: false },
                { optionText: "JavaScript", isCorrect: false },
              ],
            },
            {
              questionText: "What is Flutter's core composition philosophy?",
              points: 1,
              options: [
                { optionText: "Everything is a widget composed into a tree", isCorrect: true },
                { optionText: "Everything is a native view", isCorrect: false },
                { optionText: "Everything is an HTML element", isCorrect: false },
                { optionText: "Everything is a database row", isCorrect: false },
              ],
            },
            {
              questionText: "How does Flutter render its UI across platforms?",
              points: 1,
              options: [
                { optionText: "By drawing its own pixels with its rendering engine", isCorrect: true },
                { optionText: "By wrapping each platform's native widgets", isCorrect: false },
                { optionText: "By generating a WebView", isCorrect: false },
                { optionText: "By compiling to Java only", isCorrect: false },
              ],
            },
            {
              questionText: "What enables Flutter's fast 'hot reload' during development?",
              points: 1,
              options: [
                { optionText: "Dart's just-in-time compilation in dev mode", isCorrect: true },
                { optionText: "It reinstalls the app every save", isCorrect: false },
                { optionText: "It only works on the web", isCorrect: false },
                { optionText: "It disables state entirely", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "flutter-mobile-dev-level-2",
        title: "Layout & Building UIs",
        description: "Arrange widgets with rows, columns, and constraints.",
        content:
          "Flutter layout is built from composition: **Row** and **Column** arrange children horizontally and vertically, **Container** adds padding, margin, color, and decoration, and **Stack** overlaps children. You control distribution with `mainAxisAlignment` and `crossAxisAlignment`, and make a child fill remaining space with **Expanded** or **Flexible**. Flutter's layout follows a constraints model: **constraints go down, sizes go up, and the parent sets position** — a parent passes size constraints to children, each child picks its size within them, and the parent positions it. Padding, alignment, and `SizedBox` for spacing are everyday tools. Understanding the constraint flow is the key to predicting and debugging layout behavior.",
        videoUrl: "https://www.youtube.com/watch?v=Ruvb3sk9Lc4",
        duration: 40,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which widget arranges its children vertically?",
              points: 1,
              options: [
                { optionText: "Row", isCorrect: false },
                { optionText: "Column", isCorrect: true },
                { optionText: "Stack", isCorrect: false },
                { optionText: "Padding", isCorrect: false },
              ],
            },
            {
              questionText: "How is Flutter's layout rule best summarized?",
              points: 1,
              options: [
                { optionText: "Constraints go down, sizes go up, parent sets position", isCorrect: true },
                { optionText: "Sizes go down, constraints go up, child sets position", isCorrect: false },
                { optionText: "Everything is absolutely positioned by pixels", isCorrect: false },
                { optionText: "Layout is determined randomly", isCorrect: false },
              ],
            },
            {
              questionText: "Which widget makes a child fill the remaining space in a Row or Column?",
              points: 1,
              options: [
                { optionText: "Expanded", isCorrect: true },
                { optionText: "Center", isCorrect: false },
                { optionText: "Opacity", isCorrect: false },
                { optionText: "Spacer only on the web", isCorrect: false },
              ],
            },
            {
              questionText: "What does `mainAxisAlignment` control in a Column?",
              points: 1,
              options: [
                { optionText: "How children are distributed along the vertical (main) axis", isCorrect: true },
                { optionText: "The text color", isCorrect: false },
                { optionText: "The widget's elevation/shadow", isCorrect: false },
                { optionText: "The animation duration", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "flutter-mobile-dev-level-3",
        title: "State Management",
        description: "Manage and update app state effectively.",
        content:
          "Flutter has two basic widget kinds: a **StatelessWidget** never changes after build, while a **StatefulWidget** holds mutable state in an associated `State` object and triggers a rebuild by calling `setState`. `setState` is fine for local, ephemeral UI state, but as apps grow you need to share and react to state across many widgets. Solutions include **InheritedWidget** (the low-level mechanism that lets descendants read shared data), and popular libraries built on top of it like **Provider**, **Riverpod**, and **Bloc**. The common goal is the same: separate business logic from the widget tree, expose state to the widgets that need it, and rebuild only those widgets when the state changes. Choose the simplest approach that fits your app's complexity.",
        videoUrl: "https://www.youtube.com/watch?v=3tm-R7ymwhc",
        duration: 43,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which method tells Flutter to rebuild a StatefulWidget?",
              points: 1,
              options: [
                { optionText: "render()", isCorrect: false },
                { optionText: "setState()", isCorrect: true },
                { optionText: "rebuild()", isCorrect: false },
                { optionText: "update()", isCorrect: false },
              ],
            },
            {
              questionText: "What is the difference between Stateless and Stateful widgets?",
              points: 1,
              options: [
                { optionText: "Stateless never changes after build; Stateful holds mutable state", isCorrect: true },
                { optionText: "Stateless can change but Stateful cannot", isCorrect: false },
                { optionText: "They are identical", isCorrect: false },
                { optionText: "Stateful widgets cannot be rebuilt", isCorrect: false },
              ],
            },
            {
              questionText: "Which is a popular Flutter state-management library?",
              points: 1,
              options: [
                { optionText: "Riverpod", isCorrect: true },
                { optionText: "Redux-only (no Flutter option)", isCorrect: false },
                { optionText: "jQuery", isCorrect: false },
                { optionText: "Express", isCorrect: false },
              ],
            },
            {
              questionText: "What low-level mechanism lets descendant widgets read shared data?",
              points: 1,
              options: [
                { optionText: "InheritedWidget", isCorrect: true },
                { optionText: "GestureDetector", isCorrect: false },
                { optionText: "MediaQuery only", isCorrect: false },
                { optionText: "Canvas", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "flutter-mobile-dev-level-4",
        title: "Navigation & Routing",
        description: "Move between screens in your app.",
        content:
          "Flutter models navigation as a **stack of routes** managed by the `Navigator`. The imperative API uses `Navigator.push` to add a screen on top and `Navigator.pop` to return, optionally passing data back as the pop result. Named routes (defined in `MaterialApp`'s `routes` map) let you navigate by string with `Navigator.pushNamed`, which centralizes route definitions. For complex apps, deep links, and web URL support, the declarative **Router** API and packages like **go_router** describe the navigation state as a function of the app state. You can pass arguments to a destination and await a returned value, making flows like 'pick an item and come back with the selection' straightforward.",
        videoUrl: "https://www.youtube.com/watch?v=nyvwx7o277U",
        duration: 35,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "How does Flutter model navigation between screens?",
              points: 1,
              options: [
                { optionText: "As a stack of routes managed by the Navigator", isCorrect: true },
                { optionText: "As a single mutable global variable", isCorrect: false },
                { optionText: "As a relational database", isCorrect: false },
                { optionText: "Navigation is not supported", isCorrect: false },
              ],
            },
            {
              questionText: "Which call returns from the current screen to the previous one?",
              points: 1,
              options: [
                { optionText: "Navigator.push", isCorrect: false },
                { optionText: "Navigator.pop", isCorrect: true },
                { optionText: "Navigator.open", isCorrect: false },
                { optionText: "Navigator.close", isCorrect: false },
              ],
            },
            {
              questionText: "What is an advantage of named routes?",
              points: 1,
              options: [
                { optionText: "They centralize route definitions and navigate by string", isCorrect: true },
                { optionText: "They make the app slower", isCorrect: false },
                { optionText: "They remove the Navigator entirely", isCorrect: false },
                { optionText: "They only work on iOS", isCorrect: false },
              ],
            },
            {
              questionText: "Which package is commonly used for declarative routing and deep links?",
              points: 1,
              options: [
                { optionText: "go_router", isCorrect: true },
                { optionText: "http", isCorrect: false },
                { optionText: "intl", isCorrect: false },
                { optionText: "path_provider", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Machine Learning Foundations (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    description:
      "Understand how machines learn from data. Cover supervised and unsupervised learning, model training, evaluation, overfitting, and the workflow behind real ML projects.",
    difficulty: "advanced",
    category: "AI",
    duration: 22,
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    instructor: "Dr. Rafael Gomez",
    rating: 4.8,
    totalStudents: 25600,
    tags: ["machine-learning", "ai", "scikit-learn", "supervised", "models"],
    levels: [
      {
        id: "machine-learning-foundations-level-1",
        title: "What Is Machine Learning?",
        description: "Frame the core ML paradigms and vocabulary.",
        content:
          "**Machine learning** builds models that learn patterns from data instead of being explicitly programmed with rules. The main paradigms are **supervised learning** (learn a mapping from inputs to known labels — classification or regression), **unsupervised learning** (find structure in unlabeled data — clustering, dimensionality reduction), and **reinforcement learning** (an agent learns by trial and reward). In supervised learning, each example has **features** (inputs) and a **target/label**; the model's job is to generalize from training data to unseen data. Classification predicts discrete categories while regression predicts continuous numbers. The fundamental goal is generalization: performing well on new data, not just memorizing the training set.",
        videoUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
        duration: 36,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which task is an example of supervised learning?",
              points: 1,
              options: [
                { optionText: "Predicting a house price from labeled examples", isCorrect: true },
                { optionText: "Grouping customers without any labels", isCorrect: false },
                { optionText: "Compressing an image", isCorrect: false },
                { optionText: "Sorting a list of numbers", isCorrect: false },
              ],
            },
            {
              questionText: "What does classification predict?",
              points: 1,
              options: [
                { optionText: "A continuous numeric value", isCorrect: false },
                { optionText: "A discrete category or class", isCorrect: true },
                { optionText: "A cluster center", isCorrect: false },
                { optionText: "A random number", isCorrect: false },
              ],
            },
            {
              questionText: "Which paradigm works with unlabeled data to find structure?",
              points: 1,
              options: [
                { optionText: "Supervised learning", isCorrect: false },
                { optionText: "Unsupervised learning", isCorrect: true },
                { optionText: "Manual programming", isCorrect: false },
                { optionText: "Compilation", isCorrect: false },
              ],
            },
            {
              questionText: "What is the fundamental goal of a machine learning model?",
              points: 1,
              options: [
                { optionText: "To memorize the training data exactly", isCorrect: false },
                { optionText: "To generalize well to unseen data", isCorrect: true },
                { optionText: "To run as slowly as possible", isCorrect: false },
                { optionText: "To avoid using any data", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "machine-learning-foundations-level-2",
        title: "Training, Testing & Overfitting",
        description: "Split data and avoid memorization.",
        content:
          "To estimate how a model will perform on new data, you split your dataset into **training**, **validation**, and **test** sets — you fit on training data, tune hyperparameters on validation data, and report final performance on the untouched test set. **Overfitting** happens when a model learns noise and quirks of the training data, achieving high training accuracy but poor generalization; **underfitting** is the opposite — too simple to capture the real pattern. This is the **bias-variance tradeoff**. **Cross-validation** (e.g. k-fold) gives a more reliable performance estimate by rotating which fold is held out. Techniques like **regularization**, gathering more data, and simplifying the model combat overfitting. Never tune on or peek at the test set.",
        videoUrl: "https://www.youtube.com/watch?v=EuBBz3bI-aA",
        duration: 41,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is overfitting?",
              points: 1,
              options: [
                { optionText: "A model that learns training noise and fails to generalize", isCorrect: true },
                { optionText: "A model that is too simple to learn the pattern", isCorrect: false },
                { optionText: "A model with no parameters", isCorrect: false },
                { optionText: "A perfectly generalizing model", isCorrect: false },
              ],
            },
            {
              questionText: "Why should you not tune your model on the test set?",
              points: 1,
              options: [
                { optionText: "It leaks information and gives an overly optimistic performance estimate", isCorrect: true },
                { optionText: "The test set is always empty", isCorrect: false },
                { optionText: "Tuning on test data is faster", isCorrect: false },
                { optionText: "Test sets cannot contain labels", isCorrect: false },
              ],
            },
            {
              questionText: "What does k-fold cross-validation provide?",
              points: 1,
              options: [
                { optionText: "A more reliable performance estimate by rotating the held-out fold", isCorrect: true },
                { optionText: "A way to skip training", isCorrect: false },
                { optionText: "Guaranteed zero error", isCorrect: false },
                { optionText: "A smaller dataset", isCorrect: false },
              ],
            },
            {
              questionText: "Underfitting typically means the model is what?",
              points: 1,
              options: [
                { optionText: "Too simple to capture the underlying pattern", isCorrect: true },
                { optionText: "Too complex and memorizing noise", isCorrect: false },
                { optionText: "Perfectly tuned", isCorrect: false },
                { optionText: "Overtrained on the test set", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "machine-learning-foundations-level-3",
        title: "Common Algorithms",
        description: "Survey workhorse supervised models.",
        content:
          "A handful of algorithms cover most tabular problems. **Linear and logistic regression** are simple, interpretable baselines for regression and binary classification. **Decision trees** split data on feature thresholds and are easy to interpret but prone to overfitting; **random forests** and **gradient boosting** (e.g. XGBoost) combine many trees into powerful ensembles that usually win on tabular data. **k-nearest neighbors** classifies by majority vote of the closest training points, and **support vector machines** find a maximum-margin boundary. Many models require **feature scaling** (standardization) to work well, especially distance- and gradient-based ones. Start with a simple baseline, then move to ensembles if you need more accuracy.",
        videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0",
        duration: 44,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Which algorithm is a simple, interpretable baseline for binary classification?",
              points: 1,
              options: [
                { optionText: "Logistic regression", isCorrect: true },
                { optionText: "K-means clustering", isCorrect: false },
                { optionText: "Principal component analysis", isCorrect: false },
                { optionText: "Apriori", isCorrect: false },
              ],
            },
            {
              questionText: "What is a random forest?",
              points: 1,
              options: [
                { optionText: "An ensemble of many decision trees", isCorrect: true },
                { optionText: "A single deep neural network", isCorrect: false },
                { optionText: "A clustering algorithm", isCorrect: false },
                { optionText: "A data-cleaning tool", isCorrect: false },
              ],
            },
            {
              questionText: "How does k-nearest neighbors classify a new point?",
              points: 1,
              options: [
                { optionText: "By the majority class among its closest training points", isCorrect: true },
                { optionText: "By fitting a straight line", isCorrect: false },
                { optionText: "By random assignment", isCorrect: false },
                { optionText: "By splitting on feature thresholds", isCorrect: false },
              ],
            },
            {
              questionText: "Why do many models need feature scaling?",
              points: 1,
              options: [
                { optionText: "Distance- and gradient-based methods are sensitive to feature magnitudes", isCorrect: true },
                { optionText: "Scaling deletes outliers automatically", isCorrect: false },
                { optionText: "It is never necessary", isCorrect: false },
                { optionText: "It converts text to numbers", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "machine-learning-foundations-level-4",
        title: "Evaluation Metrics",
        description: "Measure model quality correctly.",
        content:
          "Choosing the right metric is as important as choosing the model. For classification, **accuracy** can be misleading on imbalanced data, so you also use **precision** (of predicted positives, how many were correct), **recall** (of actual positives, how many were found), and their harmonic mean, the **F1 score**. The **confusion matrix** breaks predictions into true/false positives and negatives, and **ROC-AUC** summarizes performance across thresholds. For regression, common metrics are **MAE**, **MSE/RMSE** (which penalizes large errors more), and **R²**. There is often a precision-recall tradeoff you tune via the decision threshold based on the cost of each error type. Always evaluate against a relevant baseline.",
        videoUrl: "https://www.youtube.com/watch?v=85dtiMz9tSo",
        duration: 39,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Why can accuracy mislead on an imbalanced dataset?",
              points: 1,
              options: [
                { optionText: "A model can score high by always predicting the majority class", isCorrect: true },
                { optionText: "Accuracy cannot be computed at all", isCorrect: false },
                { optionText: "Accuracy only works for regression", isCorrect: false },
                { optionText: "Imbalance makes accuracy always zero", isCorrect: false },
              ],
            },
            {
              questionText: "What does recall measure?",
              points: 1,
              options: [
                { optionText: "Of all actual positives, the fraction the model found", isCorrect: true },
                { optionText: "Of all predicted positives, the fraction that were correct", isCorrect: false },
                { optionText: "The total number of features", isCorrect: false },
                { optionText: "The training time", isCorrect: false },
              ],
            },
            {
              questionText: "The F1 score is the harmonic mean of which two metrics?",
              points: 1,
              options: [
                { optionText: "Precision and recall", isCorrect: true },
                { optionText: "Accuracy and loss", isCorrect: false },
                { optionText: "MAE and RMSE", isCorrect: false },
                { optionText: "Bias and variance", isCorrect: false },
              ],
            },
            {
              questionText: "Which metric is appropriate for a regression problem?",
              points: 1,
              options: [
                { optionText: "RMSE (root mean squared error)", isCorrect: true },
                { optionText: "Precision", isCorrect: false },
                { optionText: "ROC-AUC", isCorrect: false },
                { optionText: "Confusion matrix", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. AWS Cloud Practitioner (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "aws-cloud-essentials",
    title: "AWS Cloud Essentials",
    description:
      "Get fluent in the cloud with Amazon Web Services. Understand core compute, storage, networking, and security services, plus the pricing and shared responsibility models.",
    difficulty: "beginner",
    category: "Cloud",
    duration: 16,
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    instructor: "Grace Adeyemi",
    rating: 4.7,
    totalStudents: 31200,
    tags: ["aws", "cloud", "ec2", "s3", "iam"],
    levels: [
      {
        id: "aws-cloud-essentials-level-1",
        title: "Cloud Concepts & Regions",
        description: "Understand what the cloud is and how AWS is organized.",
        content:
          "**Cloud computing** is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing, replacing large up-front capital expense with flexible operating expense. Key benefits include elasticity (scale up or down with demand), agility, and global reach. AWS organizes its infrastructure into **Regions** (geographic areas like us-east-1), each containing multiple isolated **Availability Zones** (one or more data centers); deploying across AZs gives you high availability. The **shared responsibility model** divides duties: AWS secures the cloud infrastructure itself, while you are responsible for security *in* the cloud — your data, configurations, and access. Choose regions based on latency to users, data residency requirements, cost, and service availability.",
        videoUrl: "https://www.youtube.com/watch?v=a9__D53WsUs",
        duration: 32,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is a defining characteristic of cloud computing?",
              points: 1,
              options: [
                { optionText: "On-demand resources with pay-as-you-go pricing", isCorrect: true },
                { optionText: "Large mandatory up-front hardware purchases", isCorrect: false },
                { optionText: "No internet connectivity", isCorrect: false },
                { optionText: "Fixed capacity that cannot scale", isCorrect: false },
              ],
            },
            {
              questionText: "What is an AWS Availability Zone?",
              points: 1,
              options: [
                { optionText: "One or more isolated data centers within a Region", isCorrect: true },
                { optionText: "A single physical server", isCorrect: false },
                { optionText: "A billing account", isCorrect: false },
                { optionText: "A type of IAM user", isCorrect: false },
              ],
            },
            {
              questionText: "Under the shared responsibility model, what is the customer responsible for?",
              points: 1,
              options: [
                { optionText: "Security in the cloud: their data, configuration, and access", isCorrect: true },
                { optionText: "The physical security of AWS data centers", isCorrect: false },
                { optionText: "Maintaining the global network hardware", isCorrect: false },
                { optionText: "Nothing; AWS handles everything", isCorrect: false },
              ],
            },
            {
              questionText: "Why deploy an application across multiple Availability Zones?",
              points: 1,
              options: [
                { optionText: "To achieve high availability and fault tolerance", isCorrect: true },
                { optionText: "To make it slower on purpose", isCorrect: false },
                { optionText: "Because a single AZ cannot run any app", isCorrect: false },
                { optionText: "It has no effect on availability", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "aws-cloud-essentials-level-2",
        title: "Compute: EC2 & Lambda",
        description: "Run workloads on virtual machines and serverless functions.",
        content:
          "**Amazon EC2** provides resizable virtual machines (instances) where you choose an instance type (CPU/memory profile), an AMI (machine image), and you manage the operating system. Pricing options include On-Demand (flexible), Reserved/Savings Plans (discount for commitment), and Spot Instances (cheap spare capacity that can be reclaimed). **AWS Lambda** is **serverless**: you upload function code and AWS runs it in response to events, automatically scaling and charging only for execution time and memory — there are no servers for you to manage. EC2 suits long-running or stateful workloads and fine-grained control, while Lambda fits event-driven, bursty, or short tasks. **Auto Scaling** plus a load balancer lets EC2 fleets grow and shrink with demand.",
        videoUrl: "https://www.youtube.com/watch?v=8Vc7Vd9Hn1g",
        duration: 40,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does Amazon EC2 primarily provide?",
              points: 1,
              options: [
                { optionText: "Resizable virtual machine instances", isCorrect: true },
                { optionText: "A managed relational database", isCorrect: false },
                { optionText: "Object storage buckets", isCorrect: false },
                { optionText: "A content delivery network", isCorrect: false },
              ],
            },
            {
              questionText: "What makes AWS Lambda 'serverless'?",
              points: 1,
              options: [
                { optionText: "You run code without provisioning or managing servers, paying per execution", isCorrect: true },
                { optionText: "It never uses any servers physically", isCorrect: false },
                { optionText: "It requires you to patch the OS", isCorrect: false },
                { optionText: "It only runs on your laptop", isCorrect: false },
              ],
            },
            {
              questionText: "Which EC2 pricing option offers deep discounts but can be reclaimed by AWS?",
              points: 1,
              options: [
                { optionText: "Spot Instances", isCorrect: true },
                { optionText: "On-Demand", isCorrect: false },
                { optionText: "Reserved Instances", isCorrect: false },
                { optionText: "Dedicated Hosts", isCorrect: false },
              ],
            },
            {
              questionText: "Which workload best fits AWS Lambda?",
              points: 1,
              options: [
                { optionText: "Short, event-driven tasks that scale automatically", isCorrect: true },
                { optionText: "A constantly running stateful server you fully control", isCorrect: false },
                { optionText: "Manually patching an operating system", isCorrect: false },
                { optionText: "Hosting raw physical hardware", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "aws-cloud-essentials-level-3",
        title: "Storage: S3 & EBS",
        description: "Store objects, blocks, and files in the cloud.",
        content:
          "AWS offers different storage types for different needs. **Amazon S3** is highly durable **object storage** for files of any size, organized into buckets with unique keys; it is ideal for backups, static assets, data lakes, and media, and offers tiers like Standard and Glacier for cost vs access-speed tradeoffs. **Amazon EBS** provides **block storage** volumes attached to a single EC2 instance, behaving like a virtual disk for operating systems and databases. **Amazon EFS** is a shared **file system** multiple instances can mount. S3 boasts eleven nines of durability by storing data redundantly across multiple AZs. Match the service to the access pattern: objects via HTTP for S3, low-latency block I/O for EBS, shared POSIX files for EFS.",
        videoUrl: "https://www.youtube.com/watch?v=77lMCiiMilo",
        duration: 36,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Amazon S3 is which kind of storage?",
              points: 1,
              options: [
                { optionText: "Object storage", isCorrect: true },
                { optionText: "Block storage", isCorrect: false },
                { optionText: "A relational database", isCorrect: false },
                { optionText: "An in-memory cache", isCorrect: false },
              ],
            },
            {
              questionText: "What is Amazon EBS best described as?",
              points: 1,
              options: [
                { optionText: "Block storage volumes attached to an EC2 instance", isCorrect: true },
                { optionText: "A global content delivery network", isCorrect: false },
                { optionText: "A managed message queue", isCorrect: false },
                { optionText: "A DNS service", isCorrect: false },
              ],
            },
            {
              questionText: "Which storage tier is designed for cheap, long-term archival?",
              points: 1,
              options: [
                { optionText: "S3 Glacier", isCorrect: true },
                { optionText: "S3 Standard", isCorrect: false },
                { optionText: "EBS gp3", isCorrect: false },
                { optionText: "Instance store", isCorrect: false },
              ],
            },
            {
              questionText: "Which service provides a shared file system multiple instances can mount?",
              points: 1,
              options: [
                { optionText: "Amazon EFS", isCorrect: true },
                { optionText: "Amazon S3", isCorrect: false },
                { optionText: "Amazon SQS", isCorrect: false },
                { optionText: "Amazon Route 53", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "aws-cloud-essentials-level-4",
        title: "Security & IAM",
        description: "Control who can do what in your account.",
        content:
          "**IAM (Identity and Access Management)** controls authentication and authorization in AWS. You define **users**, **groups**, and **roles**, and attach **policies** — JSON documents that allow or deny specific actions on specific resources. The guiding principle is **least privilege**: grant only the permissions an identity actually needs. **Roles** let you grant temporary credentials to AWS services or federated users without sharing long-lived keys; for example, an EC2 instance assumes a role to access S3 securely. Protect the root account, enable **multi-factor authentication (MFA)**, and prefer roles over hard-coded access keys. IAM is global, evaluated on every request, and policy evaluation denies by default unless an explicit allow grants access (and an explicit deny always wins).",
        videoUrl: "https://www.youtube.com/watch?v=Ul6FW4UANGc",
        duration: 38,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What does the principle of least privilege recommend?",
              points: 1,
              options: [
                { optionText: "Grant only the permissions an identity actually needs", isCorrect: true },
                { optionText: "Give every user full administrator access", isCorrect: false },
                { optionText: "Disable all permissions for everyone", isCorrect: false },
                { optionText: "Share the root account credentials widely", isCorrect: false },
              ],
            },
            {
              questionText: "What is an IAM role typically used for?",
              points: 1,
              options: [
                { optionText: "Granting temporary credentials to services or users without long-lived keys", isCorrect: true },
                { optionText: "Storing files permanently", isCorrect: false },
                { optionText: "Running virtual machines", isCorrect: false },
                { optionText: "Hosting a website", isCorrect: false },
              ],
            },
            {
              questionText: "In IAM policy evaluation, what is the default if nothing grants access?",
              points: 1,
              options: [
                { optionText: "Implicit deny", isCorrect: true },
                { optionText: "Implicit allow", isCorrect: false },
                { optionText: "Full admin access", isCorrect: false },
                { optionText: "A prompt to the user", isCorrect: false },
              ],
            },
            {
              questionText: "Which extra protection should be enabled on important accounts?",
              points: 1,
              options: [
                { optionText: "Multi-factor authentication (MFA)", isCorrect: true },
                { optionText: "Sharing passwords by email", isCorrect: false },
                { optionText: "Disabling all logging", isCorrect: false },
                { optionText: "Using one key for every service", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Prompt Engineering & LLM Apps (new — Unsplash)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "prompt-engineering-llm-apps",
    title: "Prompt Engineering & LLM Apps",
    description:
      "Build reliable applications on large language models. Learn prompting techniques, context windows, tokens, retrieval-augmented generation, and how to evaluate LLM outputs.",
    difficulty: "intermediate",
    category: "AI",
    duration: 12,
    price: 0,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    instructor: "Noah Feldman",
    rating: 4.7,
    totalStudents: 28900,
    tags: ["llm", "ai", "prompt-engineering", "rag", "genai"],
    levels: [
      {
        id: "prompt-engineering-llm-apps-level-1",
        title: "How LLMs Work: Tokens & Context",
        description: "Understand the model's basic mechanics.",
        content:
          "Large language models are neural networks (typically Transformers) trained to predict the **next token** given preceding text. A **token** is a chunk of text — often a word piece of a few characters — and models process text as sequences of tokens, which is why pricing and limits are measured in tokens, not characters. The **context window** is the maximum number of tokens the model can attend to at once (prompt plus generated output); anything beyond it must be truncated or summarized. Because generation is probabilistic, the **temperature** parameter controls randomness: low temperature is more deterministic and focused, higher is more creative and varied. Models have a knowledge cutoff and can **hallucinate** plausible-but-wrong content, so verify factual outputs.",
        videoUrl: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
        duration: 30,
        order: 1,
        requiredScore: 70,
        quiz: {
          title: "Level 1 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What is the fundamental task an LLM is trained to do?",
              points: 1,
              options: [
                { optionText: "Predict the next token given the preceding text", isCorrect: true },
                { optionText: "Sort words alphabetically", isCorrect: false },
                { optionText: "Compress files", isCorrect: false },
                { optionText: "Execute SQL queries", isCorrect: false },
              ],
            },
            {
              questionText: "What is the context window?",
              points: 1,
              options: [
                { optionText: "The maximum number of tokens the model can consider at once", isCorrect: true },
                { optionText: "The model's training duration", isCorrect: false },
                { optionText: "The screen size of the chat UI", isCorrect: false },
                { optionText: "The number of users online", isCorrect: false },
              ],
            },
            {
              questionText: "What effect does a lower temperature have on generation?",
              points: 1,
              options: [
                { optionText: "More deterministic, focused output", isCorrect: true },
                { optionText: "More random, creative output", isCorrect: false },
                { optionText: "It increases the context window", isCorrect: false },
                { optionText: "It deletes the prompt", isCorrect: false },
              ],
            },
            {
              questionText: "What does it mean when a model 'hallucinates'?",
              points: 1,
              options: [
                { optionText: "It produces plausible-sounding but incorrect or fabricated content", isCorrect: true },
                { optionText: "It refuses to answer anything", isCorrect: false },
                { optionText: "It runs out of memory", isCorrect: false },
                { optionText: "It only outputs images", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "prompt-engineering-llm-apps-level-2",
        title: "Prompting Techniques",
        description: "Get reliable results with better prompts.",
        content:
          "Effective prompting is largely about giving the model clear instructions, relevant context, and examples. **Zero-shot** prompting asks directly; **few-shot** prompting includes a handful of input/output examples to demonstrate the desired format and behavior. For multi-step reasoning, **chain-of-thought** prompting (asking the model to reason step by step) often improves accuracy on complex problems. Assigning a **role or system prompt** ('You are an expert editor...') sets tone and constraints, and specifying the exact **output format** (JSON, bullet list) makes responses easier to parse downstream. Be explicit, break complex tasks into steps, and iterate on wording — small changes can meaningfully shift quality.",
        videoUrl: "https://www.youtube.com/watch?v=dOxUroR57xs",
        duration: 33,
        order: 2,
        requiredScore: 70,
        quiz: {
          title: "Level 2 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What characterizes few-shot prompting?",
              points: 1,
              options: [
                { optionText: "Including a few example input/output pairs in the prompt", isCorrect: true },
                { optionText: "Using as few words as physically possible", isCorrect: false },
                { optionText: "Training the model from scratch", isCorrect: false },
                { optionText: "Disabling the system prompt", isCorrect: false },
              ],
            },
            {
              questionText: "What is chain-of-thought prompting useful for?",
              points: 1,
              options: [
                { optionText: "Improving accuracy on multi-step reasoning by reasoning step by step", isCorrect: true },
                { optionText: "Making outputs shorter", isCorrect: false },
                { optionText: "Reducing the token count to zero", isCorrect: false },
                { optionText: "Encrypting the prompt", isCorrect: false },
              ],
            },
            {
              questionText: "Why specify an exact output format like JSON?",
              points: 1,
              options: [
                { optionText: "To make responses reliable and easy to parse programmatically", isCorrect: true },
                { optionText: "To slow the model down", isCorrect: false },
                { optionText: "Because models cannot output text otherwise", isCorrect: false },
                { optionText: "It has no benefit", isCorrect: false },
              ],
            },
            {
              questionText: "What does a system/role prompt typically do?",
              points: 1,
              options: [
                { optionText: "Sets the assistant's persona, tone, and constraints", isCorrect: true },
                { optionText: "Increases the model's parameter count", isCorrect: false },
                { optionText: "Permanently retrains the model", isCorrect: false },
                { optionText: "Deletes prior messages from disk", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "prompt-engineering-llm-apps-level-3",
        title: "Retrieval-Augmented Generation (RAG)",
        description: "Ground LLM answers in your own data.",
        content:
          "**Retrieval-Augmented Generation (RAG)** grounds an LLM in external, up-to-date, or proprietary knowledge instead of relying only on what it learned during training. The pipeline: split documents into **chunks**, convert each chunk into a vector **embedding** that captures meaning, and store them in a **vector database**. At query time you embed the user's question, retrieve the most semantically similar chunks (often via cosine similarity), and inject them into the prompt as context so the model answers from real sources. RAG reduces hallucination, lets you cite sources, and avoids costly fine-tuning when you just need current facts. Retrieval quality (good chunking and embeddings) usually matters more than prompt wording for accuracy.",
        videoUrl: "https://www.youtube.com/watch?v=T-D1OfcDW1M",
        duration: 38,
        order: 3,
        requiredScore: 70,
        quiz: {
          title: "Level 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "What problem does RAG primarily address?",
              points: 1,
              options: [
                { optionText: "Grounding answers in external/proprietary data and reducing hallucination", isCorrect: true },
                { optionText: "Making the model train faster", isCorrect: false },
                { optionText: "Increasing the temperature automatically", isCorrect: false },
                { optionText: "Compressing the model weights", isCorrect: false },
              ],
            },
            {
              questionText: "What is an embedding in the RAG pipeline?",
              points: 1,
              options: [
                { optionText: "A vector representation that captures the meaning of text", isCorrect: true },
                { optionText: "A compressed image", isCorrect: false },
                { optionText: "An HTML template", isCorrect: false },
                { optionText: "A database password", isCorrect: false },
              ],
            },
            {
              questionText: "Where are embeddings typically stored for fast similarity search?",
              points: 1,
              options: [
                { optionText: "A vector database", isCorrect: true },
                { optionText: "A CSS file", isCorrect: false },
                { optionText: "The browser cache", isCorrect: false },
                { optionText: "A DNS record", isCorrect: false },
              ],
            },
            {
              questionText: "At query time, what does the system retrieve to add as context?",
              points: 1,
              options: [
                { optionText: "The chunks most semantically similar to the question", isCorrect: true },
                { optionText: "A random sample of all documents", isCorrect: false },
                { optionText: "The longest documents available", isCorrect: false },
                { optionText: "Nothing; the prompt is sent alone", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        id: "prompt-engineering-llm-apps-level-4",
        title: "Evaluating & Shipping LLM Apps",
        description: "Test, guardrail, and deploy responsibly.",
        content:
          "Unlike deterministic code, LLM outputs vary, so evaluation needs deliberate strategy. Build a representative **evaluation set** of inputs with expected qualities and score outputs using a mix of automated checks (exact match, regex, schema validation), model-graded **LLM-as-judge** scoring, and human review. Guard against failure modes with input validation, output schema enforcement, and **guardrails** against prompt injection — where untrusted text tries to override your instructions, so never blindly trust retrieved or user content as commands. In production, monitor latency, cost (tokens), and quality over time, and use caching to control spend. Treat prompts as versioned artifacts and re-run your eval set whenever you change a prompt or model.",
        videoUrl: "https://www.youtube.com/watch?v=tFHeUSJAYbE",
        duration: 35,
        order: 4,
        requiredScore: 70,
        quiz: {
          title: "Level 4 Quiz",
          timeLimit: 10,
          passingScore: 70,
          questions: [
            {
              questionText: "Why is evaluating LLM apps harder than testing deterministic code?",
              points: 1,
              options: [
                { optionText: "Outputs vary and quality is often subjective, so they need eval sets and graded scoring", isCorrect: true },
                { optionText: "LLMs cannot produce any output", isCorrect: false },
                { optionText: "There is no way to measure them at all", isCorrect: false },
                { optionText: "Tests always pass automatically", isCorrect: false },
              ],
            },
            {
              questionText: "What is prompt injection?",
              points: 1,
              options: [
                { optionText: "Untrusted text attempting to override the app's intended instructions", isCorrect: true },
                { optionText: "A way to speed up token generation", isCorrect: false },
                { optionText: "A database migration technique", isCorrect: false },
                { optionText: "A method to increase the context window", isCorrect: false },
              ],
            },
            {
              questionText: "What is 'LLM-as-judge' evaluation?",
              points: 1,
              options: [
                { optionText: "Using a model to score or grade another model's outputs", isCorrect: true },
                { optionText: "Letting the model set legal policy", isCorrect: false },
                { optionText: "Manually reading every output only", isCorrect: false },
                { optionText: "Disabling all evaluation", isCorrect: false },
              ],
            },
            {
              questionText: "Which is a good production practice for LLM apps?",
              points: 1,
              options: [
                { optionText: "Version prompts and re-run an eval set after changes; monitor cost and quality", isCorrect: true },
                { optionText: "Trust all retrieved content as direct commands", isCorrect: false },
                { optionText: "Never measure token usage", isCorrect: false },
                { optionText: "Ship prompt changes without any testing", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  },
];
