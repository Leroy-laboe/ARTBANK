import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from './sessionContext';
import { setArtworkSaved } from '../services/buyer';
import type { BuyerArtwork } from '../data/buyerContent';

/** Saving a work, from any buyer screen that shows one.
 *
 *  The update is optimistic and reverted on failure. That is the right trade
 *  for a save list: the button is pressed constantly while browsing, a round
 *  trip before the heart fills would feel broken, and getting it wrong costs
 *  a single row that the next page load corrects.
 *
 *  `apply` is how the calling screen writes the change into whatever list it
 *  holds — Discover keeps a feed, Saved Works keeps a shelf it removes from,
 *  and the artwork page keeps one record. */
export function useSaveToggle(apply: (artworkId: string, saved: boolean) => void) {
  const { profile } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // One live timer, cleared on unmount — two saves in quick succession must
  // not leave the first one's timeout to blank the second one's message.
  const say = useCallback((message: string) => {
    window.clearTimeout(timer.current);
    setNotice(message);
    timer.current = window.setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = useCallback(
    async (artwork: BuyerArtwork) => {
      if (!profile) {
        say('Sign in to save works. Your save list belongs to your account.');
        return;
      }

      const next = !artwork.saved;
      setBusyId(artwork.id);
      apply(artwork.id, next);

      try {
        await setArtworkSaved(profile, artwork.id, next);
      } catch {
        apply(artwork.id, !next);
        say('Could not update your saved works. Try again.');
      } finally {
        setBusyId(null);
      }
    },
    [apply, profile, say],
  );

  return { toggle, busyId, notice };
}
