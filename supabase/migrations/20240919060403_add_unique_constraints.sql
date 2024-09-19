alter table "public"."packages" disable row level security;

CREATE UNIQUE INDEX unique_name_scope ON public.packages USING btree (name, scope);

CREATE UNIQUE INDEX unique_package_user ON public.package_user USING btree (user_id, package_id);

alter table "public"."package_user" add constraint "unique_package_user" UNIQUE using index "unique_package_user";

alter table "public"."packages" add constraint "unique_name_scope" UNIQUE using index "unique_name_scope";


