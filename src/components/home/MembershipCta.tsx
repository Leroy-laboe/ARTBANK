import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { membershipPerks } from '../../data/homeContent';
import styles from './MembershipCta.module.css';

export function MembershipCta() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.left}>
            <h2>Join ARTBANK Membership</h2>
            <p>Unlock exclusive features, early access and member-only benefits.</p>
            <Button variant="gold" icon={<Icon name="arrow-right" size={16} />}>
              Get Started Now
            </Button>
          </div>

          <div className={styles.perks}>
            {membershipPerks.map((perk) => (
              <div className={styles.perk} key={perk.label}>
                <span className={styles.perkIcon}>
                  <Icon name={perk.icon} size={18} />
                </span>
                <span>{perk.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>Starting From</div>
            <div className={styles.priceValue}>
              RM 99 <span>/ year</span>
            </div>
            <div className={styles.priceSub}>Cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
