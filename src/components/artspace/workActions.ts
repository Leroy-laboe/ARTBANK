import type { IconName } from '../ui/Icon';
import type { RowMenuItem } from './RowMenu';
import type { Work } from '../../data/artspaceWorks';

/** Everything an artist can trigger on a single artwork, from anywhere it
 *  appears — the table row menu, the grid card, or the Passport cell.
 *
 *  Kept in its own module so the table and grid can share the vocabulary
 *  without importing each other. */
export type WorkAction =
  | 'view'
  | 'edit'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'share'
  | 'passport';

/** The same actions in the same order wherever an artwork appears — the table
 *  row menu and the grid card both build from this. */
export function buildWorkMenu(
  work: Work,
  onAction: (work: Work, action: WorkAction) => void,
): RowMenuItem[] {
  const published = work.status === 'Published';
  return [
    { id: 'view', label: 'View record', icon: 'eye', onSelect: () => onAction(work, 'view') },
    { id: 'edit', label: 'Edit details', icon: 'pencil', onSelect: () => onAction(work, 'edit') },
    {
      id: 'publish',
      label: published ? 'Unpublish' : 'Publish',
      icon: (published ? 'eye-off' : 'upload') as IconName,
      onSelect: () => onAction(work, published ? 'unpublish' : 'publish'),
    },
    { id: 'share', label: 'Copy share link', icon: 'copy', onSelect: () => onAction(work, 'share') },
    {
      id: 'archive',
      label: 'Archive',
      icon: 'archive',
      destructive: true,
      onSelect: () => onAction(work, 'archive'),
    },
  ];
}
