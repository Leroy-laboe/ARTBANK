-- 0016 — Turn the front-end mock data into real rows under one artist, "test".
--
-- Everything the six ArtSpace screens display in demo mode now exists in the
-- database: 7 artworks, 43 identified interest entries, 7 recorded deals,
-- 4 opportunities with explained matches, and 7 conversations.
--
-- HOW TO USE IT
--   1. Run this migration.
--   2. Sign up in the app with your own email (any password).
--   3. Run:  select public.claim_seed_artist('you@example.com');
--      That hands the whole seeded library to your account and makes you an
--      artist, so RLS lets you see it.
--
-- Safe to re-run. Seed rows use fixed UUIDs so a second run updates rather
-- than duplicating.

-- ── Schema corrections the built screens require ─────────────────────────
-- My Works shows "On View (Gallery)" and "Unavailable"; neither was in the
-- availability list the plan sketched. They're real states in the design, so
-- the constraint widens to match.
alter table public.artworks drop constraint if exists artworks_availability_check;
alter table public.artworks add constraint artworks_availability_check
  check (availability in
    ('available', 'on_view', 'reserved', 'sold', 'licensing_available', 'unavailable'));

alter table public.artworks add column if not exists availability_note text;

-- A match can be against one specific artwork or the artist generally, which
-- is what lets My Works count opportunities per row.
alter table public.opportunity_matches add column if not exists artwork_id text
  references public.artworks(id) on delete set null;

-- ── The cast ─────────────────────────────────────────────────────────────
-- Fixed UUIDs keep this migration idempotent.
insert into public.users (id, jo1n_identity_id, email, display_name, role, country, organization, is_minor)
values
  ('00000000-0000-4000-8000-000000000001', 'seed:test-artist', 'test@artbank.local', 'test', 'artist', 'Kuala Lumpur, Malaysia', null, false),

  -- Galleries, studios and collectors who show interest or send messages.
  ('00000000-0000-4000-8000-000000000010', 'seed:hotelier-gallery',  'hotelier@artbank.local',   'Hotelier Gallery',    'partner', 'Singapore',       'Hotelier Gallery',     false),
  ('00000000-0000-4000-8000-000000000011', 'seed:art-collector',     'collector@artbank.local',  'Art Collector',       'buyer',   'Malaysia',        null,                   false),
  ('00000000-0000-4000-8000-000000000012', 'seed:blue-arc',          'bluearc@artbank.local',    'Blue Arc Advisory',   'partner', 'UAE',             'Blue Arc Advisory',    false),
  ('00000000-0000-4000-8000-000000000013', 'seed:galerie-lumiere',   'lumiere@artbank.local',    'Galerie Lumière',     'partner', 'France',          'Galerie Lumière',      false),
  ('00000000-0000-4000-8000-000000000014', 'seed:studio-a',          'studioa@artbank.local',    'Studio A',            'partner', 'Singapore',       'Studio A',             false),
  ('00000000-0000-4000-8000-000000000015', 'seed:sophia-lee',        'sophia@artbank.local',     'Sophia Lee',          'buyer',   'South Korea',     null,                   false),
  ('00000000-0000-4000-8000-000000000016', 'seed:daniel-kim',        'daniel@artbank.local',     'Daniel Kim',          'buyer',   'Japan',           null,                   false),
  ('00000000-0000-4000-8000-000000000017', 'seed:modern-maison',     'maison@artbank.local',     'Modern Maison',       'partner', 'United Kingdom',  'Modern Maison',        false),
  ('00000000-0000-4000-8000-000000000018', 'seed:aisha-rahman',      'aisha@artbank.local',      'Aisha Rahman',        'buyer',   'UAE',             null,                   false),
  ('00000000-0000-4000-8000-000000000019', 'seed:golden-circle',     'golden@artbank.local',     'Golden Circle',       'partner', 'Hong Kong',       'Golden Circle',        false),
  ('00000000-0000-4000-8000-00000000001a', 'seed:ethan-brown',       'ethan@artbank.local',      'Ethan Brown',         'buyer',   'United States',   null,                   false),
  ('00000000-0000-4000-8000-00000000001b', 'seed:isabella-rossi',    'isabella@artbank.local',   'Isabella Rossi',      'buyer',   'Italy',           null,                   false),
  ('00000000-0000-4000-8000-00000000001c', 'seed:vista-art',         'vista@artbank.local',      'Vista Art Partners',  'partner', 'United Kingdom',  'Vista Art Partners',   false),
  ('00000000-0000-4000-8000-00000000001d', 'seed:the-substation',    'substation@artbank.local', 'The Substation',      'partner', 'Singapore',       'The Substation',       false),
  ('00000000-0000-4000-8000-00000000001e', 'seed:art-collectors-grp','acgroup@artbank.local',    'Art Collectors Group','partner', 'Malaysia',        'Art Collectors Group', false),
  ('00000000-0000-4000-8000-00000000001f', 'seed:design-haus',       'designhaus@artbank.local', 'Design Haus',         'partner', 'UAE',             'Design Haus',          false),
  ('00000000-0000-4000-8000-000000000020', 'seed:sophie-laurent',    'sophie@artbank.local',     'Sophie Laurent',      'buyer',   'France',          null,                   false),
  ('00000000-0000-4000-8000-000000000021', 'seed:michael-chen',      'michael@artbank.local',    'Michael Chen',        'buyer',   'Singapore',       null,                   false),
  ('00000000-0000-4000-8000-000000000022', 'seed:art-dubai',         'artdubai@artbank.local',   'Art Dubai',           'partner', 'UAE',             'Art Dubai',            false)
