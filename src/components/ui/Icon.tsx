import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'bag'
  | 'chevron-right'
  | 'chevron-down'
  | 'shield-check'
  | 'play'
  | 'heart'
  | 'heart-filled'
  | 'globe'
  | 'user'
  | 'image'
  | 'layers'
  | 'graduation-cap'
  | 'crown'
  | 'clock'
  | 'check-circle'
  | 'arrow-right'
  | 'plus'
  | 'mail'
  | 'instagram'
  | 'facebook'
  | 'x-twitter'
  | 'youtube'
  | 'linkedin'
  | 'quote'
  | 'grid-dots'
  | 'list'
  | 'sliders'
  | 'brush'
  | 'cube'
  | 'camera'
  | 'monitor'
  | 'pencil'
  | 'stack'
  | 'headset'
  | 'credit-card'
  | 'trend-up'
  | 'minus'
  | 'refresh'
  | 'users'
  | 'palette'
  | 'bookmark'
  | 'award'
  | 'star'
  | 'building'
  | 'eye'
  | 'eye-off'
  | 'briefcase'
  | 'upload'
  | 'sparkles'
  | 'close'
  | 'lock';

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.4" y2="16.4" />
    </>
  ),
  bag: (
    <>
      <path d="M6.5 8h11l1 12.5h-13z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  'chevron-right': <polyline points="9 6 15 12 9 18" />,
  'chevron-down': <polyline points="6 9 12 15 18 9" />,
  'shield-check': (
    <>
      <path d="M12 3.2 19 6v5.5c0 4.6-3 7.7-7 8.8-4-1.1-7-4.2-7-8.8V6l7-2.8z" />
      <polyline points="9 12 11 14 15 9.5" />
    </>
  ),
  play: <polygon points="9 6 19 12 9 18" />,
  heart: (
    <path d="M12 20.2S3.8 15.3 3.8 9.4a4.6 4.6 0 0 1 8.2-2.8 4.6 4.6 0 0 1 8.2 2.8c0 5.9-8.2 10.8-8.2 10.8z" />
  ),
  'heart-filled': (
    <path
      d="M12 20.2S3.8 15.3 3.8 9.4a4.6 4.6 0 0 1 8.2-2.8 4.6 4.6 0 0 1 8.2 2.8c0 5.9-8.2 10.8-8.2 10.8z"
      fill="currentColor"
      stroke="none"
    />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="3.6" ry="8.5" />
      <line x1="3.7" y1="9.5" x2="20.3" y2="9.5" />
      <line x1="3.7" y1="14.5" x2="20.3" y2="14.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.5 20c0-4 3.5-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4.5 16.5 9 12l3 3 4-4.5 3.5 5" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 3.5 20.5 8 12 12.5 3.5 8" />
      <polyline points="3.5 13 12 17.5 20.5 13" />
      <polyline points="3.5 18 12 22.5 20.5 18" />
    </>
  ),
  'graduation-cap': (
    <>
      <polygon points="12 4 21.5 8.5 12 13 2.5 8.5" />
      <path d="M7 10.7v4.4c0 1.6 2.2 2.9 5 2.9s5-1.3 5-2.9v-4.4" />
      <line x1="21.5" y1="8.5" x2="21.5" y2="15" />
    </>
  ),
  crown: (
    <>
      <path d="M4 18.5h16l-1.3-8-4 3.2L12 8l-2.7 5.7-4-3.2z" />
      <line x1="4" y1="20.5" x2="20" y2="20.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="12 7.5 12 12 15.3 14" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="8.3 12.3 10.8 14.8 15.8 9.5" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13.5 6 19 12 13.5 18" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <polyline points="4 6.5 12 12.5 20 6.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.5 21v-7.6h2.6l.4-3h-3V8.4c0-.9.3-1.5 1.6-1.5h1.5V4.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.5H9v3h2.7V21z" />
  ),
  'x-twitter': (
    <path d="M4.5 4.5 19.5 19.5 M19.5 4.5 4.5 19.5" />
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <polygon points="10.5 9.3 15.5 12 10.5 14.7" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <line x1="7.5" y1="10" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.3" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
      <line x1="12" y1="16.5" x2="12" y2="12.5" />
      <path d="M12 13.3c0-1.5 1.1-2.3 2.3-2.3 1.4 0 2.2.9 2.2 2.6v3" />
    </>
  ),
  quote: (
    <path d="M8.5 9.5C6 9.5 4.5 11.5 4.5 14s1.5 4.5 4 4.5v-9zm9 0c-2.5 0-4 2-4 4.5s1.5 4.5 4 4.5v-9z" fill="currentColor" stroke="none" />
  ),
  'grid-dots': (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.3" fill="currentColor" stroke="none" />
      <rect x="13" y="4" width="7" height="7" rx="1.3" fill="currentColor" stroke="none" />
      <rect x="4" y="13" width="7" height="7" rx="1.3" fill="currentColor" stroke="none" />
      <rect x="13" y="13" width="7" height="7" rx="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  list: (
    <>
      <line x1="9" y1="6.5" x2="20.5" y2="6.5" />
      <line x1="9" y1="12" x2="20.5" y2="12" />
      <line x1="9" y1="17.5" x2="20.5" y2="17.5" />
      <line x1="3.7" y1="6.5" x2="3.71" y2="6.5" />
      <line x1="3.7" y1="12" x2="3.71" y2="12" />
      <line x1="3.7" y1="17.5" x2="3.71" y2="17.5" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="var(--surface, #fff)" />
      <circle cx="16" cy="12" r="2" fill="var(--surface, #fff)" />
      <circle cx="10" cy="18" r="2" fill="var(--surface, #fff)" />
    </>
  ),
  brush: (
    <>
      <path d="M15.5 3.5c2 0 4 2 4 4-2.5 1.5-4.2 3.6-6.5 6.4l-3.4-3.4c2.8-2.3 4.9-4 6-6.5" fill="none" />
      <path d="M9.6 10.5 6.2 13.4c-1.1 1-1.8 2.6-1.7 4.3-1.6-.2-2.5-.7-2.5-.7s.5 3.4 4 4c3.4.6 6-1.7 6-4.3 0-1.7-.7-3-1.7-4z" />
    </>
  ),
  cube: (
    <>
      <polygon points="12 3.5 20 8 20 16 12 20.5 4 16 4 8" />
      <polyline points="4 8 12 12.3 20 8" />
      <line x1="12" y1="12.3" x2="12" y2="20.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.4-2.2h7.2L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </>
  ),
  monitor: (
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.6" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16.5" x2="12" y2="20" />
    </>
  ),
  pencil: (
    <>
      <path d="M15 4.5 19.5 9 8.5 20H4v-4.5z" />
      <line x1="13" y1="6.5" x2="17.5" y2="11" />
    </>
  ),
  stack: (
    <>
      <polygon points="12 3.5 20.5 8 12 12.5 3.5 8" />
      <polyline points="6.5 9.8 3.5 11.3 12 15.8 20.5 11.3 17.5 9.8" />
      <polyline points="6.5 13.8 3.5 15.3 12 19.8 20.5 15.3 17.5 13.8" />
    </>
  ),
  headset: (
    <>
      <path d="M4.5 13.5v-1.8a7.5 7.5 0 0 1 15 0v1.8" />
      <rect x="3" y="13" width="3.2" height="5" rx="1.2" />
      <rect x="17.8" y="13" width="3.2" height="5" rx="1.2" />
      <path d="M17.8 18v.8a2.7 2.7 0 0 1-2.7 2.7h-2.4" />
    </>
  ),
  'credit-card': (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <line x1="3" y1="9.7" x2="21" y2="9.7" />
      <line x1="6" y1="14.5" x2="10" y2="14.5" />
    </>
  ),
  'trend-up': (
    <>
      <polyline points="3.5 16.5 9.5 10.5 13.5 14.5 20.5 7" />
      <polyline points="15 7 20.5 7 20.5 12.5" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" />
      <polyline points="20 4 20 8.5 15.5 8.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" />
      <polyline points="4 20 4 15.5 8.5 15.5" />
    </>
  ),
  users: (
    <>
      <circle cx="8.5" cy="8.2" r="3.2" />
      <path d="M2.8 19c0-3.3 2.8-5.4 5.7-5.4S14.2 15.7 14.2 19" />
      <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6.2" />
      <path d="M17 13.7c2.5.4 4.2 2.3 4.2 5.3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8.1 0 3.6 2.9 5.4 5.2 5.4.9 0 1.3-.5 1.3-1.1 0-.5-.3-.8-.3-1.4 0-1 .9-1.8 2.1-1.8h2.3c2.6 0 4.9-1.7 4.9-4.9 0-2.9-3.1-4.3-7-4.3z" />
      <circle cx="7.8" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.3" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="7.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bookmark: <path d="M6.5 4h11v16l-5.5-4-5.5 4z" />,
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.8 7 20.5l5-2.7 5 2.7-1.5-6.7" />
    </>
  ),
  star: (
    <polygon points="12 3.5 14.6 9.6 21.2 10.2 16.3 14.6 17.7 21.1 12 17.7 6.3 21.1 7.7 14.6 2.8 10.2 9.4 9.6" />
  ),
  building: (
    <>
      <polyline points="4 9.5 12 4 20 9.5" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="5.5" y1="9.5" x2="5.5" y2="18.5" />
      <line x1="9.7" y1="9.5" x2="9.7" y2="18.5" />
      <line x1="14.3" y1="9.5" x2="14.3" y2="18.5" />
      <line x1="18.5" y1="9.5" x2="18.5" y2="18.5" />
      <line x1="3.2" y1="18.5" x2="20.8" y2="18.5" />
      <line x1="2.5" y1="21" x2="21.5" y2="21" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6.3 5 12 5s9.5 7 9.5 7-3.8 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z" />
    </>
  ),
  close: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.5" y="7.5" width="19" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M2.5 12.5h19" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M10.7 6.2A9.9 9.9 0 0 1 12 6c5.7 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.3" />
      <path d="M6.3 7.9A17 17 0 0 0 2.5 12S6.3 18 12 18a9.5 9.5 0 0 0 3.9-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3.5 3.5l17 17" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
