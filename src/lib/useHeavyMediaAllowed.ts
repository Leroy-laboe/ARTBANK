import { useEffect, useState } from 'react';

/** Network Information API — still unprefixed-experimental, so it isn't in
 *  lib.dom. Only the two fields we act on are declared. */
type Connection = {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

function readConnection(): Connection | undefined {
  return (navigator as Navigator & { connection?: Connection }).connection;
}

/** Whether it's reasonable to pull a large decorative asset right now.
 *
 *  Says no when the visitor has asked for reduced motion, has Data Saver on,
 *  or is on a connection the browser reports as 3g or worse. Everything this
 *  guards is ornament — a background loop behind a sign-in form — so the
 *  honest default on a constrained connection is to skip it entirely rather
 *  than make someone wait for decoration.
 *
 *  Starts false and flips true after mount on purpose: the first paint should
 *  never be the one that queues a multi-megabyte download. */
export function useHeavyMediaAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const connection = readConnection();
      const slowLink =
        connection?.effectiveType === 'slow-2g' ||
        connection?.effectiveType === '2g' ||
        connection?.effectiveType === '3g';

      setAllowed(!reducedMotion && !connection?.saveData && !slowLink);
    };

    evaluate();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', evaluate);
    const connection = readConnection();
    connection?.addEventListener?.('change', evaluate);

    return () => {
      motionQuery.removeEventListener('change', evaluate);
      connection?.removeEventListener?.('change', evaluate);
    };
  }, []);

  return allowed;
}