on conflict (id) do update
  set display_name = excluded.display_name,
      role         = excluded.role,
      country      = excluded.country,
      organization = excluded.organization;

-- ── Artworks ─────────────────────────────────────────────────────────────
insert into public.artworks
  (id, title, artist, artist_display_name, artist_id, uploaded_by, year, medium, dimensions,
   description, status, availability, availability_note, coa_status, image_url, smart_link_slug,
   created_at, updated_at)
values
  ('seed-rhythm-of-memory', 'Rhythm of Memory', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2024, 'Acrylic on Canvas', '80 × 60 cm',
   'Layered acrylic built up over months, holding the shape of a place remembered rather than seen.',
   'published', 'available', null, 'issued',
   'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-rhythm-of-memory', now() - interval '120 days', now() - interval '14 days'),

  ('seed-fragments-of-quiet-2', 'Fragments of Quiet #2', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2024, 'Mixed Media', '100 × 80 cm',
   'Second in a series working with torn paper, gesso and the pauses between marks.',
   'published', 'on_view', '(Gallery)', 'issued',
   'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-fragments-of-quiet-2', now() - interval '110 days', now() - interval '16 days'),

  ('seed-echoes', 'Echoes', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2023, 'Oil on Canvas', '90 × 70 cm',
   'Oil worked wet-into-wet, then scraped back until only the returning shapes remain.',
   'published', 'available', null, 'issued',
   'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-echoes', now() - interval '300 days', now() - interval '17 days'),

  ('seed-golden-silence', 'Golden Silence', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2023, 'Acrylic on Canvas', '60 × 60 cm',
   'A square held deliberately still — warm ground, one interruption near the upper edge.',
   'published', 'available', null, 'issued',
   'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-golden-silence', now() - interval '320 days', now() - interval '24 days'),

  ('seed-unfolding-light', 'Unfolding Light', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2023, 'Mixed Media', '120 × 90 cm',
   'Still in progress. The largest piece to date and the first to leave the studio unfinished.',
   'draft', 'unavailable', null, 'not_requested',
   'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-unfolding-light', now() - interval '90 days', now() - interval '25 days'),

  ('seed-stillness-within', 'Stillness Within', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2022, 'Oil on Canvas', '70 × 50 cm',
   'Painted in one sitting, which is unusual, and kept because of it.',
   'published', 'available', null, 'issued',
   'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-stillness-within', now() - interval '600 days', now() - interval '32 days'),

  ('seed-monochrome-study-1', 'Monochrome Study #1', 'test', 'test',
   '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
   2022, 'Charcoal on Paper', '50 × 70 cm',
   'A study rather than a finished work. Archived, kept for the record.',
   'archived', 'unavailable', null, 'issued',
   'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=1200&h=900&fit=crop&auto=format&q=80',
   'seed-monochrome-study-1', now() - interval '700 days', now() - interval '68 days')
on conflict (id) do update
  set title             = excluded.title,
      artist_id         = excluded.artist_id,
      uploaded_by       = excluded.uploaded_by,
      year              = excluded.year,
      medium            = excluded.medium,
      dimensions        = excluded.dimensions,
      description       = excluded.description,
      status            = excluded.status,
      availability      = excluded.availability,
      availability_note = excluded.availability_note,
      coa_status        = excluded.coa_status,
      image_url         = excluded.image_url,
      updated_at        = excluded.updated_at;

