# Mini CRM (MERN)

React + React Router + Axios + MUI · Node/Express · MongoDB/Mongoose · JWT + bcrypt

## Run locally
```
cd server && cp .env.example .env && npm i && npm run seed && npm run dev
cd client && cp .env.example .env && npm i && npm run dev
```
Seed logins (password `password123`): `admin@crm.com` (admin), `john@crm.com` (user).

## Authorization logic
- **Authentication:** `POST /api/auth/login` verifies the bcrypt hash and returns a JWT access token (1 day). The `auth` middleware verifies it on every other route and loads the user; missing/invalid token → 401. The client attaches it as `Authorization: Bearer <token>` and logs out on 401.
- **Roles:** `admin` and `user`.
- **Leads:** any authenticated user can create and list leads. Edit, status change and delete are allowed only for an `admin`, the lead's creator, or the lead's assignee; otherwise 403.
- **Soft delete:** delete sets `isDeleted`/`deletedAt`. A Mongoose pre-hook on `find`, `findOne`, `findOneAndUpdate` and `countDocuments` filters out deleted leads everywhere (list, detail, company detail); the dashboard aggregation matches `isDeleted:false` explicitly.
- **Tasks:** any user can create a task for a lead and assign it to any user. **Only the assigned user** can update its status (`PATCH /api/tasks/:id/status` → 403 for everyone else, admins included). Non-admins only see tasks they created or are assigned to.
- **Companies:** any authenticated user can create and view.
- **Dashboard:** counts come from `/api/dashboard`, which uses MongoDB aggregation pipelines.

## Deploy
- **Database:** MongoDB Atlas → copy the connection string.
- **Backend (Render/Railway):** root `server`, build `npm i`, start `npm start`; env `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL=<netlify url>`. Run `npm run seed` once.
- **Frontend (Netlify):** base dir `client`, build `npm run build`, publish `dist`; env `VITE_API_URL=<backend url>/api`. `netlify.toml` handles SPA routing.
