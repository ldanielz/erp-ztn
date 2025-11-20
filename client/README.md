# ERP ZTN — Client (Login Page)
# ERP ZTN — Client (Login Page)

This folder contains a minimal Vite + React + TypeScript example with a Material UI login page and an axios instance.

Quick start

1. Install dependencies

```bash
cd client
npm install
```

2. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` by default.

Notes
- The login form posts to `/api/auth/login` using the axios instance in `src/api/axios.ts`.
- To set a different API base URL, create a `.env` file in `client/` with:

```
VITE_API_BASE_URL=https://your.api.url

```

Project structure (important files)

- `src/components/` : reusable UI components (`Header`, `Footer`, `Navbar`).
- `src/pages/` : route-specific pages (`Home`, `About`, `Contact`, `Login`).
- `src/assets/` : static assets (`css`, `js`, `images`).
- `src/api/axios.ts` : axios base instance.

Customization
- You can expand the form with remember-me, password visibility toggle, client-side validation, and redirect after successful login.

Follow-up suggestions
- Add an `AuthProvider` and store JWT tokens in `localStorage` or secure cookies.
- Add client-side validation with `react-hook-form` + `yup`.
