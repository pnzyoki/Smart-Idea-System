# ✨ Smart Idea System — Production Ready Deployment Guide

Welcome to the production deployment guide for the **Smart Idea System**. The application has been engineered to run in a flexible **Dual-Mode System Architecture**:
1. **⚡ Sandbox Mode**: Zero configuration needed. The system operates fully offline, using browser `localStorage` to mock authentication and database queries, combined with a local regex-based Natural Language Processing (NLP) mock engine for AI critiques and folders.
2. **🔌 Live Production Mode**: Activates automatically when live credentials for **Supabase Cloud** and **OpenAI** are supplied in your environment variables. It instantly transitions into a secure, multi-user SaaS with active AI capabilities.

This guide provides everything you need to **Go Live**!

---

## 🛠️ Step 1: Database & Auth Setup (Supabase Cloud)

Supabase provides the cloud database, user authentication (signup/login), and Row Level Security. 

### 1. Create a Supabase Project
- Sign in to [Supabase](https://supabase.com).
- Click **New Project** and select your organization, project name, database password, and region.

### 2. Run the Table SQL Schema
Navigate to the **SQL Editor** in the left sidebar of your Supabase dashboard, click **New Query**, paste the script below, and click **Run**:

```sql
-- ==========================================================
-- SMART IDEA SYSTEM - PRODUCTION SQL SCHEMA
-- ==========================================================

-- 1. Create the Ideas Table
CREATE TABLE public.ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 10),
    feasibility INTEGER NOT NULL CHECK (feasibility >= 1 AND feasibility <= 10),
    effort INTEGER NOT NULL CHECK (effort >= 1 AND effort <= 10),
    score NUMERIC NOT NULL,
    quadrant TEXT NOT NULL
);

-- 2. Enable Row Level Security (RLS) for complete privacy
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: View own ideas
CREATE POLICY "Allow authenticated users to read their own ideas"
ON public.ideas
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. RLS Policy: Insert own ideas
CREATE POLICY "Allow authenticated users to insert their own ideas"
ON public.ideas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. RLS Policy: Update own ideas
CREATE POLICY "Allow authenticated users to update their own ideas"
ON public.ideas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policy: Delete own ideas
CREATE POLICY "Allow authenticated users to delete their own ideas"
ON public.ideas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 3. Copy API Keys
Navigate to **Project Settings** > **API** and copy:
1. **Project URL**
2. **Anon Public Key**

---

## 🤖 Step 2: OpenAI API Integration setup

The AI Co-Pilot uses `gpt-4o-mini` with direct `fetch` calls to perform instant score audits, write actionable feedback bullets, and dynamically group folders.

1. Navigate to the [OpenAI Platform](https://platform.openai.com/).
2. Create an account, fund it with a minor balance (e.g. $5), and create a new **API Key**.
3. Copy the secret key string.

---

## 🔑 Step 3: Configure Environment Variables

Create or open the `.env` file in the root of the project (`smart-idea-system/.env`) and replace the default placeholders with your actual keys:

```ini
# ==========================================================
# SMART IDEA SYSTEM - PRODUCTION ENVIRONMENT KEYS
# ==========================================================

# Supabase API Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here

# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

> [!NOTE]
> Restart your local Vite development server (`npm run dev`) after modifying the `.env` file to apply the new environment variables.

---

## 🚀 Step 4: Deploying Live to the Cloud

Once your project builds cleanly, you can host it on any major static site provider (Vercel, Netlify, Cloudflare Pages, etc.).

### Option A: Deploy to Vercel (Recommended)
1. Install Vercel CLI globally if you haven't already:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project directory:
   ```bash
   vercel
   ```
3. Set up the project through the interactive CLI prompts.
4. When prompted, add the three environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
5. Vercel will build and provide a production live URL!

### Option B: Deploy to GitHub & Netlify
1. Initialize a Git repository and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: smart-idea-system ready for deployment"
   ```
2. Push your project to a GitHub repository.
3. Import the repository on [Netlify](https://www.netlify.com).
4. Under **Site Configuration** > **Environment variables**, define:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
5. Set Build Command to `npm run build` and Publish Directory to `dist`.
6. Click **Deploy Site**!

---

## 🔍 Step 5: Verification & Playbook

Once deployed, visit your live site and run these verification steps:

1. **Authentication Verification**: Click **Sign Up**, register with a real email and password, and check that a corresponding user appears under your Supabase Dashboard's **Authentication** tab.
2. **Database Verification**: Add a new idea using the capture panel. Refresh the page and confirm the idea remains, and verify that the new entry appears in the `ideas` database table in your Supabase dashboard.
3. **AI Folder Grouping Verification**: Navigate to **Analytics** and click **🤖 Group with AI**. Your ideas will be grouped dynamically by their semantic similarities using real GPT-4o-mini completions!
4. **AI Critique Drawer Verification**: Open any idea card and click **🤖 AI Critique**. Verify that the card slides down to show a side-by-side assessment comparison, a brief audit synopsis, and exactly three glowing, actionable bullet points.
