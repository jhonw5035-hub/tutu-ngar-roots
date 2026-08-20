-- ENUMS
create type public.gender_type as enum ('male','female','other');
create type public.app_role as enum ('passenger','driver','admin');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  phone text,
  gender public.gender_type,
  photo_url text,
  plate_number text,
  seat_capacity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- TRIP GROUPS
create table public.trip_groups (
  id uuid primary key default gen_random_uuid(),
  pickup_point_label text,
  pickup_lat numeric,
  pickup_lng numeric,
  driver_id uuid references public.profiles(id) on delete set null,
  status text not null default 'forming',
  eta_to_pickup text,
  corridor_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.trip_groups to authenticated;
grant all on public.trip_groups to service_role;
alter table public.trip_groups enable row level security;

-- BOOKINGS
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  passenger_name text,
  passenger_gender public.gender_type,
  pickup_lat numeric,
  pickup_lng numeric,
  pickup_label text,
  destination_label text,
  destination_lat numeric,
  destination_lng numeric,
  requested_time timestamptz,
  status text not null default 'pending',
  group_id uuid references public.trip_groups(id) on delete set null,
  minority_gender_note boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;

-- TRIP GROUP MEMBERS
create table public.trip_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.trip_groups(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  drop_label text,
  drop_lat numeric,
  drop_lng numeric,
  drop_order int,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.trip_group_members to authenticated;
grant all on public.trip_group_members to service_role;
alter table public.trip_group_members enable row level security;

-- DRIVER STATUS
create table public.driver_status (
  driver_id uuid primary key references public.profiles(id) on delete cascade,
  is_online boolean not null default false,
  current_lat numeric,
  current_lng numeric,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.driver_status to authenticated;
grant all on public.driver_status to service_role;
alter table public.driver_status enable row level security;

-- HELPERS
create or replace function public.is_group_member(_group_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bookings b where b.group_id = _group_id and b.passenger_id = _user_id)
$$;

create or replace function public.is_group_driver(_group_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.trip_groups g where g.id = _group_id and g.driver_id = _user_id)
$$;

create or replace function public.shares_group_with_driver(_driver_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trip_groups g
    join public.bookings b on b.group_id = g.id
    where g.driver_id = _driver_id and b.passenger_id = _user_id
  )
$$;

-- POLICIES: profiles
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- POLICIES: user_roles
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- POLICIES: bookings
create policy "Passengers read own bookings" on public.bookings for select to authenticated using (auth.uid() = passenger_id);
create policy "Passengers create own bookings" on public.bookings for insert to authenticated with check (auth.uid() = passenger_id);
create policy "Passengers update own bookings" on public.bookings for update to authenticated using (auth.uid() = passenger_id) with check (auth.uid() = passenger_id);
create policy "Drivers read bookings of their groups" on public.bookings for select to authenticated using (group_id is not null and public.is_group_driver(group_id, auth.uid()));
create policy "Admins manage bookings" on public.bookings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- POLICIES: trip_groups
create policy "Members read their group" on public.trip_groups for select to authenticated using (public.is_group_member(id, auth.uid()));
create policy "Drivers read assigned groups" on public.trip_groups for select to authenticated using (driver_id = auth.uid());
create policy "Drivers update assigned groups" on public.trip_groups for update to authenticated using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "Admins manage trip groups" on public.trip_groups for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- POLICIES: trip_group_members
create policy "Members read their group members" on public.trip_group_members for select to authenticated using (public.is_group_member(group_id, auth.uid()));
create policy "Drivers read their group members" on public.trip_group_members for select to authenticated using (public.is_group_driver(group_id, auth.uid()));
create policy "Admins manage group members" on public.trip_group_members for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- POLICIES: driver_status
create policy "Drivers manage own status" on public.driver_status for all to authenticated using (auth.uid() = driver_id) with check (auth.uid() = driver_id);
create policy "Passengers read their driver status" on public.driver_status for select to authenticated using (public.shares_group_with_driver(driver_id, auth.uid()));
create policy "Admins manage driver status" on public.driver_status for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- TIMESTAMPS
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger trg_bookings_updated before update on public.bookings for each row execute function public.update_updated_at_column();
create trigger trg_trip_groups_updated before update on public.trip_groups for each row execute function public.update_updated_at_column();
create trigger trg_driver_status_updated before update on public.driver_status for each row execute function public.update_updated_at_column();

-- NEW USER HANDLER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, first_name, phone, gender, plate_number, seat_capacity)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'phone',
    case when new.raw_user_meta_data ->> 'gender' in ('male','female','other')
      then (new.raw_user_meta_data ->> 'gender')::public.gender_type else null end,
    new.raw_user_meta_data ->> 'plate_number',
    nullif(new.raw_user_meta_data ->> 'seat_capacity','')::int
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' in ('passenger','driver','admin')
      then (new.raw_user_meta_data ->> 'role')::public.app_role else 'passenger'::public.app_role end
  )
  on conflict do nothing;

  if (new.raw_user_meta_data ->> 'role') = 'driver' then
    insert into public.driver_status (driver_id, is_online) values (new.id, false) on conflict do nothing;
  end if;

  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- REALTIME
alter table public.bookings replica identity full;
alter table public.trip_groups replica identity full;
alter table public.trip_group_members replica identity full;
alter table public.driver_status replica identity full;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.trip_groups;
alter publication supabase_realtime add table public.trip_group_members;
alter publication supabase_realtime add table public.driver_status;