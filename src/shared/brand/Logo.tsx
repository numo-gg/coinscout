import { Link } from "react-router-dom";

type LogoProps = { compact?: boolean };

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link className="brand" to="/" aria-label="CoinScout home">
      <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
        <path d="M26.9 14.7 32.2 28l-14.4 5.4L23.1 20Z" fill="currentColor" />
        <path d="m24 20 8.2 8-14.4 5.4Z" fill="var(--ink)" opacity=".85" />
      </svg>
      {!compact && <span>coin<span>scout</span></span>}
    </Link>
  );
}
