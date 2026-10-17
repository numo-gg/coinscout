import { Link } from "react-router-dom";

const chapters = [
  ["problem", "The seller problem"],
  ["workflow", "Controlled workflow"],
  ["boundaries", "Trust boundaries"],
  ["walkthrough", "Product walkthrough"],
  ["wedge", "The collector wedge"],
  ["roadmap", "Pilot & roadmap"],
] as const;

const constraints = [
  ["Model assists", "It can extract approved facts, research public organizations, and draft a note."],
  ["Policy decides", "A deterministic rule set alone evaluates a buyer offer and next allowed counter."],
  ["Seller commits", "Only a seller can approve outreach, reserve inventory, simulate payment, or unlock shipping."],
] as const;

const steps = [
  ["01", "Bring one listing", "Choose a role-authorized Instagram post or start with the protected demo listing."],
  ["02", "Confirm the facts", "Approve the caption-derived details before any analysis is used."],
  ["03", "Set the mandate", "Keep the ask, ladder, and private floor visible only to the seller and policy engine."],
  ["04", "Review cited prospects", "Choose from up to three public, evidence-backed organizations—never a claim of buyer intent."],
  ["05", "Approve the next move", "Review simulated outreach, a deterministic counter, and an auditable reservation receipt."],
] as const;

const roadmap = [
  ["Now", "Guided demo", "One listing, cited public research, deterministic negotiation, and simulated settlement."],
  ["Pilot", "Role-authorized sellers", "Validate consent, evidence quality, seller control, and the collector/dealer workflow."],
  ["After review", "Broader access", "Pursue Meta approval before opening account onboarding beyond authorized test roles."],
] as const;

