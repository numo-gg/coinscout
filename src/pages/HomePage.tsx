import { Link } from "react-router-dom";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/Button";

const guardrails = [
  ["Seller sets the mandate", "Shipped-price rules stay deterministic and private."],
  ["Every lead is cited", "Public sources, excerpted evidence, and visible uncertainty."],
  ["Nothing moves on its own", "Scout does not message buyers, take payment, or arrange shipping."],
];

export function HomePage() {
  return (
    <>
      <section className="hero page-width">
        <div className="hero__copy">
          <Badge tone="brass">ATLAS SCOUT / CONTROLLED DEMO</Badge>
          <p className="eyebrow">From one listing to a confident conversation.</p>
          <h1>Find the next relevant collector conversation—without giving up control.</h1>
          <p className="lede">Atlas Scout turns a seller-approved coin listing into a small set of cited public research leads. You stay in control of the price and every next step.</p>
          <div className="button-row">
            <LinkButton to="/scout">Open Scout <span aria-hidden="true">→</span></LinkButton>
            <LinkButton to="/deck" variant="secondary">View the pitch</LinkButton>
          </div>
          <p className="hero__note">Live Instagram import is limited to Meta role-authorized test accounts while access review is pending.</p>
        </div>
        <div className="hero__object" aria-label="Illustration of a coin scout compass">
          <div className="coin-orbit coin-orbit--one" />
          <div className="coin-orbit coin-orbit--two" />
          <div className="hero__coin">
            <span className="hero__coin-year">1921</span>
            <span className="hero__coin-mark">A</span>
            <span className="hero__coin-label">ATLAS<br />SCOUT</span>
          </div>
          <div className="hero__signal">3 cited paths<br /><b>1 seller decision</b></div>
        </div>
      </section>

      <section className="proof-band">
        <div className="page-width proof-grid">
          {guardrails.map(([title, copy], index) => (
            <article className="proof-card" key={title}>
              <span className="proof-card__number">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-width split-callout">
        <div>
          <p className="eyebrow">BUILT FOR THE HIGH-TRUST SALE</p>
          <h2>Structured assistance, not autonomous commerce.</h2>
        </div>
        <div>
          <p>The model organizes seller-approved facts and researches public organizations. Every action remains with the seller.</p>
          <Link className="text-link" to="/deck">See the product story <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
