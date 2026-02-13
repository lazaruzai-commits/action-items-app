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
   - **Root Directory:** If you dragged the **whole** `action-items-app` folder to GitHub, your repo has that name as a subfolder. Click **Edit** next to Root Directory and set it to **`action-items-app`** (the folder that contains `package.json`). If `package.json` is at the very top of your repo, leave Root Directory **blank**.  
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

---

## Troubleshooting: 404 Not Found

If you see **404 NOT_FOUND** or **Not Found** when you open your Vercel URL:

### 1. Set the Root Directory (most common fix)

Your GitHub repo might have the app **inside a subfolder** (e.g. you dragged the whole `action-items-app` folder). Vercel then builds from the repo root, where there is no `package.json`, so nothing gets built and you get 404.

**Fix:**

1. In Vercel, open your **action-items-app** project.
2. Go to **Settings** → **General**.
3. Find **Root Directory**.
4. Click **Edit**.
5. Enter the folder name that contains `package.json` and `src/`. For example: **`action-items-app`** (no leading slash).
6. Click **Save**.
7. Go to **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**. Wait for the new deployment to finish.
8. Open your app URL again (or click **Visit** on the new deployment).

After this, the homepage should load instead of 404.

### 2. Check the deployment build

- Go to **Deployments** → click the latest deployment.
- See if the **Build** step succeeded (green). If it failed (red), open the build log and fix the error (e.g. missing env vars, wrong Node version).
- Make sure you’re opening the **root** URL (e.g. `https://your-project.vercel.app/`), not a path like `/api/sync` (that’s for the button, not the main page).

### 3. Confirm repo structure on GitHub

On GitHub, at the **top level** of your repo you should see either:

- **Option A:** `package.json`, `src/`, `schema.sql`, etc. (no extra folder) → Root Directory on Vercel should be **blank**.
- **Option B:** A single folder (e.g. `action-items-app`) and inside it `package.json`, `src/`, etc. → Root Directory on Vercel must be **`action-items-app`** (or whatever that folder is called).

---

## Troubleshooting: Build failed (after setting Root Directory)

If the **Build** step fails when you redeploy:

### 1. Get the exact error

- In Vercel, go to **Deployments** → click the **failed** deployment.
- Open the **Building** log and scroll to the **bottom**. The last red lines usually say what failed (e.g. “Cannot find module”, “No such file”, “Command failed”).

### 2. Wrong Root Directory (build can’t find files)

- If the error says **“No package.json found”** or **“This directory does not contain a package.json”**, the Root Directory value doesn’t match your repo.
  - On **GitHub**, look at the **top level** of your repo. Do you see a **folder** (e.g. `action-items-app`) and *inside* it `package.json` and `src/`? Then Root Directory should be that folder name.
  - If instead you see `package.json` and `src/` **directly** at the top (no extra folder), **clear** Root Directory: Vercel → **Settings** → **General** → **Root Directory** → **Edit** → delete the value and leave it blank → **Save** → **Redeploy**.

### 3. Repo structure is different

- If your repo has **two** nested folders (e.g. `action-items-app/action-items-app/package.json`), set Root Directory to the **full path** to the folder that contains `package.json`, e.g. **`action-items-app/action-items-app`** (no leading slash).
- If the folder has a **different name** (e.g. `my-slack-app`), set Root Directory to that name.

### 4. Pull the latest code into the repo and redeploy

- The project was updated so the build is less likely to fail (ESLint is ignored during build, Node version is set). So that **same app code** needs to be in your GitHub repo.
- On your **Mac**, open the `action-items-app` folder and confirm it has the updated **next.config.js** (it should contain `eslint: { ignoreDuringBuilds: true }`).
- If you have the updated files, **re-upload** the changed files to GitHub (overwrite `next.config.js` and `package.json`), then in Vercel click **Redeploy** so it builds from the latest commit.
