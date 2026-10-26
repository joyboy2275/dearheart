import { Link } from "wouter";

export function Brand() {
  return <Link href="/" className="brand-mark" aria-label="Dear, Always home">
    <span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M18 29.5S5.7 22.1 5.7 13.4a6.1 6.1 0 0 1 11.1-3.5 6.1 6.1 0 0 1 11.1 3.5C27.9 22.1 18 29.5 18 29.5Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 18.5c3.4-1.6 5.6-1.4 7.1.3 1.5 1.8 2.9 2.2 4.4 1.1 1.6-1.2 3.3-1.2 5.2.2 1.6 1.2 3.2 1.2 5.4-.2" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round"/></svg></span>
    <span className="brand-name">Dear, <em>Always</em></span>
  </Link>;
}
