set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_releases(query_embedding vector, match_threshold double precision, match_count integer)
 RETURNS TABLE(id bigint, title text, body text, similarity double precision)
 LANGUAGE sql
 STABLE
AS $function$
  select
    releases.id,
    releases.version,
    releases.release_notes,
    1 - (releases.embedding <=> query_embedding) as similarity
  from releases
  where 1 - (releases.embedding <=> query_embedding) > match_threshold
  order by (releases.embedding <=> query_embedding) asc
  limit match_count;
$function$
;

create policy "Must be authenticated to view"
on "public"."releases"
as permissive
for select
to authenticated
using (true);



