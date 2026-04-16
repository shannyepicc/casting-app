-- ── 005_social_layer.sql ─────────────────────────────────────────────────────
-- Adds: account_type='both', creator profile fields, posts table, backfill

-- ── 1. Expand account_type to support 'both' ─────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_account_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('actor', 'creator', 'both'));

-- ── 2. Add creator-specific profile fields ────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creator_handle    TEXT,
  ADD COLUMN IF NOT EXISTS creator_bio       TEXT,
  ADD COLUMN IF NOT EXISTS project_types     TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS past_productions  TEXT;

-- ── 3. Create posts table ─────────────────────────────────────────────────────
-- Roles are still stored in the roles table; a post of type='role' is created
-- alongside each role to surface it in the social feed. Non-role posts
-- (updates, announcements) have role_id = NULL.

CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL CHECK (type IN ('update', 'role', 'announcement')),
  body        TEXT,
  tag         TEXT,       -- announcement tag: wrapped | in_production | seeking_collaborator | available
  media_url   TEXT,
  role_id     UUID        REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select ON public.posts
  FOR SELECT USING (true);

CREATE POLICY posts_insert ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY posts_update ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY posts_delete ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ── 5. updated_at trigger ─────────────────────────────────────────────────────
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ── 6. Backfill: create feed posts for all existing roles ─────────────────────
INSERT INTO public.posts (author_id, type, body, role_id, created_at)
SELECT
  r.cd_id,
  'role',
  r.description,
  r.id,
  r.created_at
FROM public.roles r
WHERE NOT EXISTS (
  SELECT 1 FROM public.posts p WHERE p.role_id = r.id
);
