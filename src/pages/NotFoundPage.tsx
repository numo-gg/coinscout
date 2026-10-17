import { LinkButton } from "@/shared/ui/Button";

export function NotFoundPage() {
  return <section className="empty-page page-width"><p className="eyebrow">404</p><h1>That route is not on the map.</h1><LinkButton to="/">Back to CoinScout</LinkButton></section>;
}