-- One primary image each, mirroring image_url into the new table.
insert into public.artwork_images (artwork_id, url, position, is_primary)
select a.id, a.image_url, 0, true
  from public.artworks a
 where a.id like 'seed-%'
   and a.image_url is not null
   and not exists (select 1 from public.artwork_images i where i.artwork_id = a.id);

-- ── Identified interest ──────────────────────────────────────────────────
-- Counts match what My Works shows: 12, 8, 6, 10, 2, 5 and 0. Everyone here
-- consented to be seen — anonymous traffic is never given a row.
delete from public.interest_entries where artist_id = '00000000-0000-4000-8000-000000000001';

insert into public.interest_entries
  (artwork_id, artist_id, viewer_id, is_identified, identity_sharing_consent,
   purpose, message, organization, budget_range, source, next_action, pipeline_stage, created_at)
select
  t.artwork_id,
  '00000000-0000-4000-8000-000000000001',
  v.id,
  true, true,
  (array['purchase', 'licence', 'exhibit', 'commission', 'collaborate'])[1 + (n % 5)],
  case when n = 1 then 'We would like to discuss this work for an upcoming show.' else null end,
  v.organization,
  (array['Under USD 5,000', 'USD 5,000 - 10,000', 'USD 10,000 - 25,000', 'Not disclosed'])[1 + (n % 4)],
  (array['instagram', 'direct', 'qr', 'referral'])[1 + (n % 4)],
  (array['reply', 'qualify', 'invite'])[1 + (n % 3)],
  (array['viewer', 'enquiry', 'qualified', 'negotiation'])[1 + (n % 4)],
  now() - (n || ' days')::interval
from (values
    ('seed-rhythm-of-memory',    12),
    ('seed-fragments-of-quiet-2', 8),
    ('seed-echoes',               6),
    ('seed-golden-silence',      10),
    ('seed-unfolding-light',      2),
    ('seed-stillness-within',     5)
  ) as t(artwork_id, wanted)
cross join lateral generate_series(1, t.wanted) as n
-- Cycle through the seeded viewers so every entry has a real person behind it.
join lateral (
  select id, organization
    from public.users
   where id between '00000000-0000-4000-8000-000000000010'
                and '00000000-0000-4000-8000-000000000022'
   order by id
   offset (n - 1) % 19 limit 1
) as v on true;

-- ── Recorded earnings ────────────────────────────────────────────────────
-- Only closed deals. Unfolding Light and Monochrome Study have none, which is
-- why they show "No earnings" rather than a zero that looks like a figure.
delete from public.artwork_deals where artist_id = '00000000-0000-4000-8000-000000000001';

