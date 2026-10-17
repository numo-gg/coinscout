import { Badge } from "@/shared/ui/Badge";

export function PrivacyPage() {
  return (
    <article className="legal-page page-width">
      <Badge tone="brass">PRIVACY NOTICE</Badge>
      <h1>Privacy, in plain terms.</h1>
      <p className="legal-page__updated">Last updated: October 17, 2026</p>
      <section><h2>What Atlas Scout processes</h2><p>When a seller explicitly opts in, Atlas Scout may send the seller-approved listing caption and selected listing image bytes to DeepSeek for structured analysis, public-source research, or a message draft. It does not send private pricing rules, payments, buyer contact data, cookies, Instagram tokens, or server secrets to the model.</p></section>
      <section><h2>Instagram data</h2><p>The optional Instagram connection is available only to Meta role-authorized Business or Creator test accounts. We use it to read the account and media the seller selects. Access tokens stay server-side in a short-lived encrypted session and are cleared when the seller disconnects. Atlas Scout does not use Instagram data to train a model or persist a social graph.</p></section>
      <section><h2>How results are used</h2><p>Research results are advisory, must carry public citations, and require seller review. The demo labels outreach, payment, and shipping as simulated. Atlas Scout does not send DMs, collect payment, reserve inventory, or purchase labels.</p></section>
      <section><h2>Retention and choices</h2><p>This launch demo is designed without a customer database or persistent agent memory. You can disconnect the optional Instagram session at any time. To ask a privacy question or request deletion, use <a href="mailto:support@coinscout.live">support@coinscout.live</a>.</p></section>
    </article>
  );
}