function PitchNav() {
  return (
    <nav className="pitch-nav" aria-label="Pitch chapters">
      <a className="pitch-nav__home" href="#cover">ATLAS SCOUT</a>
      <ol className="pitch-nav__list">
        {chapters.map(([id, label], index) => (
          <li key={id}>
            <a href={`#${id}`}><span aria-hidden="true">0{index + 1}</span>{label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CompassMark() {
  return (
    <svg className="pitch-compass" viewBox="0 0 320 320" role="img" aria-labelledby="pitch-compass-title pitch-compass-desc">
      <title id="pitch-compass-title">A compass inside a coin</title>
      <desc id="pitch-compass-desc">An original Atlas Scout mark representing guided, seller-controlled decisions.</desc>
      <circle cx="160" cy="160" r="139" className="pitch-compass__rim" />
      <circle cx="160" cy="160" r="112" className="pitch-compass__ring" />
      <path d="M160 42v30M160 248v30M42 160h30M248 160h30" className="pitch-compass__ticks" />
      <path d="m188 89 48 103-104 43 42-103Z" className="pitch-compass__needle pitch-compass__needle--brass" />
      <path d="m132 235-48-103 104-43-42 103Z" className="pitch-compass__needle pitch-compass__needle--ink" />
      <circle cx="160" cy="160" r="13" className="pitch-compass__center" />
      <text x="160" y="58" textAnchor="middle" className="pitch-compass__text">ATLAS</text>
      <text x="160" y="276" textAnchor="middle" className="pitch-compass__text">SCOUT</text>
    </svg>
  );
}

function StepFlow() {
  return (
    <ol className="pitch-flow" aria-label="Atlas Scout controlled workflow">
      {steps.map(([number, title, copy]) => (
        <li className="pitch-flow__step" key={number}>
          <span className="pitch-flow__number">{number}</span>
          <div>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PitchPage() {
  return (
    <div className="pitch" id="pitch-top">
      <PitchNav />

      <section className="pitch-cover" id="cover" aria-labelledby="pitch-title">
        <div className="pitch-cover__grid page-width">
          <div className="pitch-cover__copy">
            <p className="pitch-kicker">HACKATHON FIELD NOTE / 2026</p>
            <h1 id="pitch-title">A better way to scout the next buyer.</h1>
            <p className="pitch-cover__lede">Atlas Scout is a controlled research and negotiation companion for high-trust coin sales. It brings useful AI into the sale without handing the sale to AI.</p>
            <div className="pitch-cover__actions">
              <Link className="button button--primary" to="/scout">Open the demo <span aria-hidden="true">→</span></Link>
              <a className="pitch-text-link" href="#problem">Read the story <span aria-hidden="true">↓</span></a>
            </div>
            <p className="pitch-cover__fine-print">Research, outreach, payment, and labels shown in the demo are explicitly simulated.</p>
          </div>
          <div className="pitch-cover__visual" aria-hidden="true">
            <div className="pitch-cover__orbit pitch-cover__orbit--one" />
            <div className="pitch-cover__orbit pitch-cover__orbit--two" />
            <CompassMark />
            <span className="pitch-cover__coordinate pitch-cover__coordinate--north">N / EVIDENCE</span>
            <span className="pitch-cover__coordinate pitch-cover__coordinate--south">S / SELLER</span>
          </div>
        </div>
      </section>

      <section className="pitch-section pitch-section--problem" id="problem" aria-labelledby="problem-title">
        <div className="page-width pitch-two-column">
          <div className="pitch-section__heading">
            <p className="pitch-index">01 / THE SELLER PROBLEM</p>
            <h2 id="problem-title">A good coin sale is a series of judgment calls.</h2>
          </div>
          <div className="pitch-section__body">
            <p className="pitch-emphasis">A single listing can demand catalog knowledge, the right audience, careful negotiation, and a clean record of what happened.</p>
            <p>Today those decisions are scattered across tabs, message threads, and memory. Generic automation may save a moment, but it can also overstate certainty, reveal a seller’s position, or make an irreversible promise.</p>
            <div className="pitch-problem-grid">
              <article>
                <span className="pitch-problem-grid__glyph" aria-hidden="true">◎</span>
                <h3>Signal is scattered</h3>
                <p>Collectors, dealers, auction houses, and context live across public sources with uneven quality.</p>
              </article>
              <article>
                <span className="pitch-problem-grid__glyph" aria-hidden="true">↔</span>
                <h3>Negotiation is sensitive</h3>
                <p>A seller needs a consistent plan, not a model improvising with their private floor.</p>
              </article>
              <article>
                <span className="pitch-problem-grid__glyph" aria-hidden="true">□</span>
                <h3>Trust needs a trail</h3>
                <p>Every material handoff should be clear, reviewable, and easy to reconstruct.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section pitch-section--workflow" id="workflow" aria-labelledby="workflow-title">
        <div className="page-width">
          <div className="pitch-section__intro">
            <p className="pitch-index">02 / CONTROLLED WORKFLOW</p>
            <h2 id="workflow-title">One path from listing to next action.</h2>
            <p>Atlas Scout is designed as a narrow, reversible workflow. It helps organize the work around a sale while keeping decision authority where it belongs.</p>
          </div>
          <StepFlow />
          <aside className="pitch-callout" aria-label="Workflow principle">
            <span className="pitch-callout__mark" aria-hidden="true">✦</span>
            <p><strong>Every step has an owner.</strong> The seller approves inputs and commitments; the policy engine checks terms; the model only assists with bounded research and drafting.</p>
          </aside>
        </div>
      </section>

      <section className="pitch-section pitch-section--boundaries" id="boundaries" aria-labelledby="boundaries-title">
        <div className="page-width">
          <div className="pitch-section__intro pitch-section__intro--split">
            <div>
              <p className="pitch-index">03 / TRUST BOUNDARIES</p>
              <h2 id="boundaries-title">Useful intelligence. Clear limits.</h2>
            </div>
            <p>Atlas Scout separates assistance from authority. That separation is the product—not a disclaimer tucked under the product.</p>
          </div>
          <div className="pitch-boundary-grid">
            {constraints.map(([title, copy], index) => (
              <article className="pitch-boundary-card" key={title}>
                <span className="pitch-boundary-card__number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="pitch-boundary-ledger">
            <div className="pitch-boundary-ledger__column">
              <p className="pitch-boundary-ledger__label">THE MODEL MAY</p>
              <ul>
                <li>Analyze seller-approved listing facts</li>
                <li>Research public organizations with citations</li>
                <li>Draft a seller-reviewed outreach note</li>
              </ul>
            </div>
            <div className="pitch-boundary-ledger__column pitch-boundary-ledger__column--no">
              <p className="pitch-boundary-ledger__label">THE MODEL NEVER</p>
              <ul>
                <li>Sets, changes, or exposes private pricing</li>
                <li>Sends a message or reserves inventory</li>
                <li>Confirms payment or creates a shipment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section pitch-section--walkthrough" id="walkthrough" aria-labelledby="walkthrough-title">
        <div className="page-width pitch-walkthrough">
          <div className="pitch-section__heading">
            <p className="pitch-index">04 / PRODUCT WALKTHROUGH</p>
            <h2 id="walkthrough-title">The deal room makes the next decision legible.</h2>
            <p>Rather than hide critical logic behind a chat box, the interface shows the listing, mandate, evidence, and policy result together.</p>
          </div>
          <div className="pitch-deal-room" aria-label="Illustrative Atlas Scout deal room interface">
            <div className="pitch-deal-room__topbar">
              <span className="pitch-deal-room__live-dot" aria-hidden="true" />
              <strong>ATLAS SCOUT / DEMO DEAL ROOM</strong>
              <span>SIMULATED</span>
            </div>
            <div className="pitch-deal-room__body">
              <article className="pitch-deal-room__listing">
                <p className="pitch-deal-room__eyebrow">SELLER-APPROVED LISTING</p>
                <div className="pitch-deal-room__coin" aria-hidden="true"><span>1921</span></div>
                <h3>1921 Silver Dollar</h3>
                <p>Illustrative listing facts, reviewed before analysis.</p>
                <span className="pitch-status-pill">Facts confirmed</span>
              </article>
              <article className="pitch-deal-room__mandate">
                <p className="pitch-deal-room__eyebrow">PRIVATE SELLER MANDATE</p>
                <dl>
                  <div><dt>Ask</dt><dd>$550 shipped</dd></div>
                  <div><dt>Auto-accept</dt><dd>$525</dd></div>
                  <div><dt>Bounded ladder</dt><dd>$525 → $515 → $500</dd></div>
                </dl>
                <p className="pitch-deal-room__private">Private floor remains private.</p>
              </article>
              <article className="pitch-deal-room__result">
                <p className="pitch-deal-room__eyebrow">DETERMINISTIC POLICY RESULT</p>
                <div className="pitch-deal-room__offer"><span>Buyer offer</span><strong>$510</strong></div>
                <div className="pitch-deal-room__arrow" aria-hidden="true">↓</div>
                <div className="pitch-deal-room__counter"><span>Approved next counter</span><strong>$525</strong></div>
                <p>Seller review required before simulated outreach.</p>
              </article>
            </div>
            <div className="pitch-deal-room__receipt">
              <span>RECEIPT 01</span>
              <span>offer evaluated by policy</span>
              <span>seller action pending</span>
            </div>
          </div>
          <p className="pitch-caption">The walkthrough uses fixture data. It demonstrates the decision boundary, not a completed transaction.</p>
        </div>
      </section>

      <section className="pitch-section pitch-section--wedge" id="wedge" aria-labelledby="wedge-title">
        <div className="page-width pitch-wedge">
          <div className="pitch-wedge__copy">
            <p className="pitch-index">05 / COIN-COLLECTOR WEDGE</p>
            <h2 id="wedge-title">Start where provenance and patience already matter.</h2>
            <p>Coins are a focused proving ground: each piece has a story, buyer fit is nuanced, and sellers often need a thoughtful next conversation more than a louder listing.</p>
          </div>
          <ul className="pitch-wedge__reasons">
            <li><span>01</span><div><h3>High-context inventory</h3><p>Condition, variety, date, mint, and provenance change who will care and what a fair conversation looks like.</p></div></li>
            <li><span>02</span><div><h3>Trusted public nodes</h3><p>Dealers, clubs, auction houses, and publications create researchable public context without profiling private individuals.</p></div></li>
            <li><span>03</span><div><h3>Repeatable operator work</h3><p>The same disciplined workflow can later extend to other high-trust collectible categories.</p></div></li>
          </ul>
        </div>
      </section>

      <section className="pitch-section pitch-section--roadmap" id="roadmap" aria-labelledby="roadmap-title">
        <div className="page-width">
          <div className="pitch-section__intro pitch-section__intro--split">
            <div>
              <p className="pitch-index">06 / PILOT &amp; ROADMAP</p>
              <h2 id="roadmap-title">Earn trust before expanding the surface area.</h2>
            </div>
            <p>The launch is intentionally constrained: role-authorized testing, fixture-safe previews, and no automated commitments.</p>
          </div>
          <ol className="pitch-roadmap">
            {roadmap.map(([stage, title, copy], index) => (
              <li key={stage}>
                <span className="pitch-roadmap__line" aria-hidden="true" />
                <span className="pitch-roadmap__stage">{stage}</span>
                <span className="pitch-roadmap__number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
          <div className="pitch-closing">
            <p className="pitch-closing__eyebrow">THE PROPOSITION</p>
            <p className="pitch-closing__statement">Make the right next move easier to see—<em>without ever taking it for the seller.</em></p>
            <div className="pitch-closing__actions">
              <Link className="button button--primary" to="/scout">Explore the controlled demo <span aria-hidden="true">→</span></Link>
              <a className="pitch-text-link" href="#pitch-top">Back to the top <span aria-hidden="true">↑</span></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
