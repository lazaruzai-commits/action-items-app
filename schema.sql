-- Run this in Vercel Dashboard: Storage → Postgres → Query (or connect and run locally)
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  priority TEXT NOT NULL CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
  due_date DATE,
  source_author TEXT,
  source_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
