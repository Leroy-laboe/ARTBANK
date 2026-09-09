-- 0031 — A verified guardian can see the minor's account, not just approve
-- contact into it.
--
-- Deliberately one narrow security-definer function rather than new SELECT
-- policies on artworks/artwork_deals/interest_entries directly. A policy
-- would let a guardian pull those tables straight through the REST API,
-- which would hand them buyer names and messages from interest_entries —
-- identities a buyer disclosed to the artist specifically, not to a second
-- person. This function returns artworks in full (the minor's own work, no
-- third party involved) and interest/earnings as counts and settled totals
-- only, never a name attached. Messages stay exactly as they are: visible
-- only on the specific conversations guardian_cc_id already attaches the
-- guardian to.
--
-- Safe to re-run.

create or replace function public.guardian_view_minor(p_minor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me     uuid := public.current_user_id();
  result jsonb;
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  if not exists (
    select 1 from public.guardian_links g
     where g.minor_user_id = p_minor_id
       and g.guardian_user_id = me
       and g.verified_at is not null
  ) then
    raise exception 'not_authorized';
  end if;

  select jsonb_build_object(
    'minorName', coalesce(nullif(u.artist_name, ''), nullif(u.display_name, ''), u.email),
    'memberSince', u.created_at,

    'artworks', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'imageUrl', coalesce(
              (select ai.url from public.artwork_images ai
                where ai.artwork_id = a.id
                order by ai.is_primary desc
                limit 1),
              a.image_url
            ),
            'medium', a.medium,
            'year', a.year,
            'status', a.status,
            'availability', a.availability
          )
          order by a.updated_at desc nulls last, a.created_at desc
        )
        from public.artworks a
        where a.artist_id = p_minor_id or a.uploaded_by = p_minor_id
      ),
      '[]'::jsonb
    ),

    -- Settled only, grouped by currency rather than blended into one
    -- number — the same rule the artist's own dashboard follows.
    'earnings', coalesce(
      (
        select jsonb_agg(jsonb_build_object('currency', d.currency, 'total', d.total, 'count', d.cnt))
        from (
          select currency, sum(amount) as total, count(*) as cnt
            from public.artwork_deals
           where artist_id = p_minor_id
             and status in ('agreed', 'paid')
           group by currency
        ) d
      ),
      '[]'::jsonb
    ),

    'identifiedEnquiries', (
      select count(*) from public.interest_entries
       where artist_id = p_minor_id and is_identified = true
    ),
    'anonymousViews', (
      select count(*) from public.interest_entries
       where artist_id = p_minor_id and is_identified = false
    ),
    'opportunityMatches', (
      select count(*) from public.opportunity_matches where artist_id = p_minor_id
    )
  )
  into result
  from public.users u
  where u.id = p_minor_id;

  return result;
end;
$$;

grant execute on function public.guardian_view_minor(uuid) to authenticated;
