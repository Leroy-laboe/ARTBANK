import type { ArtworkDraft } from './artworkDraft';
import styles from './AdditionalOptionsCard.module.css';

type Option = {
  id: keyof ArtworkDraft;
  label: string;
  detail: string;
};

const options: Option[] = [
  {
    id: 'allowInternationalShipping',
    label: 'Allow international shipping',
    detail: 'Buyers from other countries can purchase this artwork.',
  },
  {
    id: 'includesCoa',
    label: 'Include a certificate of authenticity',
    detail: 'Buyers will receive a certificate with the artwork.',
  },
  {
    id: 'isPhysical',
    label: 'This is a physical artwork',
    detail: 'Uncheck if this is a digital artwork.',
  },
  {
    id: 'allowLayaway',
    label: 'Allow layaway',
    detail: 'Buyers can pay in instalments.',
  },
];

/** Step 3, part three: the listing's preferences. All four are booleans, so
 *  they sit together rather than being scattered through the form above. */
export function AdditionalOptionsCard({
  draft,
  onChange,
}: {
  draft: ArtworkDraft;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Additional Options</h2>
        <p className={styles.subtitle}>Set additional preferences for your listing.</p>
      </header>

      <div className={styles.grid}>
        {options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              type="checkbox"
              checked={Boolean(draft[option.id])}
              onChange={(e) => onChange({ [option.id]: e.target.checked } as Partial<ArtworkDraft>)}
            />
            <span className={styles.copy}>
              <span className={styles.label}>{option.label}</span>
              <span className={styles.detail}>{option.detail}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
