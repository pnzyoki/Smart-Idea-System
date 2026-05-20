# ✨ Smart Idea System

An enterprise-grade, responsive React + Vite workspace designed to capture, track, and optimize software and business ideas. The application features a premium dark SaaS basalt aesthetic and a powerful dual-mode framework supporting local storage and live cloud databases.

---

## 🚀 Key Features

* **⚡ Dual-Mode Capability**: Run instantly offline out-of-the-box using the secure local sandbox (leveraging browser `localStorage` and local regex NLP engines), or connect to live cloud services seamlessly.
* **🤖 AI Co-Pilot**: Features dynamic semantic idea clustering and a slide-down audit critique matrix detailing side-by-side impact scoring comparisons and three actionable growth bullets.
* **🌌 Premium Aesthetics**: Modern slate/basalt design utilizing rich spacing, glassmorphic overlays, and glowing interactive elements.
* **📱 Mobile First**: Fully responsive layout with optimized thumb-tap navigation bars and collapsing split columns for viewports under 768px.

---

## 🛠️ Local Development

Follow these steps to spin up the workspace locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch the development server**:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.
4. Enter any test credentials in the sign-in modal to immediately access the local sandbox!

---

## 🔒 Production Security & Going Live

To connect the application to your live production cloud services, configure your environment parameters securely:

### 1. Database & Authentication Setup (Supabase)
Create a new project on [Supabase](https://supabase.com) and execute this schema query in their **SQL Editor** to create the table and enable active Row Level Security (RLS) policies:

```sql
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

-- 3. RLS Policies
CREATE POLICY "Allow authenticated users to read their own ideas"
ON public.ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own ideas"
ON public.ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own ideas"
ON public.ideas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own ideas"
ON public.ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### 2. Environment Variables Configuration
Duplicate the `.env.example` file and rename it to `.env`. Fill in the parameters with your cloud credentials:

```ini
# Supabase URL & Public Anon Key
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# OpenAI API Key (for GPT-4o-mini dynamic critiques and folders)
VITE_OPENAI_API_KEY=
```

> [!WARNING]
> Keep your active `.env` file private. It has been pre-configured in `.gitignore` to prevent secret keys from being tracked by Git. Never commit production keys to your repository.
