create table public.trip_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.trip_groups(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text,
  sender_role text,
  message text not null,
  is_system_message boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert on public.trip_group_messages to authenticated;
grant all on public.trip_group_messages to service_role;

alter table public.trip_group_messages enable row level security;

create policy "Group members read messages" on public.trip_group_messages
for select to authenticated
using (public.is_group_member(group_id, auth.uid()) or public.is_group_driver(group_id, auth.uid()) or public.has_role(auth.uid(), 'admin'));

create policy "Group members send messages" on public.trip_group_messages
for insert to authenticated
with check (
  (public.is_group_member(group_id, auth.uid()) or public.is_group_driver(group_id, auth.uid()))
  and (sender_id is null or sender_id = auth.uid())
);

create policy "Admins manage messages" on public.trip_group_messages
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create index trip_group_messages_group_idx on public.trip_group_messages(group_id, created_at);

alter table public.trip_group_messages replica identity full;
alter publication supabase_realtime add table public.trip_group_messages;