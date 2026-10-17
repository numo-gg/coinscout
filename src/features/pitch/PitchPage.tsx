import { Link } from "react-router-dom";
import "./PitchPage.css";

const steps = [
  ["01", "Select an Instagram post", "Choose the seller-approved listing to research."],
  ["02", "Set a private range", "The range stays in the seller’s browser."],
  ["03", "Search public sources", "CoinScout looks for relevant collector-market context."],
  ["04", "Review cited leads", "The seller receives up to three sourced research leads."],
] as const;

export function PitchPage() {
  return (
    <div className="deck" id="deck-top">
      <nav className="deck-nav" aria-label="Deck pages">
        <a className="deck-nav__brand" href="#landing">COINSCOUT</a>
        <ol>
          <li><a href="#landing">01</a></li>
          <li><a href="#scout">02</a></li>
        </ol>
      </nav>

      <section className="deck-slide deck-slide--landing" id="landing" aria-labelledby="landing-title">
        <div className="deck-slide__inner">
          <div className="deck-copy">
            <p className="deck-label">01 / COINSCOUT</p>
            <h1 id="landing-title">The right collector may never see your coin.</h1>
            <p className="deck-lede">Listings travel fast; specialist collectors do not always see them. Sellers can wait too long—or sell to the first buyer instead of the right one.</p>
          </div>
          <aside className="deck-signal" aria-label="Example collectible coin">
            <div className="deck-coin" aria-hidden="true">
              <div className="deck-coin__ring">
                <div className="deck-coin__face">
                  <span>1881-S</span>
                  <strong>MORGAN<br />DOLLAR</strong>
                  <span>U.S. SILVER</span>
                </div>
              </div>
            </div>
            <p>A Morgan Dollar deserves Morgan Dollar people.</p>
            <span className="deck-signal__detail">One listing. A more focused next conversation.</span>
          </aside>
        </div>
      </section>

      <section className="deck-slide deck-slide--scout" id="scout" aria-labelledby="scout-title">
        <div className="deck-slide__inner">
          <div className="deck-copy">
            <p className="deck-label">02 / HOW SCOUT WORKS</p>
            <h2 id="scout-title">One listing becomes a focused collector search.</h2>
            <p className="deck-lede">CoinScout uses the seller-approved caption to search public sources for relevant collector-market research.</p>
            <p className="deck-product-note">Private range stays in the browser. The seller reviews every cited lead and chooses what happens next.</p>
          </div>
          <div className="deck-product-panel">
            <ol className="deck-flow" aria-label="CoinScout workflow">
              {steps.map(([number, title, copy]) => (
                <li key={number}>
                  <span>{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="deck-product-panel__footer">
              <span>PUBLIC-SOURCE RESEARCH · SELLER REVIEW REQUIRED</span>
              <Link className="deck-slide__action" to="/scout">Open Scout <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
