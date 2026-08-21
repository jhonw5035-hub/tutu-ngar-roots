CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type text NOT NULL DEFAULT 'driver',
  category text NOT NULL DEFAULT 'other',
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passengers create own complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Passengers read own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid() = passenger_id);

CREATE POLICY "Admins manage complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;