insert into public.artwork_deals (artwork_id, artist_id, buyer_id, deal_type, amount, currency, agreed_at)
values
  ('seed-rhythm-of-memory',     '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000013', 'licence',    1450, 'USD', now() - interval '60 days'),
  ('seed-rhythm-of-memory',     '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000010', 'sale',       1000, 'USD', now() - interval '30 days'),
  ('seed-fragments-of-quiet-2', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000001f', 'commission', 1200, 'USD', now() - interval '45 days'),
  ('seed-echoes',               '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000021', 'licence',     850, 'USD', now() - interval '20 days'),
  ('seed-golden-silence',       '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000011', 'sale',       1250, 'USD', now() - interval '80 days'),
  ('seed-golden-silence',       '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000019', 'licence',     500, 'USD', now() - interval '35 days'),
  ('seed-stillness-within',     '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000018', 'sale',        620, 'USD', now() - interval '50 days');

-- ── Opportunities ────────────────────────────────────────────────────────
insert into public.opportunities
  (id, title, organizer_name, organizer_verified, location, summary, category, medium,
   deadline, budget_min, budget_max, fee_amount, is_published)
values
  ('00000000-0000-4000-9000-000000000001', 'Solo Exhibition Opportunity', 'The Substation', true, 'Singapore',
   'Inviting contemporary artists for a solo exhibition in our main gallery in Q4 2025.',
   'Visual Arts', 'All Mediums', current_date + 18, 3000, 3000, null, true),
  ('00000000-0000-4000-9000-000000000002', 'Corporate Collection Acquisition', 'Art Collectors Group', true, 'Kuala Lumpur, Malaysia',
   'Seeking original artworks for our corporate collection focusing on Southeast Asian artists.',
   'Painting, Mixed Media', 'Acrylic, Oil, Mixed Media', current_date + 33, 1000, 10000, null, true),
  ('00000000-0000-4000-9000-000000000003', 'Hospitality Art Project', 'Design Haus', true, 'Dubai, UAE',
   'Commissioning artworks for a luxury hotel opening in early 2026.',
   'Photography, Painting', 'All Mediums', current_date + 43, 5000, 15000, null, true),
  ('00000000-0000-4000-9000-000000000004', 'International Art Fair', 'Art Dubai', true, 'Dubai, UAE',
   'Open call for galleries and artists for the 2026 edition of Art Dubai.',
   'Visual Arts', 'All Mediums', current_date + 65, null, null, 20, true)
on conflict (id) do update
  set title = excluded.title, deadline = excluded.deadline;

-- Every match explains itself — the brief forbids unexplained recommendations.
insert into public.opportunity_matches
  (opportunity_id, artist_id, artwork_id, match_strength, match_score, why_text, missing_requirements)
values
  ('00000000-0000-4000-9000-000000000001', '00000000-0000-4000-8000-000000000001', 'seed-rhythm-of-memory',
   'strong', 95, 'Medium, location and career stage all match what the gallery is looking for.', array['Artist statement']),
  ('00000000-0000-4000-9000-000000000002', '00000000-0000-4000-8000-000000000001', 'seed-fragments-of-quiet-2',
   'strong', 88, 'Your medium and region match the collection''s stated focus.', array[]::text[]),
  ('00000000-0000-4000-9000-000000000003', '00000000-0000-4000-8000-000000000001', 'seed-golden-silence',
   'good', 82, 'Scale and previous commission experience match the brief.', array[]::text[]),
  ('00000000-0000-4000-9000-000000000004', '00000000-0000-4000-8000-000000000001', null,
   'weak', 41, 'Open to galleries first; individual artists are considered second.',
   array['Gallery representation', 'Exhibition history'])
on conflict (opportunity_id, artist_id) do update
  set artwork_id = excluded.artwork_id,
      match_strength = excluded.match_strength,
      match_score = excluded.match_score,
      why_text = excluded.why_text,
      missing_requirements = excluded.missing_requirements;

-- One application in progress, never auto-submitted.
insert into public.opportunity_applications (opportunity_id, artist_id, status, approved_by, submitted_at)
values ('00000000-0000-4000-9000-000000000003', '00000000-0000-4000-8000-000000000001',
        'submitted', '00000000-0000-4000-8000-000000000001', now() - interval '6 days')
on conflict (opportunity_id, artist_id) do nothing;

-- ── Conversations ────────────────────────────────────────────────────────
delete from public.messages
 where conversation_id in (
   select id from public.conversations where artist_id = '00000000-0000-4000-8000-000000000001'
 );
delete from public.conversations where artist_id = '00000000-0000-4000-8000-000000000001';

insert into public.conversations (id, artist_id, buyer_id, artwork_id, category, purpose, last_message_at, created_at)
values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000001d', 'seed-rhythm-of-memory',     'exhibition',   'Solo exhibition, November 2025',   now() - interval '2 hours', now() - interval '14 days'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000001e', 'seed-fragments-of-quiet-2', 'purchase',     'Corporate collection acquisition', now() - interval '6 hours', now() - interval '20 days'),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000001f', 'seed-fragments-of-quiet-2', 'commission',   'Hospitality art project',          now() - interval '1 day',   now() - interval '28 days'),
  ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 'seed-echoes',              'purchase',     'Acquisition enquiry',              now() - interval '4 days',  now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000013', null,                       'exhibition',   'Group exhibition invitation',      now() - interval '5 days',  now() - interval '40 days'),
  ('00000000-0000-4000-a000-000000000006', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000021', 'seed-echoes',              'licence',      'Brand campaign licence',           now() - interval '6 days',  now() - interval '44 days'),
  ('00000000-0000-4000-a000-000000000007', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000022', null,                       'new_enquiry',  'Open call application',            now() - interval '7 days',  now() - interval '50 days');

-- The Substation thread, in full.
insert into public.messages (conversation_id, sender_id, body, attachment_name, created_at, read_at)
values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-00000000001d',
   E'Hello,\n\nWe came across your artwork "Rhythm of Memory" and would love to feature it in our upcoming solo exhibition in November.\n\nWould you be open to discussing this opportunity?',
   null, now() - interval '2 days' - interval '3 hours', now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000001',
   E'Hello The Substation team,\n\nThank you so much for your interest! I''d be delighted to learn more about the exhibition. Please share the details.',
   null, now() - interval '2 days' - interval '2 hours', now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-00000000001d',
   'Great! Here are the details of the exhibition and our proposal.',
   'Exhibition_Proposal_Nov2025.pdf', now() - interval '2 days' - interval '1 hour', now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000001',
   'Thank you for the information. Everything looks exciting! I''ll review and get back to you shortly.',
   null, now() - interval '1 day', now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-00000000001d',
   'Perfect! Let us know if you need anything else.',
   null, now() - interval '2 hours', null),

  -- Latest message in each remaining thread, matching the list previews.
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-8000-00000000001e', 'Thanks for sharing the additional details. Our team will review and come back to you this week.', null, now() - interval '6 hours', null),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-8000-00000000001f', 'The mockup looks fantastic. When would be a good time to talk through the final sizes?',        null, now() - interval '1 day',   now() - interval '20 hours'),
  ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-8000-000000000020', 'I''m very interested in Echoes. Could we discuss the price?',                                 null, now() - interval '4 days',  now() - interval '3 days'),
  ('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-8000-000000000013', 'Invitation: Emerging Artists Exhibition 2025.',                                              null, now() - interval '5 days',  now() - interval '4 days'),
  ('00000000-0000-4000-a000-000000000006', '00000000-0000-4000-8000-000000000021', 'Following up on the licensing inquiry for our project.',                                      null, now() - interval '6 days',  now() - interval '5 days'),
  ('00000000-0000-4000-a000-000000000007', '00000000-0000-4000-8000-000000000022', 'Thank you for your application. We''ll be in touch soon.',                                    null, now() - interval '7 days',  now() - interval '6 days');

