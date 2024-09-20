CREATE INDEX changelogs_embedding_idx ON public.changelogs USING hnsw (embedding vector_cosine_ops);

CREATE INDEX releases_embedding_idx ON public.releases USING hnsw (embedding vector_cosine_ops);


