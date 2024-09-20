create extension if not exists "vector" with schema "extensions";


alter table "public"."changelogs" add column "embedding" vector(1536);

alter table "public"."releases" add column "embedding" vector(1536);


