alter table "public"."package_user" enable row level security;

alter table "public"."packages" enable row level security;

alter table "public"."users" enable row level security;

create policy "Must be authenticated and only their own data"
on "public"."package_user"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Must be authenticated to create"
on "public"."packages"
as permissive
for insert
to authenticated
with check (true);


create policy "Must be authenticated to update"
on "public"."packages"
as permissive
for update
to authenticated
using (true);


create policy "Must be authenticated to view"
on "public"."packages"
as permissive
for select
to authenticated
using (true);


create policy "User can see their own profile"
on "public"."users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));



