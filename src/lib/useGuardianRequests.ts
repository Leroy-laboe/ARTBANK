import { useEffect, useState } from 'react';
import { useSession } from './sessionContext';
import { getGuardianRequests } from '../services/guardian';

/** Whether the signed-in user has ever been named as somebody's guardian, and
 *  how many of those are still waiting on approval. Used to show the
 *  "Guardian requests" link in the account menu only to the handful of
 *  people who actually have one — everyone else sees nothing added. */
export function useGuardianRequestSummary(): { total: number; pending: number } {
  const { profile } = useSession();
  const [summary, setSummary] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    let active = true;
    if (!profile) {
      setSummary({ total: 0, pending: 0 });
      return;
    }
    getGuardianRequests(profile).then((rows) => {
      if (!active) return;
      setSummary({ total: rows.length, pending: rows.filter((r) => !r.verifiedAt).length });
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return summary;
}
