# Deploy the App Online (No Mac Admin / No Local Install)

You can host the app entirely from the web: put the code on GitHub, then connect it to Vercel. No terminal or admin access on your Mac needed.

---

## Part 1: Put the code on GitHub

1. **Create a GitHub account** (if you don’t have one)  
   Go to [github.com](https://github.com) → Sign up.

2. **Create a new repository**  
   - Click **+** (top right) → **New repository**.  
   - Repository name: `action-items-app` (or any name).  
   - Choose **Public**.  
   - Do **not** check “Add a README” (you’re uploading existing code).  
   - Click **Create repository**.

3. **Upload the project files**  
   On the new repo page you’ll see “uploading an existing file”.  
   - Click **“uploading an existing file”**.  
   - Open the `action-items-app` folder on your Mac and drag **all** of these in (or use “choose your files” and select them):

   **Tip:** You can drag the entire `action-items-app` folder into the upload area; GitHub preserves the structure (under 20 files).

   **Root folder (`action-items-app`):**
   - `package.json`
   - `tsconfig.json`
   - `next.config.js`
   - `next-env.d.ts`
   - `postcss.config.mjs`
   - `tailwind.config.ts`
   - `.env.example`
   - `.gitignore`
   - `README.md`
   - `SETUP-GUIDE.md`
   - `schema.sql`

   **Then create the nested structure.** After the first upload, GitHub shows your files. You need these paths:

   - `src/app/globals.css`
   - `src/app/layout.tsx`
   - `src/app/page.tsx`
   - `src/app/api/tasks/route.ts`
   - `src/app/api/tasks/[id]/route.ts`
   - `src/app/api/sync/route.ts`
   - `src/lib/db.ts`
   - `src/lib/claude.ts`
   - `src/lib/slack.ts`

   **How to get the right folders on GitHub:**  
   - First upload the root files above.  
   - Then click **“Add file”** → **“Create new file”**.  
   - Name the file `src/app/globals.css` (typing `src/app/` creates the folders). Paste in the contents of `globals.css`, then Commit.  
   - Repeat “Create new file” for each of the other paths, pasting content from your Mac’s `action-items-app` folder.  
   - Or: create folder `src`, then inside it `app` and `lib`, then inside `app` create `api`, then `api/tasks`, then `api/tasks/[id]`, and upload the matching files into those folders.

   **Commit:** After adding/uploading everything, click **Commit changes** (or **Commit new file** for each batch).

4. **Double-check**  
   Your repo should have at the top level: `package.json`, `src/`, `schema.sql`, etc. Opening `src` should show `app` and `lib` with the files above.

---

## Part 2: Deploy on Vercel

1. **Sign in to Vercel**  
   Go to [vercel.com](https://vercel.com) → **Sign up** or **Log in**. Choose **Continue with GitHub** and authorize Vercel.

2. **Import the project**  
   - Click **Add New…** → **Project**.  
   - Under “Import Git Repository”, find **action-items-app** (or whatever you named the repo) and click **Import**.

3. **Configure the project**  
   - **Framework Preset:** Vercel should detect **Next.js** (leave as is).  
   - **Root Directory:** leave blank.  
   - **Build and Output Settings:** leave defaults.  
   - Do **not** click Deploy yet.

4. **Add environment variables**  
   In the same screen, open **Environment Variables**.  
   Add two variables (use the **Production** environment):

   | Name                 | Value                    |
   |----------------------|--------------------------|
   | `SLACK_BOT_TOKEN`    | Your Slack bot token (`xoxb-...`) |
   | `ANTHROPIC_API_KEY`  | Your Anthropic API key (`sk-ant-...`) |

   Click **Add** for each. Then click **Deploy**.

5. **Wait for the build**  
   Vercel will clone the repo, run `npm install` and `npm run build` on their servers. This usually takes 1–2 minutes. If the build fails, check the build log on the deployment page for errors.

6. **Add the database**  
   - In the Vercel project, open the **Storage** tab.  
   - Click **Create Database** → **Postgres** → follow the steps and create the database.  
   - When asked, **connect it to this project** (your action-items-app).  
   - Open the new database → **Query** tab.  
   - Copy the entire contents of **schema.sql** from your repo (on GitHub: open `schema.sql` → Raw → copy all).  
   - Paste into the Query box and run the query. You should see a success message.

7. **Redeploy once (so the app sees the database)**  
   - Go to the **Deployments** tab.  
   - Open the **⋯** menu on the latest deployment → **Redeploy** → **Redeploy** again.  
   - Wait for it to finish.

8. **Open your app**  
   On the project page, click **Visit** (or the URL under **Domains**). You should see the Action Items UI. Click **Sync from Slack** to run the first sync.

---

## Summary

| Step | Where        | Action |
|------|--------------|--------|
| 1    | GitHub       | Create repo, upload all project files (root + `src/` structure). |
| 2    | Vercel       | Sign in with GitHub, Add New → Project → Import your repo. |
| 3    | Vercel       | Add env vars: `SLACK_BOT_TOKEN`, `ANTHROPIC_API_KEY`. |
| 4    | Vercel       | Deploy. |
| 5    | Vercel       | Storage → Create Postgres → Connect to project → Run `schema.sql` in Query. |
| 6    | Vercel       | Redeploy once, then open the app URL and use **Sync from Slack**. |

Your app will be live at a URL like `https://action-items-app-xxxx.vercel.app`. You can use it from any device; nothing needs to be installed on your Mac.
