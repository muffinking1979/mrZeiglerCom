# Mr. Zeigler — Teacher Profile

Vite + React single-page app (React Router). The homepage (`/`) is one scrolling page; the
calendar lives on its own route at `/calendar` so it can be viewed and shared on its own.

```bash
npm install
npm run dev
```

## Editing
- **All text content:** `src/data.js` (about, courses, blog posts, past classes, projects, testimonials, office hours).
- **Images:** placeholders live in `public/images/`. Drop in your own file (jpg/png/webp) and update the path in `src/data.js`.
- **Styles / colors:** `src/index.css` — theme colors are CSS variables at the top (dark + light).

## Calendar admin

Each class calendar has a **🔒 Admin** link (above the calendar) where you can enter a password
to add events, delete events, and select multiple days to shift forward or backward by any
number of days ("Shift Many"). Events save automatically a moment after each change.

- **`npm run dev`** uses a built-in mock of `api.php` (password `dev`, data stored in `dev-data/`),
  so no PHP server is needed locally.
- **Deploying** (e.g. to Hostinger or any PHP host):
  1. `npm run build`, then upload everything inside `dist/` (including the hidden `.htaccess`,
     which also handles the `/calendar` route — see below).
  2. In that same folder, copy `config.sample.php` to `config.php` and set your own admin password.
  3. Reload the site, click **Admin**, and log in.
- Calendar data lives in `data/<class-slug>.json` on the server. Re-uploading `dist/` never
  overwrites `data/` or `config.php`.
