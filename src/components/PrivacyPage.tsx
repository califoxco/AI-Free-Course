import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <nav className="breadcrumb">
        <Link to="/">Roadmap</Link> <span>/</span> Privacy
      </nav>
      <h1>Privacy</h1>
      <div className="privacy-body">
        <p>
          <strong>Your learning progress</strong> (quiz scores, solved challenges, code drafts,
          theme preference) is stored in your browser's localStorage. It never leaves your device
          and we cannot see it. Clearing your browser data resets it.
        </p>
        <p>
          <strong>Code you write</strong> in the practice editor runs entirely in your browser via
          Pyodide (WebAssembly). It is not uploaded anywhere.
        </p>
        <p>
          <strong>Email</strong> — if you subscribe to course updates, your address is stored by our
          newsletter provider solely to send you those updates. Every email includes an unsubscribe
          link.
        </p>
        <p>
          <strong>Advertising</strong> — if ads are shown, we use EthicalAds, which serves
          contextual ads without tracking, cookies, or personal data collection.
        </p>
        <p>
          <strong>Affiliate links</strong> — some resource links may be affiliate links. They fund
          the course at no extra cost to you and never affect which resources we recommend; every
          resource was chosen on merit first.
        </p>
        <p>
          <strong>Analytics</strong> — we use Vercel Web Analytics to count page views and see which
          sites refer traffic here. It is cookieless and aggregate: it does not set cookies, does not
          track you across other websites, and does not build a profile of you. No personally
          identifying information is collected or sold.
        </p>
        <p>
          Questions? Open an issue or reach out via the links in the footer. This page will be
          updated if any of the above changes.
        </p>
      </div>
    </div>
  );
}
