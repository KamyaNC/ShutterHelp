// Logo mark: a sun settling on a horizon with its reflection below.
export default function Mark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="mark">
      <circle cx="16" cy="13" r="6" fill="var(--sun)" />
      <rect x="4" y="19" width="24" height="2" rx="1" fill="currentColor" />
      <rect x="9" y="23" width="14" height="2" rx="1" fill="currentColor" opacity=".5" />
    </svg>
  );
}
