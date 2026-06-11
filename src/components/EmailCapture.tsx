import { useState } from 'react';
import { monetization } from '../config';

const COPY = {
  dashboard: {
    title: 'New lessons land in your inbox',
    text: 'Occasional emails when new modules, challenges, or take-home projects ship. No spam, unsubscribe anytime.',
  },
  projects: {
    title: 'Get new take-home projects by email',
    text: 'We add enterprise-style projects with fresh datasets periodically — be first to hear.',
  },
} as const;

export default function EmailCapture({ context }: { context: keyof typeof COPY }) {
  const [submitted, setSubmitted] = useState(false);
  if (!monetization.newsletterAction) return null;
  const copy = COPY[context];

  return (
    <section className="email-capture">
      <div className="email-capture-body">
        <h3>{copy.title}</h3>
        <p>{copy.text}</p>
      </div>
      {submitted ? (
        <p className="email-capture-done">Check your inbox to confirm — thanks for subscribing.</p>
      ) : (
        <form
          className="email-capture-form"
          action={monetization.newsletterAction}
          method="post"
          target="_blank"
          onSubmit={() => setSubmitted(true)}
        >
          <input type="email" name="email" required placeholder="you@example.com" aria-label="Email address" />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
