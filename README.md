# AI Portfolio Builder

**Helping SHPE members tell their stories, showcase their accomplishments, and build their professional presence.**

AI Portfolio Builder is a web application developed in preparation for the **SHPE National Convention**, designed to help students create personalized professional portfolios without having to build a website from scratch.

The project was presented and used hands-on by **20+ students**, who created their own portfolios using the application.

## About the Project

Students have experiences, skills, projects, and accomplishments worth sharing, but building a personal website can be a barrier to showcasing them professionally.

AI Portfolio Builder aims to make that process more accessible by providing an interactive editor where students can customize their portfolio's appearance and content, preview the result, and share a public portfolio page.

The goal is simple: **help SHPE members tell their stories and make their work visible.**

## Features

- **Customizable templates:** Choose from four portfolio design options.
- **Personalized styling:** Customize colors, themes, fonts, and section headings.
- **Interactive portfolio editor:** Organize and edit profile information and portfolio content.
- **Flexible content sections:** Showcase information through text, skills, cards, timelines, links, and contact details.
- **Live preview:** See portfolio changes while editing.
- **Responsive preview options:** Preview the portfolio in desktop and mobile layouts.
- **Optional images:** Personalize portfolios with supported images.
- **Public portfolio pages:** Share a personalized portfolio URL.
- **HTML export:** Export portfolio content as HTML.
- **Authentication:** Email-and-password authentication and password-reset functionality are part of the application's authentication implementation.

*Note: The project name includes “AI,” but this README does not claim generative AI or machine-learning functionality that has not been verified.*

## Built With

| Technology | Purpose |
|---|---|
| Next.js | Application framework and routing |
| React | Interactive user interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and layout |
| Prisma | Database access and ORM |
| PostgreSQL | Relational database |
| Neon | Hosted PostgreSQL |
| Better Auth | Authentication |
| Nodemailer | Password-reset email delivery |
| Vercel | Deployment |
| Git and GitHub | Version control |

## Real-World Impact

AI Portfolio Builder was created with a student-centered goal: making it easier for members of the SHPE community to communicate their professional journeys.

- **20+ students** used the application hands-on.
- Students created their own professional portfolios.
- The project provided an opportunity to develop and present a working web application for real users.

This experience reinforced the importance of building software around actual user needs and making technology useful beyond the development environment.

## Screenshots and Demo

Add screenshots or a short demo recording here to showcase:

1. The portfolio editor.
2. Template and styling customization.
3. The live preview.
4. An example of a completed public portfolio.

**Live Demo:** [View the deployed application](https://portfolio-builder-sable-sigma.vercel.app/)

**Source Code:** [GitHub Repository](https://github.com/RosarioGLara/portfolio-builder)

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- A PostgreSQL database, such as [Neon](https://neon.tech/)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/RosarioGLara/portfolio-builder.git
cd portfolio-builder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root for local development configuration. If your existing setup uses `.env.local`, keep the configuration consistent with the application's environment-loading setup.

The application has used the following environment variables:

```env
DATABASE_URL="your_postgresql_connection_string"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your_generated_auth_secret"
SMTP_USER="your_email_address"
SMTP_APP_PASSWORD="your_email_app_password"
```

Replace the example values with your own configuration. Never commit credentials, database URLs, API keys, or authentication secrets to GitHub.

The email variables are used by the password-reset email implementation. Configure SMTP with valid credentials if you want to test email delivery.

### 4. Generate the Prisma client

```bash
npx prisma generate --config prisma7.config.ts
```

Make sure your database schema and migrations are configured before running database-dependent functionality. Apply the project's existing migrations using the migration workflow documented in the repository.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create a production build

```bash
npm run build
```

The production build script generates the Prisma client before building the Next.js application.

## Project Structure

The following paths are known parts of the project; other files may exist in the repository.

```text
portfolio-builder/
├── app/
│   ├── p/
│   │   └── [slug]/
│   │       └── page.tsx
│   └── generated/
│       └── prisma/
├── lib/
│   ├── auth.ts
│   └── auth-client.ts
├── prisma/
│   └── schema.prisma
├── prisma7.config.ts
├── package.json
└── README.md
```

- `app/` contains the Next.js application routes and pages.
- `app/p/[slug]/page.tsx` implements the dynamic public portfolio route.
- `lib/auth.ts` contains server-side authentication configuration.
- `lib/auth-client.ts` configures the browser authentication client.
- `prisma/schema.prisma` defines the Prisma data model.
- `prisma7.config.ts` configures Prisma for the project.
- `app/generated/prisma/` is the configured generated Prisma client output.

The tree above is an overview, not an exhaustive listing of every application file.

## Design Goals

The project prioritizes:

- **Accessibility:** Make portfolio creation easier for students.
- **Customization:** Let users express their individual experiences and professional identities.
- **Usability:** Provide an interactive editor and preview workflow.
- **Practical engineering:** Build a working application using a modern full-stack web stack.
- **Real-world relevance:** Develop software that students can actually use.

## Future Improvements

Potential areas for continued development include:

- Strengthening automated tests for critical user workflows.
- Improving authentication and production configuration.
- Refining portfolio publishing and data-persistence workflows.
- Improving accessibility and responsive behavior.
- Incorporating user feedback into future iterations.

These are potential improvements, not claims that the work has already been completed.

## Acknowledgments

Developed in preparation for the **SHPE National Convention**, with the goal of helping SHPE members tell their stories and showcase their achievements.

Thank you to the students who used the application to create their own portfolios and helped bring the project's purpose to life.

---

**Built by [Rosario G. Lara](https://github.com/RosarioGLara)**

*Building technology that helps students share their stories.*
