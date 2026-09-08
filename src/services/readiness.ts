import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** The Artwork Readiness Scan and Artwork Action Plan —
 *  docs/pivot-checklist's "Practical features worth adding now" #1 and #5.
 *  "Replace percentages without explanation" with four named, cumulative
 *  states, and give every artwork one concrete next step instead of a score. */

export type ReadinessState = 'Documented' | 'Presentable' | 'Trust-Ready' | 'Commercially Ready';

export type ArtworkReadiness = {
  artworkId: string;
  title: string;
  state: ReadinessState;
  /** The single next step — never more than one, per the brief: "every
   *  artwork should have one recommended action." */
  recommendedAction: string;
};

type Row = {
  id: string;
  title: string;
  status: string;
  dimensions: string | null;
  description: string | null;
  ownership_statement: string | null;
  permitted_uses: string[] | null;
  rights_note: string | null;
  image_url: string | null;
  artwork_images: { id: string }[] | null;
  artwork_evidence_files: { id: string }[] | null;
};

const SELECT = `
  id, title, status, dimensions, description, ownership_statement, permitted_uses, rights_note,
  image_url, artwork_images(id), artwork_evidence_files(id)
`;

function hasText(value: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

/** One row's state and its single next step. Each state is a checkpoint, not
 *  an independent item — Commercially Ready implies the other three passed. */
function assess(row: Row): ArtworkReadiness {
  const hasImage = (row.artwork_images?.length ?? 0) > 0 || hasText(row.image_url);
  const hasEvidence = (row.artwork_evidence_files?.length ?? 0) > 0;
  const hasRights = (row.permitted_uses?.length ?? 0) > 0 || hasText(row.rights_note);
  const hasOwnership = hasText(row.ownership_statement);
  const hasDimensions = hasText(row.dimensions);
  const hasDescription = hasText(row.description);
  const published = row.status === 'published';

  if (!hasDimensions) {
    return { artworkId: row.id, title: row.title, state: 'Documented', recommendedAction: 'Add dimensions' };
  }
  if (!hasImage || !hasDescription) {
    return {
      artworkId: row.id,
      title: row.title,
      state: 'Documented',
      recommendedAction: !hasImage ? 'Add a photograph' : 'Improve artwork story',
    };
  }
  if (!hasOwnership || !hasEvidence) {
    return {
      artworkId: row.id,
      title: row.title,
      state: 'Presentable',
      recommendedAction: !hasOwnership ? 'Add ownership statement' : 'Add supporting evidence',
    };
  }
  if (!hasRights || !published) {
    return {
      artworkId: row.id,
      title: row.title,
      state: 'Trust-Ready',
      recommendedAction: !hasRights ? 'Confirm available rights' : 'Publish this record',
    };
  }

  return {
    artworkId: row.id,
    title: row.title,
    state: 'Commercially Ready',
    recommendedAction: 'Share through Smart Artwork Link',
  };
}

/** Every work this artist has, assessed. Empty (not demo content) when they
 *  genuinely have none yet — the empty state is the invitation to add one. */
export async function listArtworkReadiness(profile: Profile | null): Promise<ArtworkReadiness[]> {
  if (!supabase || !profile) return [];

  const { data, error } = await supabase
    .from('artworks')
    .select(SELECT)
    .or(`artist_id.eq.${profile.id},uploaded_by.eq.${profile.id}`)
    .order('updated_at', { ascending: false });

  if (error || !data) return [];

  return (data as unknown as Row[]).map(assess);
}
