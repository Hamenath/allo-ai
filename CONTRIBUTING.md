# Contributing to ALLO

Thank you for your interest in contributing to ALLO.

---

## Getting Started

### Prerequisites

- **Node.js** v20.x
- **npm** v10+
- A Firebase project (Auth + Firestore) for local development
- A Google Gemini API key

### Setup

```bash
# Clone the repository
git clone https://github.com/Hamenath/allo-ai.git
cd allo-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your credentials in .env.local
```

See [`.env.example`](.env.example) and [`docs/environment.md`](docs/environment.md) for a full description of all required variables.

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — always deployable |
| `develop` | Optional staging integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `security/*` | Security fixes — keep private until patched |
| `docs/*` | Documentation only |

**Never push directly to `main`.** Open a pull request.

---

## Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code standards below.

3. Run the verification suite before committing:
   ```bash
   npx tsc --noEmit   # TypeScript
   npm run lint        # ESLint
   npm test            # All tests
   npm run build       # Production build check
   ```

4. Open a pull request against `main`.

---

## Commit Message Convention

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>
```

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `security` | Security fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Tooling, config, dependencies |
| `perf` | Performance improvement |
| `refactor` | Code restructure without behavior change |

**Examples:**
```
feat: add job description generator tool
fix: prevent duplicate webhook processing
security: restrict updateUserProfile to safe fields
docs: update deployment guide for Vercel
test: add billing webhook coverage
```

---

## Code Standards

### TypeScript
- All new code must be TypeScript — no `any` without justification
- New API inputs must use Zod schemas for validation

### New AI Tools
All new AI tools must follow the standard schema in [`src/lib/ai/registry.ts`](src/lib/ai/registry.ts):
- Define `id`, `name`, `description`, `category`, `inputSchema`, `outputSchema`, `systemPrompt`
- Register in the `toolsRegistry` object
- The `/api/ai/generate` endpoint handles generation automatically

### Security
- Every new API route that accesses user data **must** verify the Firebase ID token server-side
- Every admin route **must** call `verifyAdminUser(req)`
- Never trust client-supplied `userId`, `plan`, `role`, or `subscriptionStatus`
- New user-facing input must be validated with Zod before processing

### Testing
- Add unit tests for new utility functions in `tests/unit/`
- Add tests for security-critical flows in `tests/security/`

---

## Pull Request Checklist

Before requesting review, confirm:

- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] Lint passes: `npm run lint`
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No secrets, `.env`, or credential files in the diff
- [ ] New env vars added to `.env.example`
- [ ] New API routes are authenticated where required
- [ ] Documentation updated if behavior changed

---

## Reporting Security Issues

**Do not open a public GitHub Issue for security vulnerabilities.**

See [`SECURITY.md`](SECURITY.md) for our responsible disclosure policy.

---

## Questions?

Open a [GitHub Discussion](https://github.com/Hamenath/allo-ai/discussions) or email support@alloai.in.
