// Content for ArtSpace → Public Profile.
//
// This is the one profile editor (docs/pivot-checklist/16-public-profile-access.md
// consolidates the previously scattered edit controls into a single screen).
//
// Nothing private may leak here: no readiness score, no earnings, no interest
// or enquiry data. The spec deletes public earnings and statistics outright,
// so only portfolio credentials belong on the public side.

import type { IconName } from '../components/ui/Icon';

/* ── Tabs ── */

export const profileTabs = [
  { id: 'details', label: 'Profile Details' },
  { id: 'statement', label: 'Artist Statement' },
  { id: 'featured', label: 'Featured Artworks' },
  { id: 'settings', label: 'Profile Settings' },
  { id: 'social', label: 'Social Links' },
];

/* ── Profile Details ──────────────────────────────────────────────────────
 * Option lists and copy only. The sample identity that used to live here
 * ("Maya Tan" and her details) is deliberately gone: it was being rendered as
 * the default value of a real account's form, which is how it once got saved
 * into somebody's profile. Every field now reads the signed-in profile, and
 * blanks stay blank. */

export const profileDetails = {
  photoHint: 'JPG, PNG or WebP. Max 5MB.',
  nationalities: ['Malaysian', 'Singaporean', 'Indonesian', 'Thai', 'Filipino', 'Other'],
};

/* ── Professional Information ── */

/** The medium list to choose from. What the artist actually practises lives on
 *  their profile row, not here. */
export const professionalInfo = {
  mediumOptions: [
    'Acrylic Painting',
    'Mixed Media',
    'Oil on Canvas',
    'Charcoal',
    'Photography',
    'Sculpture',
    'Printmaking',
    'Digital',
  ],
};

/* ── Profile Completion, preview and visibility ───────────────────────────
 * All three were fixed sample values — 80% complete over a checklist showing
 * three of five, a preview of another artist, and toggles that reset on
 * reload. They are computed from the profile now, in ProfileCompletionCard,
 * ProfilePreviewPanel and the users columns added in migration 0021. */

/* ── Tips ── */

export const profileTips: { id: string; icon: IconName; title: string; detail: string }[] = [
  {
    id: 'statement',
    icon: 'check-circle',
    title: 'Add a strong artist statement',
    detail: 'Helps people understand your practice',
  },
  {
    id: 'featured',
    icon: 'check-circle',
    title: 'Feature your best artworks',
    detail: 'Quality over quantity',
  },
  {
    id: 'updated',
    icon: 'check-circle',
    title: 'Keep your profile updated',
    detail: 'Active profiles get more visibility',
  },
];

/* ── Social links ────────────────────────────────────────────────────────
 * Spec 16 reorders the public profile: Contact first, Follow second, social
 * links third. These are that third rank — they no longer dominate the page. */

export const socialPlatforms: { id: string; label: string; icon: IconName; placeholder: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram', placeholder: 'instagram.com/yourname' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', placeholder: 'facebook.com/yourpage' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', placeholder: 'youtube.com/@yourname' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', placeholder: 'linkedin.com/in/yourname' },
];

/* ── Artist statement ── */

export const statementGuidance = {
  hint: 'What you make, why you make it, and what a viewer should look for.',
  limit: 2000,
};

/* ── Profile settings ── */

export const visibilityLevels: { id: 'public' | 'members' | 'private'; label: string; detail: string }[] = [
  {
    id: 'public',
    label: 'Public',
    detail: 'Anyone can find and view your profile.',
  },
  {
    id: 'members',
    label: 'ARTBANK members only',
    detail: 'Signed-in members can view it. It stays out of search.',
  },
  {
    id: 'private',
    label: 'Private',
    detail: 'Only you can see it. Your public URL returns nothing.',
  },
];
