# Step-by-Step Setup Guide (After Slack App Approval)

Follow these steps in order.

---

## Step 1: Get your Slack Bot Token

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and open your approved app.
2. In the left sidebar, click **OAuth & Permissions**.
3. Under **OAuth Tokens for Your Workspace**, find **Bot User OAuth Token**.
4. Click **Copy** (it starts with `xoxb-`).
5. Save it somewhere safe temporarily (you’ll add it to env in Step 5).

---

## Step 2: Add the bot to channels and DMs (optional but important)

The bot can only read conversations it’s in.

- **Channels**: In Slack, open each channel you want scanned → click the channel name → **Integrations** → **Add apps** → select your app.
- **DMs**: For DMs, the bot must have been invited or have access via your workspace; ensure the app is installed to your workspace (Step 1 usually covers this).

---

## Step 3: Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Sign in or create an account.
3. Open **API Keys** (or **Settings** → **API Keys**).
4. Click **Create Key**, name it (e.g. “Action Items App”), then **Create**.
5. Copy the key (starts with `sk-ant-`) and store it safely. You won’t see it again.

---

## Step 4: Set up the database (Vercel Postgres)

### If you’re deploying on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. **Add New** → **Project** and import your `action-items-app` repo (or create a project and push this code).
3. Before deploying, go to the project → **Storage** tab.
4. Click **Create Database** → choose **Postgres** → **Continue** → create (name it e.g. `action-items-db`).
5. Connect it to your project when prompted (same Vercel project as the app).
6. Open the new Postgres store → **Query** tab.
7. Copy the entire contents of the `schema.sql` file in this repo and paste into the query box.
8. Run the query (e.g. **Run** or **Execute**). You should see success.
9. Environment variables for Postgres are added automatically; no need to copy them by hand.

### If you’re only running locally for now

You still need a Postgres database. Options:

- **Vercel Postgres (recommended):** Create a Vercel project, add Postgres as above, then pull env to your machine (Step 5).
- **Another Postgres:** Create a database elsewhere (e.g. Neon, Supabase). You’ll need one connection URL and set `POSTGRES_URL` (and optionally `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` if your provider gives them). Run the SQL from `schema.sql` in that database.

---

## Step 5: Set environment variables

### Local development

1. In the project root (`action-items-app`), copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in an editor and set:
   - `SLACK_BOT_TOKEN=` then paste your Slack bot token from Step 1 (no quotes).
   - `ANTHROPIC_API_KEY=` then paste your Anthropic key from Step 3 (no quotes).
3. If you use **Vercel Postgres**, pull the DB env vars into `.env`:
   ```bash
   npx vercel link
   npx vercel env pull .env.local
   ```
   Then copy any `POSTGRES_*` lines from `.env.local` into `.env` if needed, or use `.env.local` as your local env source.

### Vercel (production)

1. In the Vercel project, go to **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `SLACK_BOT_TOKEN`  
     **Value:** your Slack bot token  
     **Environments:** Production (and Preview if you want).
   - **Name:** `ANTHROPIC_API_KEY`  
     **Value:** your Anthropic API key  
     **Environments:** Production (and Preview if you want).
3. Save. Postgres vars are already set if you linked the database in Step 4.

---

## Step 6: Install dependencies and run locally

In the project folder:

```bash
cd action-items-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the Action Items page.

---

## Step 7: Run your first sync

1. On the app page, click **Sync from Slack**.
2. Wait. The first sync can take 1–5 minutes (all conversations + Claude). The button will show “Syncing…”.
3. When it finishes, the page will list the extracted action items (categories, priorities, due dates; Dhara Tanwani → high priority).
4. If you see an error, check the browser dev tools (F12 → Console/Network) and the terminal where `npm run dev` is running for the exact message.

---

## Step 8: Deploy to Vercel (if you haven’t already)

1. Push your code to GitHub (if it isn’t already).
2. In Vercel: **Add New** → **Project** → import the repo.
3. Ensure **Environment Variables** are set (Step 5) and **Postgres** is connected (Step 4).
4. Click **Deploy**.
5. When the deployment is done, open the provided URL and click **Sync from Slack** again to run sync in production.

---

## Quick checklist

- [ ] Slack Bot Token copied from OAuth & Permissions
- [ ] Bot added to channels you want scanned (and app installed to workspace)
- [ ] Anthropic API key created and copied
- [ ] Postgres database created and `schema.sql` run
- [ ] `.env` (local) or Vercel env vars set: `SLACK_BOT_TOKEN`, `ANTHROPIC_API_KEY`
- [ ] `npm install` and `npm run dev` run successfully
- [ ] First “Sync from Slack” completed and tasks appear

If something fails, note the exact error (browser or terminal) and check that tokens and env vars have no extra spaces or quotes.
