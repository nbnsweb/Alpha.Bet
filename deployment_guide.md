# Step-by-Step Deployment Guide

Follow these steps exactly to get your app online.

## Phase 1: Push Code to GitHub
1.  **Log in to GitHub** and create a **New Repository**.
    -   Name: `Alpha.Bet`
    -   Public or Private: **Public** (easier for free deployment).
    -   **Do NOT** initialize with README, .gitignore, or license.
2.  **Open Terminal** in VS Code.
3.  Copy and paste these commands **one by one**:

    ```powershell
    cd "f:\Google Antigravity\deploy_ready"
    git init
    git add .
    git commit -m "Initial deploy"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/Alpha.Bet.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

## Phase 2: Deploy Backend (The Server)
1.  Go to [Render.com](https://render.com/) and Sign Up/Log In with GitHub.
2.  Click **New +** button -> select **Web Service**.
3.  Select your `Alpha.Bet` repository from the list.
4.  Scroll down and configure these settings:
    -   **Name**: `alphabet-backend` (or similar)
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
    -   **Plan**: Free
5.  Click **Create Web Service**.
6.  **Wait** for it to say "Live".
7.  **Copy the URL** at the top (e.g., `https://alphabet-backend.onrender.com`).

## Phase 3: Link Backend to Frontend
1.  Go back to your **GitHub Repository**.
2.  Click **Settings** (top tab) -> **Secrets and variables** (left menu) -> **Actions**.
3.  Click **New repository secret**.
4.  **Name**: `VITE_BACKEND_URL`
5.  **Secret**: Paste your Render URL (from Phase 2).
6.  Click **Add secret**.

## Phase 4: Trigger Frontend Build
1.  Go to the **Actions** tab in your GitHub Repo.
2.  You might see a failed run (that's expected).
3.  Click on the workflow **"Deploy Frontend to GitHub Pages"** on the left.
4.  Click **Run workflow** (blue button) -> **Run workflow**.
5.  Wait for it to turn **Green**.

## Phase 5: View Your App!
1.  Go to **Settings** -> **Pages**.
2.  You should see your link: `https://YOUR_USERNAME.github.io/Alpha.Bet/`
3.  Open it on your phone and laptop!
