import type { IconName } from '../ui/Icon';
import type { RowMenuItem } from './RowMenu';
import { canDelete } from '../../services/artwork';
import type { Work, WorkAvailability, WorkVisibility } from '../../data/artspaceWorks';

/** Everything an artist can trigger on a single artwork, from anywhere it
 *  appears — the table row menu, the grid card, or the Passport cell.
 *
 *  Kept in its own module so the table and grid can share the vocabulary
 *  without importing each other.
 *
 *  Availability and visibility carry a value rather than getting one constant
 *  per option ('mark-sold', 'mark-reserved', …), which would need a new action
 *  and a new switch arm every time the enum grows. */
export type WorkAction =
  | 'view'
  | 'edit'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'restore'
  | 'delete'
  | 'share'
  | 'passport'
  | { kind: 'availability'; value: WorkAvailability }
  | { kind: 'visibility'; value: WorkVisibility };

/** The five availabilities the table can display. `licensing_available` is
 *  handled in Add Artwork only — see setArtworkAvailability's note. */
const availabilities: { value: WorkAvailability; icon: IconName }[] = [
  { value: 'Available', icon: 'check-circle' },
  { value: 'On View', icon: 'eye' },
  { value: 'Reserved', icon: 'clock' },
  { value: 'Sold', icon: 'handshake' },
  { value: 'Unavailable', icon: 'x-circle' },
];

const visibilities: { value: WorkVisibility; label: string; icon: IconName }[] = [
  { value: 'public', label: 'Public', icon: 'globe' },
  { value: 'unlisted', label: 'Unlisted — link only', icon: 'external-link' },
  { value: 'private', label: 'Private', icon: 'lock' },
];

/** The same actions in the same order wherever an artwork appears — the table
 *  row menu and the grid card both build from this. */
export function buildWorkMenu(
  work: Work,
  onAction: (work: Work, action: WorkAction) => void,
): RowMenuItem[] {
  const published = work.status === 'Published';
  const archived = work.status === 'Archived';

  return [
    { id: 'view', label: 'View record', icon: 'eye', onSelect: () => onAction(work, 'view') },
    { id: 'edit', label: 'Edit details', icon: 'pencil', onSelect: () => onAction(work, 'edit') },
    { id: 'share', label: 'Copy share link', icon: 'copy', onSelect: () => onAction(work, 'share') },

    // Availability is the day-to-day one: a work gets reserved, shown, sold.
    { kind: 'heading', id: 'h-availability', label: 'Availability' },
    ...availabilities.map((option) => ({
      id: `availability-${option.value}`,
      label: option.value,
      icon: option.icon,
      checked: work.availability === option.value,
      onSelect: () => onAction(work, { kind: 'availability', value: option.value }),
    })),

    { kind: 'heading', id: 'h-visibility', label: 'Visibility' },
    ...visibilities.map((option) => ({
      id: `visibility-${option.value}`,
      label: option.label,
      icon: option.icon,
      checked: work.visibility === option.value,
      onSelect: () => onAction(work, { kind: 'visibility', value: option.value }),
    })),

    { kind: 'heading', id: 'h-record', label: 'Record' },
    {
      id: 'publish',
      label: published ? 'Unpublish' : 'Publish',
      icon: (published ? 'eye-off' : 'upload') as IconName,
      onSelect: () => onAction(work, published ? 'unpublish' : 'publish'),
    },
    archived
      ? {
          id: 'restore',
          label: 'Restore from archive',
          icon: 'refresh' as IconName,
          onSelect: () => onAction(work, 'restore'),
        }
      : {
          id: 'archive',
          label: 'Archive',
          icon: 'archive' as IconName,
          onSelect: () => onAction(work, 'archive'),
        },

    // Offered only while nothing has been recorded against the work. Anything
    // with interest, opportunities or earnings gets archived instead — see
    // canDelete. This keeps a mistaken draft removable without making
    // provenance erasable.
    ...(canDelete(work)
      ? [
          {
            id: 'delete',
            label: 'Delete record',
            icon: 'trash' as IconName,
            destructive: true,
            onSelect: () => onAction(work, 'delete'),
          },
        ]
      : []),
  ];
}
