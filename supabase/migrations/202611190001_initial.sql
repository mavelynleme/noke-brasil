
create type public.group_role as enum ('owner','viewer','contributor');
create type public.expense_origin as enum ('manual','receipt','shared');
create type public.list_status as enum ('draft','ready','completed');
create type public.verification_status as enum ('pending','verified','rejected');

create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 given_name text not null,
 family_name text,
 birth_date date,
 phone text,
 avatar_path text
);
create table public.business_profiles (
 id uuid primary key references public.profiles on delete cascade,
 name text not null,
 cnpj text not null unique check (cnpj ~ '^[A-Z0-9]{12}[0-9]{2}$'),
 verification public.verification_status not null default 'pending',
 plan_code text
);
create table public.vehicles (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 name text not null,
 km_per_liter numeric not null check (km_per_liter > 0)
);
create table public.saved_locations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 label text not null,
 address text not null
);
create table public.expense_categories (
 id text primary key,
 name text not null
);
create table public.finance_groups (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 name text not null
);
create table public.finance_group_members (
 group_id uuid not null references public.finance_groups on delete cascade,
 profile_id uuid not null references public.profiles on delete cascade,
 role public.group_role not null check (role <> 'owner'),
 primary key(group_id, profile_id)
);
create table public.receipts (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 merchant text,
 total_cents bigint not null check (total_cents > 0),
 purchased_on date not null,
 confidence numeric check (confidence between 0 and 1),
 image_path text check (image_path is null or split_part(image_path,'/',1) = owner_id::text),
 unique(id,owner_id)
);
create table public.receipt_items (
 id uuid primary key default gen_random_uuid(),
 receipt_id uuid not null references public.receipts on delete cascade,
 name text not null,
 cents bigint not null check (cents >= 0)
);
create table public.expenses (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 group_id uuid references public.finance_groups on delete cascade,
 category_id text not null references public.expense_categories,
 receipt_id uuid,
 cents bigint not null check (cents > 0),
 occurred_on date not null,
 description text,
 origin public.expense_origin not null,
 check ((group_id is not null) = (origin = 'shared')),
 foreign key(receipt_id,owner_id) references public.receipts(id,owner_id)
);
create table public.budgets (
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 period text not null check (period in ('day','week','month')),
 limit_cents bigint not null check (limit_cents > 0),
 alert_fraction numeric not null default .8 check (alert_fraction between 0 and 1),
 primary key(owner_id,period)
);
create table public.shopping_lists (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 name text not null,
 status public.list_status not null default 'draft'
);
create table public.shopping_list_items (
 id uuid primary key default gen_random_uuid(),
 list_id uuid not null references public.shopping_lists on delete cascade,
 name text not null,
 bought boolean not null default false
);
create table public.stores (
 id uuid primary key default gen_random_uuid(),
 business_id uuid references public.business_profiles on delete cascade,
 name text not null,
 location text not null,
 is_public boolean not null default false,
 unique(id,business_id)
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 is_public boolean not null default false
);
create table public.offers (
 id uuid primary key default gen_random_uuid(),
 store_id uuid not null,
 business_id uuid not null default auth.uid(),
 product_id uuid not null references public.products,
 cents bigint not null check (cents > 0),
 image_path text check (image_path is null or split_part(image_path,'/',1) = business_id::text),
 published_at timestamptz,
 foreign key(store_id,business_id) references public.stores(id,business_id) on delete cascade
);
create table public.price_reports (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles on delete cascade,
 store_id uuid not null references public.stores,
 product_id uuid not null references public.products,
 cents bigint not null check (cents > 0),
 receipt_id uuid,
 recorded_at timestamptz not null default now(),
 foreign key(receipt_id,owner_id) references public.receipts(id,owner_id)
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles on delete cascade,
 kind text not null check (kind in ('budget','shared','offer','price','account')),
 title text not null,
 destination text check (destination ~ '^/(app|empresa)(/|$)'),
 created_at timestamptz not null default now(),
 read_at timestamptz
);
create index expenses_owner_date on public.expenses(owner_id,occurred_on desc);
create index expenses_group_date on public.expenses(group_id,occurred_on desc);
create index finance_members_profile on public.finance_group_members(profile_id,group_id);
create index notifications_owner_date on public.notifications(owner_id,created_at desc);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create function private.finance_role(group_key uuid) returns public.group_role
language sql stable security definer set search_path = '' as $$
 select case when g.owner_id = (select auth.uid()) then 'owner'::public.group_role else m.role end
 from public.finance_groups g
 left join public.finance_group_members m on m.group_id = g.id and m.profile_id = (select auth.uid())
 where g.id = group_key
$$;
revoke all on function private.finance_role(uuid) from public;
grant execute on function private.finance_role(uuid) to authenticated;

