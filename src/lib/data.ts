import { type Module } from "./types";

export const modules: Module[] = [
  {
    id: "auth-core",
    name: "Authentication Core",
    category: "Core Systems",
    tags: ["security", "user", "login"],
    description:
      "Handles user authentication, session management, and security protocols.",
    content: `
      <h3 class="font-headline text-lg font-semibold mb-2">Overview</h3>
      <p class="mb-4">The Authentication Core module is the central hub for all user-related security operations. It provides robust and secure methods for user sign-up, login, and session handling. It's built on top of industry-standard protocols to ensure data integrity and user privacy.</p>
      <img src="https://placehold.co/600x300.png" alt="Auth system diagram" data-ai-hint="system diagram" class="rounded-lg mb-4" />
      <h4 class="font-headline text-md font-semibold mb-2">Key Features</h4>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Secure password hashing using bcrypt.</li>
        <li>JWT-based session management.</li>
        <li>Role-based access control (RBAC).</li>
        <li>OAuth 2.0 integration for third-party logins.</li>
      </ul>
      <p>Implementation is straightforward, requiring only a few lines of code to protect your application's endpoints.</p>
    `,
    versions: [
      {
        version: "1.2.0",
        date: "2024-07-15",
        changes: [
          {
            type: "new",
            description: "Added support for two-factor authentication (2FA).",
          },
          {
            type: "improvement",
            description: "Optimized session validation logic.",
          },
        ],
      },
      {
        version: "1.1.3",
        date: "2024-06-20",
        changes: [
          {
            type: "fix",
            description: "Patched a minor vulnerability in password reset flow.",
          },
        ],
      },
    ],
  },
  {
    id: "ui-kit",
    name: "UI Component Kit",
    category: "User Interface",
    tags: ["frontend", "design", "react"],
    description: "A comprehensive library of reusable React components.",
    content: `
      <h3 class="font-headline text-lg font-semibold mb-2">Component Library</h3>
      <p class="mb-4">The UI Component Kit is a collection of pre-built, customizable, and accessible React components designed to accelerate front-end development. All components are styled with Tailwind CSS and are fully responsive.</p>
      <h4 class="font-headline text-md font-semibold mb-2">Available Components</h4>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Buttons and Inputs</li>
        <li>Modals and Dialogs</li>
        <li>Data Tables with sorting and filtering</li>
        <li>Responsive Navigation Bars</li>
      </ul>
      <p>Each component comes with detailed documentation and examples to ensure easy integration into your project.</p>
    `,
    image: "https://placehold.co/400x300.png",
    versions: [
      {
        version: "2.0.0",
        date: "2024-07-01",
        changes: [
          {
            type: "new",
            description: "Released new Data Grid component with virtualization.",
          },
          {
            type: "improvement",
            description: "Improved accessibility for all form components.",
          },
        ],
      },
      {
        version: "1.5.2",
        date: "2024-05-10",
        changes: [
          { type: "fix", description: "Fixed a z-index issue with the Modal." },
        ],
      },
    ],
  },
  {
    id: "db-connector",
    name: "Database Connector",
    category: "Data Management",
    tags: ["database", "sql", "orm"],
    description: "A powerful ORM for seamless database interactions.",
    content: `
      <h3 class="font-headline text-lg font-semibold mb-2">ORM Abstraction</h3>
      <p class="mb-4">The Database Connector provides a type-safe and intuitive API for interacting with your SQL database. It abstracts away the complexities of raw SQL queries, allowing you to work with JavaScript objects and methods.</p>
      <img src="https://placehold.co/600x350.png" alt="Database schema" data-ai-hint="database schema" class="rounded-lg mb-4" />
      <h4 class="font-headline text-md font-semibold mb-2">Supported Databases</h4>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>PostgreSQL</li>
        <li>MySQL</li>
        <li>SQLite</li>
      </ul>
      <p>Features include automatic migrations, connection pooling, and transaction support to ensure your data layer is both robust and performant.</p>
    `,
    versions: [
      {
        version: "3.1.0",
        date: "2024-07-20",
        changes: [
          {
            type: "new",
            description: "Added experimental support for NoSQL databases.",
          },
          {
            type: "improvement",
            description: "Query performance improved by 15% through caching.",
          },
          { type: "fix", description: "Correctly handle timezone conversions." },
        ],
      },
    ],
  },
];
