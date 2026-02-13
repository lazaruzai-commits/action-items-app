# Action Items App (Vercel)

Scans your **Slack** DMs, group DMs, and channels, uses **Claude** to find action items for you, and stores them as tasks in this app. Tasks are categorized, prioritized (everything from **Dhara Tanwani** is top priority), and get due dates when mentioned.

## Setup

### 1. Clone and install

```bash
cd action-items-app
npm install
```

### 2. Slack app

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps) (Create New App → From scratch).
2. Under **OAuth & Permissions** add these **Bot Token Scopes**:
   - `channels:read`, `channels:history`
   - `groups:read`, `groups:history`
   - `im:read`, `im:history`
   - `mpim:read`, `mpim:history`
   - `users:read`
3. Install the app to your workspace and copy the **Bot User OAuth Token** (`xoxb-...`).

### 3. Anthropic

Get an API key from [console.anthropic.com](https://console.anthropic.com) and add it as `ANTHROPIC_API_KEY`.

### 4. Vercel Postgres

1. In the [Vercel Dashboard](https://vercel.com), create a new project (or use an existing one) and connect this repo.
2. Go to **Storage** → **Create Database** → **Postgres**.
3. Run the schema once: **Postgres** → **Query** and run the contents of `schema.sql`.
4. Environment variables for Postgres are added automatically when you link the store.

### 5. Environment variables

In the project root (and in Vercel → Settings → Environment Variables), set:

- `SLACK_BOT_TOKEN` — Slack bot token from step 2.
- `ANTHROPIC_API_KEY` — Anthropic API key from step 3.

No need to set Postgres vars manually if you used Vercel Postgres; they’re injected.

### 6. Run locally

```bash
cp .env.example .env
# Edit .env with your SLACK_BOT_TOKEN and ANTHROPIC_API_KEY
# If using Vercel Postgres locally, pull env with: vercel env pull
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Sync from Slack** to run the first scan.

### 7. Deploy on Vercel

Push to GitHub and import the repo in Vercel (or use the Vercel CLI). Add `SLACK_BOT_TOKEN` and `ANTHROPIC_API_KEY` in the project’s Environment Variables. The Postgres store will be used automatically if you added it in step 4.

## Behavior

- **Sync** fetches all conversations (channels, DMs, group DMs) the bot is in, then recent messages (last 4 weeks) from each.
- Each conversation batch is sent to **Claude**, which returns structured action items (title, category, priority, due date).
- **Priority**: If the message author is **Dhara Tanwani**, the task is always set to **high**. Otherwise Claude infers from wording (e.g. “urgent”, “when you can”).
- **Categories**: Work, Personal, Follow-up, Meeting, Review, Other.
- **Due dates**: Parsed from phrases like “by Friday”, “EOD”, “next week” and stored as ISO dates when possible.
- Tasks are stored in **Vercel Postgres** and shown on the main page; you can delete them from the UI.

## Tech

- **Next.js 14** (App Router), **TypeScript**, **Tailwind**
- **Slack API**: `conversations.list`, `conversations.history`, `users.info`
- **Anthropic** Claude for extraction
- **Vercel Postgres** for task storage
