
# Todo API

## Commands
- Install: `npm install`
- Run dev server: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`

## Code Style
- TypeScript, strict mode
- Use async/await, never callbacks
- Every new endpoint needs a test in `tests/`

## Rules
- Never edit files in `src/generated/`
- Never commit `.env`
- Keep PRs small: one feature per change


## Security Rules
- Never read, open, inspect, or display `.env` files.
- Never expose environment variables containing secrets.
- Never commit `.env` files.

## Formatting Rules
- Format all newly created and modified supported files using Prettier.
- Run Prettier after creating or editing files.
- Follow the project's existing Prettier configuration.
