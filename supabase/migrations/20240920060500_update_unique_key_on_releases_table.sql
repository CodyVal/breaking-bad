alter table "public"."releases" drop constraint "releases_version_key";

drop index if exists "public"."releases_version_key";

CREATE UNIQUE INDEX releases_package_version_unique ON public.releases USING btree (package_id, version);

alter table "public"."releases" add constraint "releases_package_version_unique" UNIQUE using index "releases_package_version_unique";


