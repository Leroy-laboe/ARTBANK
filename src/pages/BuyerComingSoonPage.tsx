import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { WorkspaceComingSoon } from '../components/ui/WorkspaceComingSoon';

/** Placeholder for a /collect nav destination that isn't built yet (Help
 *  Center). Keeps the buyer sidebar and topbar in place — see
 *  WorkspaceComingSoon for why that matters. */
export function BuyerComingSoonPage({ title }: { title: string }) {
  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader title={title} />
      <WorkspaceComingSoon title={title} />
    </BuyerShell>
  );
}
