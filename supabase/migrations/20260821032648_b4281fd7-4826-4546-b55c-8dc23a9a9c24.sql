ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;