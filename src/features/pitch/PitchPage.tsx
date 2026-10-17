import { Link } from "react-router-dom";
import "./PitchPage.css";

const chapters = [
  ["gap", "The gap"],
  ["flow", "The flow"],
  ["control", "Seller control"],
  ["evidence", "Evidence first"],
  ["coins", "Why coins"],
  ["pilot", "Pilot"],
] as const;

const flow = [
  ["01", "Connect Instagram", "A role-authorized seller starts with their own account."],
  ["02", "Select one post", "The seller chooses the listing that deserves focused research."],
  ["03", "Set a private range", "The seller records an ask and floor before searching."],
  ["04", "Search cited sources", "CoinScout returns public research leads for seller review."],
] as const;

const evidenceFields = ["Relevance", "Source excerpt", "Public source", "Confidence & uncertainty"] as const;

function PitchNav() {
  return (
    <nav className="pitchdeck-nav" aria-label="Pitch deck sections">
      <a className="pitchdeck-nav__brand" href="#top">COINSCOUT</a>
      <ol className="pitchdeck-nav__list">
        {chapters.map(([id, label], index) => (
          <li key={id}>
            <a href={`#${id}`}>
              <span aria-hidden="true">0{index + 1}</span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PitchPage() {
  return (
    <div className="pitchdeck" id="top">
      <PitchNav />

      <section className="pitchdeck-hero" aria-labelledby="pitch-title">
        <div className="pitchdeck-hero__content">
          <p className="pitchdeck-label">COINSCOUT / HACKATHON PITCH</p>
          <h1 id="pitch-title">Scout sells your coins on your behalf.</h1>
          <p className="pitchdeck-hero__lede">
            For one listing, Scout finds the best buyer for your coin niche, then gives you cited leads to review before you decide what happens next.
          </p>
          <div className="pitchdeck-hero__actions">
            <a className="pitchdeck-hero__action" href="#flow">See the four steps <span aria-hidden="true">↓</span></a>
            <Link className="pitchdeck-hero__action" to="/scout">Open the prototype <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="pitchdeck-coin" aria-hidden="true">
          <div className="pitchdeck-coin__rim" />
          <div className="pitchdeck-coin__face">
            <span>COIN</span>
            <strong>MORGAN<br />DOLLAR</strong>
            <span>PUBLIC SIGNALS</span>
          </div>
        </div>
      </section>

      <section className="pitchdeck-section pitchdeck-section--gap" id="gap" aria-labelledby="gap-title">
        <div className="pitchdeck-section__intro">
          <p className="pitchdeck-label">01 / THE GAP</p>
          <h2 id="gap-title">Research for collectible listings is still scattered work.</h2>
          <p>
            Sellers jump between tabs, collector sites, dealer pages, clubs, and search results to find useful context for a single item. That work takes time, and generic search rarely preserves the listing’s nuance.
          </p>
        </div>
        <div className="pitchdeck-section__grid">
          <article className="pitchdeck-section__card">
            <h3>One item, many fragments</h3>
            <p>Condition, variety, history, and audience fit live across separate public sources.</p>
          </article>
          <article className="pitchdeck-section__card">
            <h3>Signal needs context</h3>
            <p>A raw result is not enough; a seller needs to know why a lead may be relevant.</p>
          </article>
          <article className="pitchdeck-section__card">
            <h3>Private choices stay private</h3>
            <p>Research should help a seller think without exposing their price range.</p>
          </article>
        </div>
      </section>

      <section className="pitchdeck-section pitchdeck-section--flow" id="flow" aria-labelledby="flow-title">
        <div className="pitchdeck-section__intro">
          <p className="pitchdeck-label">02 / THE FLOW</p>
          <h2 id="flow-title">Four steps. One clear outcome.</h2>
          <p>CoinScout keeps the surface deliberately small: select a listing, define the guardrails, and inspect cited public leads.</p>
        </div>
        <ol className="pitchdeck-flow" aria-label="CoinScout four step flow">
          {flow.map(([number, title, copy]) => (
            <li className="pitchdeck-flow__step" key={number}>
              <span className="pitchdeck-flow__number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pitchdeck-section pitchdeck-section--control" id="control" aria-labelledby="control-title">
        <div className="pitchdeck-section__intro">
          <p className="pitchdeck-label">03 / SELLER CONTROL</p>
          <h2 id="control-title">The search is useful because the boundaries are clear.</h2>
        </div>
        <div className="pitchdeck-control">
          <div className="pitchdeck-control__column">
            <h3>What CoinScout receives</h3>
            <ul>
              <li>The seller-selected post caption.</li>
              <li>Public pages needed to substantiate a lead.</li>
            </ul>
          </div>
          <div className="pitchdeck-control__column">
            <h3>What stays with the seller</h3>
            <ul>
              <li>Price range stays local and is not part of the research prompt.</li>
              <li>The seller reviews every result before deciding what to do next.</li>
            </ul>
          </div>
          <div className="pitchdeck-control__boundary">
            <strong>Search is the boundary.</strong>
            <p>CoinScout never messages people, makes offers, or reserves inventory.</p>
          </div>
        </div>
      </section>

      <section className="pitchdeck-section pitchdeck-section--evidence" id="evidence" aria-labelledby="evidence-title">
        <div className="pitchdeck-section__intro">
          <p className="pitchdeck-label">04 / EVIDENCE-FIRST OUTPUT</p>
          <h2 id="evidence-title">Every lead comes with its reason for being there.</h2>
          <p>Instead of an opaque recommendation, CoinScout presents a compact research card for seller review.</p>
        </div>
        <article className="pitchdeck-evidence" aria-label="Example research lead">
          <div className="pitchdeck-evidence__header">
            <p>RESEARCH LEAD / EXAMPLE</p>
            <span>REVIEW REQUIRED</span>
          </div>
          <div className="pitchdeck-evidence__body">
            <div>
              <h3>American Numismatic Association</h3>
              <p>Example source card: it shows the review details a seller sees before treating a public page as useful context.</p>
            </div>
            <dl className="pitchdeck-evidence__fields">
              {evidenceFields.map((field) => (
                <div key={field}>
                  <dt>{field}</dt>
                  <dd>
                    {field === "Relevance" && "A relevant public page must explain how it relates to the selected listing."}
                    {field === "Source excerpt" && "A short excerpt is shown with the public page URL during live research."}
                    {field === "Public source" && <a href="https://www.money.org/" target="_blank" rel="noreferrer">money.org <span aria-hidden="true">↗</span></a>}
                    {field === "Confidence & uncertainty" && "Illustrative: medium — public information can be incomplete or stale."}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </section>

      <section className="pitchdeck-section pitchdeck-section--coins" id="coins" aria-labelledby="coins-title">
        <div className="pitchdeck-coin" aria-hidden="true">
          <div className="pitchdeck-coin__rim" />
          <div className="pitchdeck-coin__face">
            <span>THE WEDGE</span>
            <strong>COINS</strong>
            <span>CONTEXT MATTERS</span>
          </div>
        </div>
        <div className="pitchdeck-section__intro">
          <p className="pitchdeck-label">05 / WHY COINS</p>
          <h2 id="coins-title">Coins are a natural proving ground for evidence-led discovery.</h2>
          <p>Each listing carries rich detail, trusted public sources already exist, and the difference between a generic lead and a relevant one matters to collectors.</p>
          <ul className="pitchdeck-section__list">
            <li>High-context inventory: date, mint, variety, grade, and story.</li>
            <li>Researchable public ecosystem: dealers, clubs, auction houses, and reference material.</li>
            <li>A repeatable workflow for future collectible categories.</li>
          </ul>
        </div>
      </section>

      <section className="pitchdeck-section pitchdeck-section--pilot" id="pilot" aria-labelledby="pilot-title">
        <div className="pitchdeck-closing">
          <p className="pitchdeck-label">06 / PILOT &amp; NEXT STEP</p>
          <h2 id="pilot-title">Start with a focused seller pilot.</h2>
          <p>
            Test whether cited, seller-controlled research helps collectors spend less time searching and more time evaluating the right public context.
          </p>
          <div className="pitchdeck-closing__actions">
            <Link className="pitchdeck-closing__action" to="/scout">Try the prototype <span aria-hidden="true">→</span></Link>
            <a className="pitchdeck-closing__action" href="#top">Back to the beginning <span aria-hidden="true">↑</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
