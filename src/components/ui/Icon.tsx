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
  | 'grid-dots';

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
