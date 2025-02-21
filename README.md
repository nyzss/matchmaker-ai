# Matchmaker AI

A modern web application built with a powerful tech stack for AI candidate matching purposes.

## Tech Stack

### Frontend (Web App)

- **Next.js** - React framework with server-side rendering
- **React** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn UI** - Component library

### Backend

- **Hono** - Lightweight, ultrafast web framework
- **Inngest** - Background job processing

### Database

- **Neon DB** - Serverless Postgres database
- **Drizzle ORM** - TypeScript ORM

### Development Tools

- **Turborepo** - Monorepo build system

## Project Structure

```
matchmaker-ai/
├── apps/
│   ├── web/     # Next.js frontend application
│   └── worker/  # Background worker service
├── packages/
│   ├── auth/    # Authentication package
│   ├── database/# Database schema and utilities
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
```

## Prerequisites

- pnpm >= 9.0.0
- Neon Database account
- Inngest account
- OpenAI API key
- Slack workspace with bot token

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd matchmaker-ai
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

The following environment files need to be created or copied from the example files:

```plaintext
matchmaker-ai/
├── apps/
│   └── worker/
│       ├── .dev.vars        # Worker environment variables
│       └── .dev.vars.example
└── packages/
    └── database/
        ├── .env            # Database environment variables
        └── .env.example
```

Copy the example files:

```bash
# For database
cp ./packages/database/.env.example ./packages/database/.env

# For worker
cp ./apps/worker/.dev.vars.example ./apps/worker/.dev.vars

# Edit the .env files with your credentials
```

### Required Environment Variables

#### Database (`packages/database/.env`)

```bash
DATABASE_URL="postgresql_uri"  # Your Neon database connection string
```

#### Worker (`apps/worker/.dev.vars`)

```bash
DATABASE_URL="postgresql_uri"           # Your Neon database connection string
BETTER_AUTH_SECRET="your_secret"        # Secret key for authentication that is randomly generated
BETTER_AUTH_URL="http://localhost:8787" # Authentication service URL, backend
OPENAI_API_KEY="your_openai_key"       # OpenAI API key for AI features
SLACK_BOT_TOKEN="your_slack_token"      # Slack Bot User OAuth Token for Slack notifications, create Slack App for this and go on Install App, copy the 'xoxb-' token)
SLACK_CHANNEL_ID="your_slack_channel_id" # Slack channel ID for notifications
```

4. Set up the database:

```bash
# Run database migrations
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

5. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across all projects
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

### Database Commands

- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate new migrations
- `pnpm db:push` - Push schema changes to the database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed the database with initial data

## Development

The project uses Turborepo for managing the monorepo. Each package and app can be developed independently:

- `/apps/web` - Main Next.js web application
- `/apps/worker` - Background worker service
- `/packages/*` - Shared packages used across applications

## License

[MIT](LICENSE)
