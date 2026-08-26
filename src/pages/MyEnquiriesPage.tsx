import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { EnquiryList } from '../components/buyer/EnquiryList';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { listMyEnquiries } from '../services/buyer';
import { buyerEnquiries as demoEnquiries, type BuyerEnquiry } from '../data/buyerContent';
import styles from './MyEnquiriesPage.module.css';

/** My Enquiries — every Buyer Intent Card this account has filed.
 *
 *  These are the same interest_entries rows the artist's Interest Ledger
 *  reads, so what a buyer sees here and what the artist received are one
 *  record, not two copies. Status is derived from the artist's own pipeline
 *  stage plus whether they have actually replied — nothing on this screen can
 *  claim progress the artist has not made. */
export function MyEnquiriesPage() {
  const { profile } = useSession();

  const [enquiries, setEnquiries] = useState<BuyerEnquiry[]>(demoEnquiries);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMyEnquiries(profile).then((result) => {
      if (!active) return;
      setEnquiries(result.enquiries);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const counts = useMemo(
    () => ({
      all: enquiries.length,
      awaiting: enquiries.filter((e) => e.status === 'Awaiting Response').length,
      talking: enquiries.filter((e) => e.status === 'In Conversation').length,
      room: enquiries.filter((e) => e.status === 'Viewing Room').length,
      closed: enquiries.filter((e) => e.status === 'Closed').length,
    }),
    [enquiries],
  );

  const visible = useMemo(() => {
    if (tab === 'awaiting') return enquiries.filter((e) => e.status === 'Awaiting Response');
    if (tab === 'talking') return enquiries.filter((e) => e.status === 'In Conversation');
    if (tab === 'room') return enquiries.filter((e) => e.status === 'Viewing Room');
    if (tab === 'closed') return enquiries.filter((e) => e.status === 'Closed');
    return enquiries;
  }, [enquiries, tab]);

  // Viewing Room only earns a tab once one has been asked for — an empty
  // filter is a dead control.
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'awaiting', label: 'Awaiting Response', count: counts.awaiting },
    { id: 'talking', label: 'In Conversation', count: counts.talking },
    ...(counts.room > 0 ? [{ id: 'room', label: 'Viewing Room', count: counts.room }] : []),
    { id: 'closed', label: 'Closed', count: counts.closed },
  ];

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader
        title="My Enquiries"
        subtitle="Track your enquiries and conversations with artists."
      />

      <div className={styles.tabRow}>
        <ArtspaceTabs
          tabs={tabs}
          active={tab}
          onChange={setTab}
          variant="underline"
          label="Filter enquiries"
        />
      </div>

      {isDemo && !loading && (
        <p className={styles.demoNote}>
          <Icon name="info" size={14} />
          Sample enquiries. Anything you send from an artwork page appears here instead.
        </p>
      )}

      {loading ? (
        <p className={styles.state}>Loading your enquiries…</p>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="mail" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            {tab === 'all' ? 'No enquiries yet' : 'Nothing in this filter'}
          </p>
          <p className={styles.emptyNote}>
            Ask about a work and it appears here, along with the artist’s reply.
          </p>
          <Link to="/collect" className={styles.emptyLink}>
            Browse artworks
          </Link>
        </div>
      ) : (
        <EnquiryList enquiries={visible} />
      )}
    </BuyerShell>
  );
}
