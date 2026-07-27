# create-next-with-query-starter

A CLI that scaffolds a production-ready Next.js project pre-wired with the stack you actually use — no boilerplate hunting, no manual wiring.

## Usage

```bash
npx create-next-with-query-starter my-app
```

Or pick a package manager upfront:

```bash
npx create-next-with-query-starter my-app --pm pnpm
npx create-next-with-query-starter my-app --pm npm
npx create-next-with-query-starter my-app --pm yarn
npx create-next-with-query-starter my-app --pm bun
```

## What you get

### Stack

| Category | Package |
|---|---|
| Framework | Next.js (App Router, TypeScript, Tailwind v4) |
| Data fetching | TanStack Query v5 + Axios |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui (new-york style) |
| Toasts | Sonner |
| Token storage | idb-keyval (IndexedDB) |

### Generated project structure

```
my-app/
├── app/
│   ├── layout.tsx          # QueryProvider + Toaster wired in
│   ├── globals.css         # Tailwind v4 + shadcn CSS variables
│   └── login/
│       └── page.tsx        # Working login form (RHF + Zod)
├── api/
│   └── auth.api.ts         # Login, logout, reset password hooks
├── services/
│   └── auth.service.ts     # Service layer with toast feedback
├── schema/
│   └── auth.validation.ts  # Zod schemas for auth forms
├── hooks/
│   ├── useDebounce.ts
│   └── useCreateQueryString.ts
├── helpers/
│   └── index.ts            # Token storage, formatters, extractErrorMsg
├── query/
│   ├── api.ts              # Axios instance (auth headers + token refresh)
│   ├── queryClient.ts
│   └── QueryProvider.tsx
├── constants/
│   ├── apiRoutes.ts
│   └── config.ts
├── components/
│   ├── ui/
│   │   └── button.tsx      # shadcn Button + loading spinner prop
│   └── molecules/
│       └── TextInput.tsx   # Label + password toggle input wrapper
├── types/
│   └── global.d.ts
└── .env.local              # NEXT_PUBLIC_BASE_URL placeholder
```

### Axios instance features

- Attaches `Authorization: Bearer <token>` to every non-public request
- Silent token refresh on 401 using the stored refresh token
- Auto-redirects to `/login` on failed refresh

## After scaffolding

```bash
cd my-app
# Set your API base URL
echo "NEXT_PUBLIC_BASE_URL=https://api.yourapp.com/v1/" > .env.local
# Start dev server
pnpm dev
```

## License

MIT
