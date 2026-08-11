import { Icon } from '../ui/Icon';
import styles from './TestimonialVideoModal.module.css';

export function TestimonialVideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close video">
          <Icon name="plus" size={18} />
        </button>
        <video src={videoUrl} controls autoPlay className={styles.video} />
      </div>
    </div>
  );
}
