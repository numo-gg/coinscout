import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/shared/brand/Logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Logo />
        <nav aria-label="Primary navigation">
          <NavLink to="/scout">Scout demo</NavLink>
          <NavLink to="/pitch">Pitch</NavLink>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <Logo compact />
        <p>Seller-controlled buyer discovery for collectible coins.</p>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/data-deletion">Data deletion</Link>
        </div>
      </footer>
    </div>
  );
}
