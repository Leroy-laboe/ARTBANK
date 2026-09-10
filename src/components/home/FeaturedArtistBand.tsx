import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { featuredArtist } from '../../data/homeSections';
import styles from './FeaturedArtistBand.module.css';

const works = featuredArtist.works;

/** The four canvases hung around the portrait, in paint order.
 *
 *  `ahead` is how far along her collection that frame sits from the selected
 *  work, so advancing shuffles the whole wall forward by one — the hero
 *  canvas takes the work you picked, and the rest of the stack follows it.
 *  In the swipe layout the frames stop rotating and each holds one fixed
 *  work instead, because there the frames are the carousel. */
const frames = [
  { key: 'far', ahead: 2 },
  { key: 'near', ahead: 3 },
  { key: 'mid', ahead: 1 },
  { key: 'hero', ahead: 0 },
] as const;

/** How long each work holds before the wall moves on. Long enough for the
 *  cross-fade to land and the wall label to be read, short enough that the
 *  collection reads as moving rather than parked. */
const HOLD_MS = 3000;

export function FeaturedArtistBand() {
  const [active, setActive] = useState(0);
  const [swipe, setSwipe] = useState(false);
  // Held by anyone engaging with the band — hover, keyboard focus, a finger
  // on the carousel — so the rotation never moves the work out from under
  // someone who is actually looking at it.
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [stillWanted, setStillWanted] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  // Set while we're scrolling the row ourselves, so the scroll handler below
  // doesn't fight the arrows by re-deriving an index mid-animation.
  const scrollingSelf = useRef(false);

  // The wall becomes a scroller at the same width the stylesheet stacks the
  // band, and the frame-to-work mapping has to change with it.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const sync = () => setSwipe(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const select = useCallback(
    (index: number) => {
      setActive(index);

      const gallery = galleryRef.current;
      if (!swipe || !gallery) return;
      const frame = gallery.children[index] as HTMLElement | undefined;
      if (!frame) return;

      scrollingSelf.current = true;
      gallery.scrollTo({
        left: frame.offsetLeft - (gallery.clientWidth - frame.offsetWidth) / 2,
        behavior: 'smooth',
      });
      window.setTimeout(() => {
        scrollingSelf.current = false;
      }, 700);
    },
    [swipe],
  );

  const step = useCallback(
    (delta: number) => select((active + delta + works.length) % works.length),
    [active, select],
  );

  // Motion is opt-out at the OS level, and a wall that rotates on its own is
  // exactly what that setting is about.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStillWanted(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Nothing rotates while the band is off screen — there's no one to see it,
  // and on mobile it would leave the carousel parked somewhere the reader
  // didn't put it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // A timeout rather than an interval, re-armed off `active`: picking a work
  // by hand restarts the clock, so a deliberate choice always gets its full
  // hold instead of whatever was left of the previous one.
  useEffect(() => {
    if (held || !onScreen || !stillWanted) return;
    const timer = window.setTimeout(() => select((active + 1) % works.length), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [active, held, onScreen, stillWanted, select]);

  // Swipe → selected work. Nearest frame centre wins, which is where
  // scroll-snap is going to settle anyway.
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || !swipe) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (scrollingSelf.current) return;

        const middle = gallery.scrollLeft + gallery.clientWidth / 2;
        let nearest = 0;
        let shortest = Infinity;
        Array.from(gallery.children).forEach((child, index) => {
          const frame = child as HTMLElement;
          const distance = Math.abs(frame.offsetLeft + frame.offsetWidth / 2 - middle);
          if (distance < shortest) {
            shortest = distance;
            nearest = index;
          }
        });
        setActive(nearest);
      });
    };

    gallery.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      gallery.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [swipe]);

  return (
    <section
      ref={sectionRef}
      className={styles.band}
      // Mouse events rather than pointer events for the hover hold: a tap
      // fires pointerenter with no matching pointerleave, which would hold
      // the rotation for good on a touch screen.
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div className={styles.stage}>
        <span className={styles.wall} aria-hidden="true">
          {works.map((work, index) => (
            <span
              key={work.id}
              className={[styles.wallLayer, index === active && styles.wallOn]
                .filter(Boolean)
                .join(' ')}
              style={{ backgroundImage: `url(${work.imageUrl})` }}
            />
          ))}
        </span>

        <span className={styles.wordmark} aria-hidden="true">
          Artbank
        </span>

        <div
          className={styles.gallery}
          ref={galleryRef}
          // A finger on the carousel holds the rotation; letting go returns
          // it, and the swipe itself re-arms the clock through `active`.
          onTouchStart={() => setHeld(true)}
          onTouchEnd={() => setHeld(false)}
          onTouchCancel={() => setHeld(false)}
        >
          {frames.map((frame, slot) => {
            const shown = swipe ? slot : (active + frame.ahead) % works.length;
            const lit = swipe ? slot === active : frame.ahead === 0;
            const work = works[shown];

            return (
              <div
                key={frame.key}
                className={[styles.canvas, styles[frame.key], lit && styles.canvasLit]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Every work stays mounted in every frame so a change
                    cross-fades on the wall instead of blinking. */}
                {works.map((candidate, index) => (
                  <img
                    key={candidate.id}
                    src={candidate.imageUrl}
                    alt=""
                    loading="lazy"
                    className={[styles.canvasImg, index === shown && styles.canvasImgOn]
                      .filter(Boolean)
                      .join(' ')}
                  />
                ))}

                {/* The wall label, on the lit canvas only. */}
                <span className={styles.label}>
                  <span className={styles.labelTitle}>{work.title}</span>
                  <span className={styles.labelMeta}>
                    {work.medium} · {work.year}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Sinks the wall right where she stands, so she reads as lit and in
            front rather than as one more rectangle among the paintings. */}
        <span className={styles.spot} aria-hidden="true" />
        {/* The wrapper carries the drop shadow and the image carries the
            mask, in that order on purpose: a filter is applied before a mask,
            so a shadow on the image itself would be cast by its raw rectangle
            rather than by her masked silhouette. */}
        <span className={styles.portraitWrap}>
          <img className={styles.portrait} src={featuredArtist.imageUrl} alt="" loading="lazy" />
        </span>
        <span className={styles.veil} aria-hidden="true" />

        <p className={styles.explore} aria-hidden="true">
          <span className={styles.plus} />
          Explore
          <br />
          her work
        </p>
      </div>

      <div className={styles.copyCol}>
        {/* The story sits on the selected painting itself, dimmed right down
            — the ground shifts with the collection instead of being a flat
            block of colour. The scrim on top is what keeps the text legible,
            so it always paints over the image, never under it. */}
        <span className={styles.texture} aria-hidden="true">
          {works.map((work, index) => (
            <span
              key={work.id}
              className={[styles.textureLayer, index === active && styles.textureOn]
                .filter(Boolean)
                .join(' ')}
              style={{ backgroundImage: `url(${work.imageUrl})` }}
            />
          ))}
          <span className={styles.textureScrim} />
        </span>

        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>{featuredArtist.eyebrow}</p>
          <h2 className={styles.title}>
            {featuredArtist.titleLead}{' '}
            <span className={styles.titleAccent}>{featuredArtist.titleAccent}</span>
          </h2>
          <p className={styles.desc}>{featuredArtist.description}</p>

          <blockquote className={styles.quote}>“{featuredArtist.quote}”</blockquote>

          <p className={styles.meta}>{featuredArtist.meta}</p>

          <Link to="/artists" className={styles.cta}>
            {featuredArtist.cta}
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className={styles.rail}>
          <div className={styles.railTop}>
            <div
              className={styles.progress}
              style={{ '--i': active, '--n': works.length } as CSSProperties}
              aria-hidden="true"
            >
              <span className={styles.progressThumb} />
            </div>

            <div
              className={styles.thumbs}
              role="group"
              aria-label={`Works by ${featuredArtist.titleLead.split(' turns')[0]}`}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  step(1);
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  step(-1);
                }
              }}
            >
              {works.map((work, index) => (
                <button
                  key={work.id}
                  type="button"
                  className={[styles.thumb, index === active && styles.thumbActive]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={index === active}
                  onClick={() => select(index)}
                  onPointerEnter={(event) => {
                    // Hover selects, but only for a real cursor — on touch the
                    // tap would otherwise fire this and the click.
                    if (event.pointerType === 'mouse') select(index);
                  }}
                >
                  <img src={work.imageUrl} alt="" loading="lazy" />
                  <span className="visually-hidden">
                    {work.title} — {work.medium}, {work.year}, {work.dimensions}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => step(-1)}
              aria-label="Previous artwork"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => step(1)}
              aria-label="Next artwork"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
