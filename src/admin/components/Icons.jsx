/**
 * Inline SVG icon set for the admin dashboard — no icon library dependency.
 * Every icon inherits `currentColor` and accepts a className.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
};

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M15.5 5.2c1.6.3 2.8 1.7 2.8 3.3 0 1.6-1.2 3-2.8 3.3" />
    <path d="M18 14.7c2 .5 3.5 2.2 3.5 4.3" />
  </svg>
);

export const InboxIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 12h4l1.5 3h6l1.5-3h4" />
    <path d="M5 5h14l2.5 7v7a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 2.5 19v-7L5 5Z" />
  </svg>
);

export const LifeBuoyIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m7.5 7.5 2.6 2.6M13.9 13.9l2.6 2.6M16.5 7.5l-2.6 2.6M9.6 13.9l-2.6 2.6" />
  </svg>
);

export const MegaphoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 10v4a1 1 0 0 0 1 1h2l1 5h2l-1-5h2l9 4V6L10 10H6a1 1 0 0 0-3 0Z" />
  </svg>
);

export const LayersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
    <path d="m3 12.5 9 4.5 9-4.5" />
    <path d="m3 17 9 4.5 9-4.5" />
  </svg>
);

export const LogOutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PencilIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const PinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 1 1 8 0v3.5" />
  </svg>
);

export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const EyeOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m3 3 18 18" />
    <path d="M10.6 6.2A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.2 3.8" />
    <path d="M6.7 6.7C4 8.1 2.5 12 2.5 12s3.5 6 9.5 6c1.3 0 2.5-.3 3.5-.7" />
    <path d="M9.9 9.9a2.5 2.5 0 0 0 3.5 3.5" />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const ImageIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 15-5-5-4.5 4.5" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const ShieldIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const KeyIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2" />
  </svg>
);

export const ChatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5h16v10H9l-5 4v-14Z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </svg>
);

export const CogIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 3 10 14" />
    <path d="m21 3-7 18-4-7-7-4 18-7Z" />
  </svg>
);

export const DownloadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v11M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const CalendarDaysIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
