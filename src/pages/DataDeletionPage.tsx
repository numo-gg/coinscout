import { Badge } from "@/shared/ui/Badge";

export function DataDeletionPage() {
  return (
    <article className="legal-page page-width">
      <Badge tone="brass">DATA DELETION</Badge>
      <h1>Request deletion or disconnect Instagram.</h1>
      <p className="lede">Atlas Scout’s launch demo does not maintain a persistent customer database. Optional Instagram sessions are short-lived and can be cleared immediately.</p>
      <section><h2>Disconnect now</h2><p>Use the Disconnect control in Atlas Scout to clear the session cookie and remove server-held session data. If you connected through Instagram, you may also remove Atlas Scout in Instagram or Facebook account settings.</p></section>
      <section><h2>Make a deletion request</h2><p>Email <a href="mailto:support@coinscout.live?subject=CoinScout%20data%20deletion%20request">support@coinscout.live</a> with the subject “CoinScout data deletion request” and the Instagram username or request identifier you used. Do not send an access token, password, payment details, or private messages. We will confirm deletion or explain any legally required retention.</p></section>
      <section><h2>Meta deauthorization</h2><p>Meta may notify Atlas Scout when a person removes the app. That request is acknowledged at our deauthorization endpoint and any short-lived session associated with the request is cleared.</p></section>
    </article>
  );
}