-- ── Provenance ───────────────────────────────────────────────────────────
delete from public.artwork_history_events where artwork_id like 'seed-%';

insert into public.artwork_history_events (artwork_id, event_type, description, occurred_at)
select a.id, 'upload', 'Record created and images uploaded.', a.created_at
  from public.artworks a where a.id like 'seed-%';

insert into public.artwork_history_events (artwork_id, event_type, description, occurred_at)
select a.id, 'evidence', 'Ownership statement and provenance documents added.', a.created_at + interval '3 days'
  from public.artworks a where a.id like 'seed-%' and a.coa_status = 'issued';

insert into public.artwork_history_events (artwork_id, event_type, description, occurred_at)
select d.artwork_id,
       case d.deal_type when 'sale' then 'sale' when 'licence' then 'licence' else 'enquiry' end,
       initcap(d.deal_type) || ' agreed — ' || d.currency || ' ' || d.amount::text || ' recorded.',
       d.agreed_at
  from public.artwork_deals d
 where d.artist_id = '00000000-0000-4000-8000-000000000001';

-- ── Claiming the library ─────────────────────────────────────────────────
-- Signing up in the app creates a second public.users row via the
-- on_auth_user_created trigger. This re-points every seeded row at that real
-- account and removes the placeholder, so RLS lets you see the library.
create or replace function public.claim_seed_artist(claim_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seed_id uuid := '00000000-0000-4000-8000-000000000001';
  real_id uuid;
begin
  select id into real_id
    from public.users
   where lower(email) = lower(claim_email)
     and auth_user_id is not null
   limit 1;

  if real_id is null then
    return format('No signed-up account found for %s. Sign up in the app first, then run this again.', claim_email);
  end if;

  if real_id = seed_id then
    return 'That account already owns the seeded library.';
  end if;

  update public.artworks               set artist_id   = real_id where artist_id   = seed_id;
  update public.artworks               set uploaded_by = real_id where uploaded_by = seed_id;
  update public.interest_entries       set artist_id   = real_id where artist_id   = seed_id;
  update public.artwork_deals          set artist_id   = real_id where artist_id   = seed_id;
  update public.opportunity_matches    set artist_id   = real_id where artist_id   = seed_id;
  update public.opportunity_applications
     set artist_id = real_id, approved_by = real_id                where artist_id = seed_id;
  update public.conversations          set artist_id   = real_id where artist_id   = seed_id;
  update public.messages               set sender_id   = real_id where sender_id   = seed_id;

  update public.users
     set display_name = coalesce(display_name, 'test'),
         role         = 'artist',
         country      = coalesce(country, 'Kuala Lumpur, Malaysia')
   where id = real_id;

  delete from public.users where id = seed_id;

  return format('Done. %s now owns the seeded library and is an artist.', claim_email);
end;
$$;

comment on function public.claim_seed_artist(text) is
  'Hands the 0016 seed library to a real signed-up account, by email.';
