ALTER TABLE public.trip_groups ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS trip_groups_is_demo_idx ON public.trip_groups (is_demo);