# Matchmaker AI

## Environment

```bash

cp ./packages/database/.env.example ./packages/database/.env
# Edit the .env file with your own Neon DB URI

```

## Development

First, run the database migrations and seed the database.

```bash
# Run the database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Open the database studio
pnpm db:studio
```

Then, run the app.

```bash
pnpm dev
```
