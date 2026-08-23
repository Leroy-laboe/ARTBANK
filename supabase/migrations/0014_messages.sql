-- 0014 — Conversations, messages, and the safety controls.
--
-- Implements step 7 of the migration order in
-- docs/pivot-checklist/25-database-schema-plan.md.
--
-- Safe to re-run.

create table if not exists public.conversations (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references public.users(id) on delete cascade,
  buyer_id       uuid not null references public.users(id) on delete cascade,
  -- Every conversation is about something. 15-messages.md requires the
  -- artwork and purpose to travel with the message, not be typed into it.
  artwork_id     text references public.artworks(id) on delete set null,
  category       text not null check (category in
                   ('new_enquiry', 'purchase', 'licence', 'exhibition',
                    'commission', 'collaboration', 'support')),
  purpose        text,
  -- Set when either party is a minor. Enforced by trigger below.
  guardian_cc_id uuid references public.users(id),
  last_message_at timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index if not exists conversations_artist_id_idx on public.conversations (artist_id);
create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);

-- ── HARD RULE: guardian routing for minors ───────────────────────────────
-- "Minor cannot receive uncontrolled adult contact" is a completion-test
-- blocker in 00-overview-and-timeline.md. A CHECK constraint can't run the
-- subqueries this needs, so it's a trigger — which also means the rule holds
-- for anything writing to the table, not just our own UI.
create or replace function public.enforce_guardian_routing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artist_is_minor boolean;
  buyer_is_minor  boolean;
begin
  select is_minor into artist_is_minor from public.users where id = new.artist_id;
  select is_minor into buyer_is_minor  from public.users where id = new.buyer_id;

  if coalesce(artist_is_minor, false) or coalesce(buyer_is_minor, false) then
    if new.guardian_cc_id is null then
      raise exception
        'A conversation involving a minor requires guardian_cc_id (guardian routing is mandatory).'
        using errcode = 'check_violation';
    end if;

    -- The named guardian must actually be the guardian of the minor in
    -- question — any other account would defeat the point.
    if not exists (
      select 1
        from public.guardian_links g
       where g.guardian_user_id = new.guardian_cc_id
         and g.minor_user_id in (
           case when coalesce(artist_is_minor, false) then new.artist_id end,
           case when coalesce(buyer_is_minor,  false) then new.buyer_id  end
         )
    ) then
      raise exception
        'guardian_cc_id is not a linked guardian of the minor in this conversation.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversations_guardian_routing on public.conversations;
create trigger conversations_guardian_routing
  before insert or update of artist_id, buyer_id, guardian_cc_id
  on public.conversations
  for each row execute function public.enforce_guardian_routing();

-- ── messages ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.users(id) on delete cascade,
  body            text not null,
  attachment_url  text,
  attachment_name text,
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

-- ── conversation_flags: Report · Block · Archive ─────────────────────────
create table if not exists public.conversation_flags (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  flagged_by      uuid not null references public.users(id) on delete cascade,
  action          text not null check (action in ('report', 'block', 'archive')),
  reason          text,
  created_at      timestamptz not null default now()
);

create index if not exists conversation_flags_conversation_id_idx
  on public.conversation_flags (conversation_id);

-- ── Row level security ───────────────────────────────────────────────────
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.conversation_flags  enable row level security;

-- A guardian can see their minor's conversations — that is the point of
-- routing them through the guardian in the first place.
drop policy if exists "Participants read their conversations" on public.conversations;
create policy "Participants read their conversations"
  on public.conversations for select
  using (
    artist_id      = public.current_user_id()
    or buyer_id    = public.current_user_id()
    or guardian_cc_id = public.current_user_id()
  );

drop policy if exists "Participants create conversations" on public.conversations;
create policy "Participants create conversations"
  on public.conversations for insert
  to authenticated
  with check (artist_id = public.current_user_id() or buyer_id = public.current_user_id());

drop policy if exists "Participants update their conversations" on public.conversations;
create policy "Participants update their conversations"
  on public.conversations for update
  using (artist_id = public.current_user_id() or buyer_id = public.current_user_id())
  with check (artist_id = public.current_user_id() or buyer_id = public.current_user_id());

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.artist_id = public.current_user_id()
              or c.buyer_id = public.current_user_id()
              or c.guardian_cc_id = public.current_user_id())
    )
  );

-- You may only send as yourself, and only into a conversation you are in.
drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = public.current_user_id()
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.artist_id = public.current_user_id() or c.buyer_id = public.current_user_id())
    )
  );

drop policy if exists "Participants flag their conversations" on public.conversation_flags;
create policy "Participants flag their conversations"
  on public.conversation_flags for all
  using (flagged_by = public.current_user_id())
  with check (flagged_by = public.current_user_id());
