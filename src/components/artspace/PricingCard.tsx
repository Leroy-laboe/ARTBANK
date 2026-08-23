import { Icon } from '../ui/Icon';
import { currencies, priceTypes, type PriceType } from '../../data/artspaceAddArtwork';
import type { ArtworkDraft, DraftErrors } from './artworkDraft';
import styles from './PricingCard.module.css';

/** Step 3, part one: what the artwork costs.
 *
 *  Note this reintroduces upfront pricing, which migration 0011 had removed —
 *  see the header of 0019_pricing_and_shipping.sql for why. A listed price is
 *  still not an earning: recorded earnings come only from artwork_deals. */
export function PricingCard({
  draft,
  errors,
  onChange,
}: {
  draft: ArtworkDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  const onRequest = draft.priceType === 'on_request';
  const isRange = draft.priceType === 'range';

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Pricing</h2>
        <p className={styles.subtitle}>Set the price for your artwork. You can update this later.</p>
      </header>

      <div className={styles.grid}>
        <fieldset className={styles.field}>
          <legend className={styles.label}>
            Price Type
            <Icon name="info" size={13} className={styles.labelIcon} />
          </legend>

          <div className={styles.radios}>
            {priceTypes.map((type) => (
              <label className={styles.radio} key={type.id}>
                <input
                  type="radio"
                  name="priceType"
                  checked={draft.priceType === type.id}
                  onChange={() => onChange({ priceType: type.id as PriceType })}
                />
                <span className={styles.radioCopy}>
                  <span className={styles.radioLabel}>{type.label}</span>
                  <span className={styles.radioDetail}>{type.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          {onRequest ? (
            <p className={styles.onRequest}>
              <Icon name="info" size={15} className={styles.onRequestIcon} />
              No price is shown. Buyers contact you and the figure is agreed in the conversation.
            </p>
          ) : (
            <>
              <label className={styles.label} htmlFor="price">
                {isRange ? 'Minimum Price' : `Price (${draft.currency})`}
                <span className={styles.required}>*</span>
              </label>

              <div className={styles.moneyRow}>
                <span className={styles.currencyWrap}>
                  <select
                    className={styles.currency}
                    value={draft.currency}
                    onChange={(e) => onChange({ currency: e.target.value })}
                    aria-label="Currency"
                  >
                    {currencies.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </span>
                <input
                  id="price"
                  className={[styles.money, errors.price && styles.invalid].filter(Boolean).join(' ')}
                  inputMode="decimal"
                  placeholder="1,200.00"
                  value={draft.price}
                  onChange={(e) => onChange({ price: e.target.value })}
                />
              </div>
              {errors.price && <p className={styles.error}>{errors.price}</p>}

              {isRange && (
                <div className={styles.stacked}>
                  <label className={styles.label} htmlFor="priceMax">
                    Maximum Price<span className={styles.required}>*</span>
                  </label>
                  <div className={styles.moneyRow}>
                    <span className={styles.currencyWrap}>
                      <span className={styles.currencyStatic}>{draft.currency}</span>
                    </span>
                    <input
                      id="priceMax"
                      className={[styles.money, errors.priceMax && styles.invalid]
                        .filter(Boolean)
                        .join(' ')}
                      inputMode="decimal"
                      placeholder="2,500.00"
                      value={draft.priceMax}
                      onChange={(e) => onChange({ priceMax: e.target.value })}
                    />
                  </div>
                  {errors.priceMax && <p className={styles.error}>{errors.priceMax}</p>}
                </div>
              )}

              <div className={styles.stacked}>
                <label className={styles.label} htmlFor="compareAt">
                  Compare at Price (Optional)
                </label>
                <div className={styles.moneyRow}>
                  <span className={styles.currencyWrap}>
                    <span className={styles.currencyStatic}>{draft.currency}</span>
                  </span>
                  <input
                    id="compareAt"
                    className={[styles.money, errors.compareAtPrice && styles.invalid]
                      .filter(Boolean)
                      .join(' ')}
                    inputMode="decimal"
                    placeholder="1,500.00"
                    value={draft.compareAtPrice}
                    onChange={(e) => onChange({ compareAtPrice: e.target.value })}
                  />
                </div>
                {errors.compareAtPrice ? (
                  <p className={styles.error}>{errors.compareAtPrice}</p>
                ) : (
                  <p className={styles.hint}>A higher price crossed out on your listing.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
