import "./PitchPage.css";

const problemPoints = [
  "Top dollar gets missed.",
  "Finding the right buyer takes too long.",
  "Good inventory sits while sellers search.",
] as const;

const listingFacts = ["1881-S", "Morgan Dollar", "MS-64", "Silver"] as const;

const buyerSignals = ["Morgan Dollar collectors", "VAM specialists", "Silver-dollar dealers"] as const;

const outcomeSteps = [
  ["01", "Set the terms", "Price range, timing, and what a good deal looks like."],
  ["02", "Find the fit", "Match one coin to the collectors most likely to value it."],
  ["03", "Carry the deal", "Move from buyer search through a seller-approved close."],
] as const;

function MorganDollarImage() {
  return (
    <figure className="pitchdeck-coin">
      <div className="pitchdeck-coin__orbit pitchdeck-coin__orbit--outer" />
      <div className="pitchdeck-coin__orbit pitchdeck-coin__orbit--inner" />
      <img className="pitchdeck-coin__image" src="/assets/morgan-dollar-1881-s.jpg" alt="1881-S Morgan Dollar obverse" />
      <figcaption>Morgan Dollar</figcaption>
    </figure>
  );
}

function PitchNav() {
  return (
    <nav className="pitchdeck-nav" aria-label="Pitch sections">
      <a className="pitchdeck-nav__brand" href="#problem">COINSCOUT</a>
      <ol className="pitchdeck-nav__list">
        <li><a href="#problem"><span aria-hidden="true">01</span>Problem</a></li>
        <li><a href="#solution"><span aria-hidden="true">02</span>How it works</a></li>
        <li><a href="#outcome"><span aria-hidden="true">03</span>Outcome</a></li>
      </ol>
    </nav>
  );
}

export function PitchPage() {
  return (
    <div className="pitchdeck">
      <PitchNav />

      <section className="pitchdeck-slide pitchdeck-slide--problem" id="problem" aria-labelledby="problem-title">
        <div className="pitchdeck-slide__copy">
          <p className="pitchdeck-label">01 / THE PROBLEM</p>
          <h1 id="problem-title">The right buyer may never see your coin.</h1>
          <p className="pitchdeck-slide__lede">
            Sellers do not always get top dollar because finding the right buyer takes too long. A specialist may value a coin far more than the first person who sees the listing, but most owners do not have time to research, post, follow up, and wait.
          </p>
          <ul className="pitchdeck-problem-list">
            {problemPoints.map((point, index) => <li key={point}><span>0{index + 1}</span>{point}</li>)}
          </ul>
        </div>
        <div className="pitchdeck-problem-art">
          <MorganDollarImage />
        </div>
      </section>

      <section className="pitchdeck-slide pitchdeck-slide--solution" id="solution" aria-labelledby="solution-title">
        <div className="pitchdeck-slide__copy">
          <p className="pitchdeck-label">02 / HOW IT WORKS</p>
          <h2 id="solution-title">CoinScout sells your coins on your behalf.</h2>
          <p className="pitchdeck-slide__lede">
            Start with one listing. CoinScout analyzes what makes the coin valuable—its type, date, mint, grade, variety, condition, rarity, and asking price—then finds the niche buyers most likely to care about that exact coin.
          </p>
          <p className="pitchdeck-slide__detail">One general listing becomes a focused buyer search.</p>
        </div>
        <div className="pitchdeck-match" aria-label="Example CoinScout matching flow">
          <div className="pitchdeck-match__listing">
            <span className="pitchdeck-match__eyebrow">ONE LISTING</span>
            <strong>1881-S<br />MORGAN DOLLAR</strong>
            <ul>
              {listingFacts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
          </div>
          <div className="pitchdeck-match__analyze" aria-hidden="true">
            <span>ANALYZE</span>
            <i />
          </div>
          <div className="pitchdeck-match__buyers">
            <span className="pitchdeck-match__eyebrow">BEST-FIT BUYERS</span>
            <ul>
              {buyerSignals.map((buyer, index) => <li key={buyer}><span>0{index + 1}</span>{buyer}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="pitchdeck-slide pitchdeck-slide--outcome" id="outcome" aria-labelledby="outcome-title">
        <div className="pitchdeck-slide__copy">
          <p className="pitchdeck-label">03 / THE OUTCOME</p>
          <h2 id="outcome-title">You set the terms. CoinScout does the buyer work.</h2>
          <p className="pitchdeck-slide__lede">
            Set your price range and selling criteria. CoinScout takes the deal from listing analysis through buyer matching, outreach, offers, and closing on your behalf—so your coin spends less time sitting in inventory and has a better shot at the right price.
          </p>
          <p className="pitchdeck-slide__detail">You stay in control of the final terms.</p>
        </div>
        <ol className="pitchdeck-outcome-steps" aria-label="Seller outcome">
          {outcomeSteps.map(([number, title, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
