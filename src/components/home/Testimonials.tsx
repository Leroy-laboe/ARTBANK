import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { testimonialVideos } from '../../data/homeContent';
import { TestimonialVideoModal } from './TestimonialVideoModal';
import styles from './Testimonials.module.css';

export function Testimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <div className="container">
        <span className={styles.quoteMark}>
          <Icon name="quote" size={30} />
        </span>
        <p className={styles.quote}>
          &ldquo;ARTBANK is building the infrastructure for the future of creative value.&rdquo;
        </p>
        <p className={styles.attribution}>— Collectors &amp; Creators Worldwide</p>

        <div className={styles.avatars}>
          {testimonialVideos.slice(0, 3).map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.avatarBtn}
              onClick={() => setActiveVideo(t.videoUrl)}
              aria-label="Play testimonial video"
            >
              <img src={t.avatarUrl} alt="" loading="lazy" decoding="async" />
              <span className={styles.playIcon}>
                <Icon name="play" size={11} />
              </span>
            </button>
          ))}
          <span className={styles.more}>+</span>
          {testimonialVideos.slice(3, 7).map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.avatarBtn}
              onClick={() => setActiveVideo(t.videoUrl)}
              aria-label="Play testimonial video"
            >
              <img src={t.avatarUrl} alt="" loading="lazy" decoding="async" />
              <span className={styles.playIcon}>
                <Icon name="play" size={11} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <TestimonialVideoModal videoUrl={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  );
}
