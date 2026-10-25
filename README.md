# We Communicate

We Communicate is a React 19/Vite frontend with a Node/Express/MongoDB backend.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `JWT_SECRET`,
   `PORT`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the
   backend URL (for example `http://localhost:5000/api`).
3. Run `npm install`, then `npm run start:backend` and
   `npm run build:frontend` (or the frontend dev script in `frontend/package.json`).

The backend needs its own host in deployment. The Vercel configuration covers only
the frontend; configure the Vercel project environment variable `VITE_API_URL` to
the deployed backend API, including the `/api` suffix (for example,
`https://your-backend-host.example/api`). Do not leave it unset in production,
because the frontend fallback points to localhost.

Uploaded files are stored on local disk in `backend/uploads`. Local disk is not
durable on most hosted platforms, so use persistent storage before deploying
uploads to production.

## Roles

Residents register with a community, block, and house/flat number and remain
pending until a block manager or community head approves them. Admin credentials
are seeded once from the backend environment variables when no admin exists.
