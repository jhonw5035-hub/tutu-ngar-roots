-- Trigger / event-trigger functions must never be callable directly by API roles.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- RLS helper functions: not needed by anonymous visitors.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_group_driver(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.shares_group_with_driver(uuid, uuid) FROM PUBLIC, anon;

-- Signed-in users still need EXECUTE because these are referenced by RLS policies
-- evaluated in the caller's context.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_driver(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_group_with_driver(uuid, uuid) TO authenticated;