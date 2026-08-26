-- 0020 — Evidence documents, rights and permitted uses, and publishing.
--
-- Completes docs/pivot-checklist/10-add-artwork.md. Steps 1–5 of the spec's
-- nine were already covered by 0011/0017/0019; this backs the remaining four:
--
--   6. Rights and permitted uses   → artworks.permitted_uses / rights_note
--   7. Evidence and supporting files → artwork_evidence_files (extended below)
--   8. Visibility                  → artworks.visibility (added in 0017)
--   9. Review and publish          → artworks.published_at
--
-- Safe to re-run.

-- ── Rights and permitted uses ────────────────────────────────────────────
-- Permission-first: the default is an empty array, meaning nothing beyond
-- showing the record is permitted. A use only becomes allowed because the
-- artist ticked it, never because a default was left alone.
alter table public.artworks add column if not exists permitted_uses text[] not null default '{}';
alter table public.artworks add column if not exists rights_note text;

comment on column public.artworks.permitted_uses is
  'Uses the artist has explicitly allowed. Empty means no use is permitted beyond displaying the record — never treat an empty array as "anything goes".';

-- ── Publishing ───────────────────────────────────────────────────────────
-- Null until the artist publishes. Nothing sets this on their behalf: the
-- brief bans auto-submission and auto-publication alike.
alter table public.artworks add column if not exists published_at timestamptz;

-- ── Evidence files ───────────────────────────────────────────────────────
-- 0015 created the table with just a url and a name. Add what the Documents
-- step actually collects.
alter table public.artwork_evidence_files add column if not exists document_type text not null default 'other';
alter table public.artwork_evidence_files drop constraint if exists artwork_evidence_files_document_type_check;
alter table public.artwork_evidence_files add constraint artwork_evidence_files_document_type_check
  check (document_type in
    ('ownership', 'certificate', 'exhibition', 'condition', 'invoice', 'appraisal', 'other'));

-- storage_path is what lets a delete remove the file as well as the row.
alter table public.artwork_evidence_files add column if not exists storage_path text;
alter table public.artwork_evidence_files add column if not exists file_size bigint;

-- ── Storage: a private bucket ────────────────────────────────────────────
-- Deliberately not public, unlike artwork-images. These documents are the
-- basis of a COA review — ownership proof, invoices, appraisals — and 0015's
-- RLS already says they are private to the artist. A public bucket would make
-- that policy decorative, since anyone with the URL could read the file.
insert into storage.buckets (id, name, public)
values ('artwork-documents', 'artwork-documents', false)
on conflict (id) do nothing;

-- Files are stored under {artwork_id}/..., so ownership of the first path
-- segment is what grants access.
drop policy if exists "Artists manage their own artwork documents" on storage.objects;
create policy "Artists manage their own artwork documents"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'artwork-documents'
    and exists (
      select 1 from public.artworks a
       where a.id = (storage.foldername(name))[1]
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  )
  with check (
    bucket_id = 'artwork-documents'
    and exists (
      select 1 from public.artworks a
       where a.id = (storage.foldername(name))[1]
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );

-- ── History ──────────────────────────────────────────────────────────────
-- Publishing is a provenance event, so the timeline needs a type for it.
alter table public.artwork_history_events drop constraint if exists artwork_history_events_event_type_check;
alter table public.artwork_history_events add constraint artwork_history_events_event_type_check
  check (event_type in
    ('upload', 'evidence', 'exhibition', 'enquiry', 'licence', 'sale', 'publish'));