revoke all on public.profiles,public.business_profiles,public.vehicles,public.saved_locations,public.expense_categories,public.finance_groups,public.finance_group_members,public.receipts,public.receipt_items,public.expenses,public.budgets,public.shopping_lists,public.shopping_list_items,public.stores,public.products,public.offers,public.price_reports,public.notifications from anon,authenticated;
do $$
declare t text;
begin
 foreach t in array array['profiles','business_profiles','vehicles','saved_locations','expense_categories','finance_groups','finance_group_members','receipts','receipt_items','expenses','budgets','shopping_lists','shopping_list_items','stores','products','offers','price_reports','notifications']
 loop
  execute format('alter table public.%I enable row level security',t);
 end loop;
 foreach t in array array['vehicles','saved_locations','receipts','budgets','shopping_lists','price_reports']
 loop
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy own_rows on public.%I for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))',t);
 end loop;
end $$;

grant select,insert,update on public.profiles to authenticated;
create policy own_profile on public.profiles for all to authenticated using(id = (select auth.uid())) with check(id = (select auth.uid()));
grant select on public.business_profiles to authenticated;
grant insert(id,name,cnpj), update(name,cnpj) on public.business_profiles to authenticated;
create policy own_business on public.business_profiles for all to authenticated using(id = (select auth.uid())) with check(id = (select auth.uid()));

grant select,insert,delete on public.finance_groups to authenticated;
grant update(name) on public.finance_groups to authenticated;
create policy group_read on public.finance_groups for select to authenticated using(private.finance_role(id) is not null);
create policy owner_create on public.finance_groups for insert to authenticated with check(owner_id = (select auth.uid()));
create policy owner_update on public.finance_groups for update to authenticated using(owner_id = (select auth.uid())) with check(owner_id = (select auth.uid()));
create policy owner_delete on public.finance_groups for delete to authenticated using(owner_id = (select auth.uid()));
grant select,insert,delete on public.finance_group_members to authenticated;
grant update(role) on public.finance_group_members to authenticated;
create policy member_read on public.finance_group_members for select to authenticated using(private.finance_role(group_id) is not null);
create policy member_add on public.finance_group_members for insert to authenticated with check(private.finance_role(group_id) = 'owner');
create policy member_change on public.finance_group_members for update to authenticated using(private.finance_role(group_id) = 'owner') with check(private.finance_role(group_id) = 'owner');
create policy member_remove on public.finance_group_members for delete to authenticated using(private.finance_role(group_id) = 'owner' or profile_id = (select auth.uid()));

grant select,insert,delete on public.expenses to authenticated;
grant update(category_id,cents,occurred_on,description) on public.expenses to authenticated;
create policy expense_read on public.expenses for select to authenticated using(
 (group_id is null and owner_id = (select auth.uid())) or private.finance_role(group_id) is not null
);
create policy expense_create on public.expenses for insert to authenticated with check(
 owner_id = (select auth.uid()) and (group_id is null or private.finance_role(group_id) in ('owner','contributor'))
);
create policy expense_update on public.expenses for update to authenticated using(
 (group_id is null and owner_id = (select auth.uid())) or private.finance_role(group_id) = 'owner'
 or (owner_id = (select auth.uid()) and private.finance_role(group_id) = 'contributor')
);
create policy expense_delete on public.expenses for delete to authenticated using(
 (group_id is null and owner_id = (select auth.uid())) or private.finance_role(group_id) = 'owner'
 or (owner_id = (select auth.uid()) and private.finance_role(group_id) = 'contributor')
);

grant select,insert,update,delete on public.receipt_items,public.shopping_list_items to authenticated;
create policy own_receipt_items on public.receipt_items for all to authenticated
 using(exists(select 1 from public.receipts r where r.id = receipt_id and r.owner_id = (select auth.uid())))
 with check(exists(select 1 from public.receipts r where r.id = receipt_id and r.owner_id = (select auth.uid())));
create policy own_list_items on public.shopping_list_items for all to authenticated
 using(exists(select 1 from public.shopping_lists l where l.id = list_id and l.owner_id = (select auth.uid())))
 with check(exists(select 1 from public.shopping_lists l where l.id = list_id and l.owner_id = (select auth.uid())));

grant select on public.expense_categories,public.products,public.stores,public.offers to anon,authenticated;
create policy categories_are_public on public.expense_categories for select using(id is not null);
create policy public_products on public.products for select using(is_public);
create policy public_stores on public.stores for select using(is_public);
create policy published_offers on public.offers for select using(
 published_at <= now()
 and exists(select 1 from public.stores s where s.id = store_id and s.is_public)
 and exists(select 1 from public.products p where p.id = product_id and p.is_public)
);
grant insert,update,delete on public.stores,public.offers to authenticated;
create policy business_stores on public.stores for all to authenticated using(business_id = (select auth.uid())) with check(business_id = (select auth.uid()));
create policy business_offers on public.offers for all to authenticated using(business_id = (select auth.uid())) with check(business_id = (select auth.uid()));
grant select,delete on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create policy own_notices on public.notifications for all to authenticated using(owner_id = (select auth.uid())) with check(owner_id = (select auth.uid()));
