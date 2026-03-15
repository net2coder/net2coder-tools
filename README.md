# Net2Coder Tools

> Browser extensions & developer utilities — tools.net2coder.in

Full-stack web platform to showcase, distribute, and manage browser extensions and developer tools built under the Net2Coder brand.

## Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18 + TypeScript + Vite      |
| Styling   | Tailwind CSS + Custom CSS tokens  |
| Database  | Supabase (PostgreSQL)             |
| Auth      | Supabase Auth (email/password)    |
| Storage   | Supabase Storage                  |
| Hosting   | Vercel                            |

---

## Project Structure

```
src/
├── app/
├── pages/
│   ├── home/          Home.tsx
│   ├── tools/         ToolsList.tsx, ToolDetail.tsx
│   ├── install/       InstallGuide.tsx
│   ├── legal/         LegalPage.tsx
│   └── admin/         Dashboard, Tools, Versions, Media, Legal, Settings
├── components/
│   ├── layout/        Navbar, Footer, PublicLayout
│   ├── admin/         AdminSidebar, AdminLayout, PrivateRoute
│   ├── tool/          ToolCard, FeatureList, StepTimeline, VersionSelector
│   └── ui/            ImageUpload, Modal, ConfirmDialog, Field, Skeleton
├── services/          All Supabase calls — no DB logic in UI
├── store/             AuthProvider + useAuth hook
├── types/             TypeScript interfaces
├── utils/             slugify, formatDate, cn, etc.
└── styles/            globals.css (design tokens)
```

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/net2coder/net2coder-tools
cd net2coder-tools
npm install
```

### 2. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon key** from Settings → API

### 3. Run the Database Schema

Go to **SQL Editor** in your Supabase dashboard and run the schema file:

```
supabase/schema.sql
```

This creates:
- All 7 tables with indexes
- RLS policies (public read, admin write)
- 4 PostgreSQL functions (`increment_download`, `set_latest_version`, `get_tool_stats`, `get_download_trend`)
- 2 storage buckets (`tool-assets` public, `tool-zips` private)
- All storage policies

**Before running** — replace `YOUR_ADMIN_EMAIL` with your real email on line:
```sql
UPDATE public.site_settings SET value = 'YOUR_ADMIN_EMAIL' WHERE key = 'admin_email';
```

### 4. Seed Example Data (optional)

To populate two example tools for development:
```
supabase/seed.sql
```

### 5. Create Admin Auth User

In Supabase → **Authentication** → **Settings**:
- Turn OFF **Enable sign ups** (admin-only system)

In Supabase → **Authentication** → **Users** → **Add user**:
- Email: your admin email (must match `VITE_ADMIN_EMAIL` in `.env`)
- Password: strong password

### 6. Deploy the Edge Function

The secure download system uses a Supabase Edge Function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the download function
supabase functions deploy download-tool
```

The function lives at: `supabase/functions/download-tool/index.ts`

It handles:
- Verifying the version exists and the tool is published
- Atomically incrementing the download counter
- Generating a 60-second signed URL for the private `tool-zips` bucket

### 7. Storage Buckets

The schema SQL creates both buckets automatically. If you need to verify:
- Go to **Storage** in your Supabase dashboard
- You should see `tool-assets` (public) and `tool-zips` (private)

### 8. Environment Variables

```bash
cp .env.example .env
```

Fill in:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=your@email.com
```

### 9. Run Locally

```bash
npm run dev
# → http://localhost:5173
# → Admin: http://localhost:5173/admin/login
```

---

## Admin Panel

URL: `/admin/login`

Features:
- **Dashboard** — stats: total tools, downloads, published/draft counts
- **Tools Manager** — create, edit, publish/unpublish, delete tools
- **Tool Editor Tabs:**
  - Basic Info (title, slug, description, category, status, links)
  - Features (dynamic bullet list with drag-and-drop order)
  - Steps (visual how-it-works with image uploads per step)
  - SEO & Media (logo, banner, meta title, meta description)
- **Versions Manager** — per tool: upload ZIP, set latest, view download count
- **Media Manager** — browse/delete uploaded logos, banners, step images
- **Legal Pages** — create/edit Terms, Privacy, License pages (site-wide or per-tool)
- **Settings** — site title, tagline, footer text

---

## Public Site

| Route               | Page                          |
|---------------------|-------------------------------|
| `/`                 | Homepage with hero + tools grid |
| `/tools`            | All tools listing with search |
| `/tools/:slug`      | Tool detail page              |
| `/install-guide`    | Chrome extension install guide |
| `/legal/terms`      | Terms of Use                  |
| `/legal/privacy`    | Privacy Policy                |
| `/legal/license`    | MIT License                   |
| `/legal/:slug`      | Any custom legal page         |

Public users do **not** need to sign in.

---

## Download System

1. User clicks Download on a tool detail page
2. Frontend calls `versionsService.getSignedUrl()` — generates a 60-second Supabase signed URL for the private `tool-zips` bucket
3. Frontend calls `downloadsService.logAndDownload()`:
   - Inserts a record into the `downloads` table
   - Calls the `increment_download` Postgres function (atomic counter increment)
   - Triggers browser download via temporary anchor element
4. Download count updates immediately in the DB

---

## Legal Pages (Edge Add-on Partner Hub)

For Microsoft Edge Partner Hub verification, each extension needs:
- A Privacy Policy URL
- A Terms of Use URL

Create legal pages in Admin → Legal Pages:
- Set slug e.g. `neotab-privacy`, `neotab-terms`
- Link to the tool
- Published at `/legal/neotab-privacy` etc.

These URLs are stable, publicly accessible, and crawlable.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables in Vercel dashboard (same as `.env`)
4. Deploy — `vercel.json` handles SPA routing automatically

---

## Design System

Fonts:
- **Syne** — display/headings (weights 700–800)
- **DM Sans** — body text
- **Fira Code** — monospace labels, badges, code

Color tokens (CSS variables in `globals.css`):
- `--bg0` through `--bg4` — background layers
- `--teal` / `--teal-dim` — brand accent
- `--text0` through `--text3` — text hierarchy
- `--border` / `--border-sub` / `--border-em` — border levels

---

## Security

- RLS enabled on all tables
- Public users: read-only access to published content
- Admin: authenticated + email-matched write access
- Private ZIP bucket: signed URLs expire in 60 seconds
- Admin routes: `X-Robots-Tag: noindex` via `vercel.json`
- No public signup — admin user created manually in Supabase

---

## License

MIT © 2026 Net2Coder (Alok Kumar)
