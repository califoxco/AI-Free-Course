import { useEffect } from 'react';
import { monetization } from '../config';

let scriptInjected = false;

/**
 * A single, tasteful EthicalAds text placement. Renders nothing until a
 * publisher id is configured. Deliberately kept OFF lesson/practice pages —
 * never interrupt someone mid-exercise.
 */
export default function AdSlot({ id }: { id: string }) {
  const publisher = monetization.ethicalAdsPublisher;

  useEffect(() => {
    if (!publisher) return;
    if (!scriptInjected) {
      scriptInjected = true;
      const el = document.createElement('script');
      el.async = true;
      el.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
      document.head.appendChild(el);
    } else {
      (window as unknown as { ethicalads?: { load: () => void } }).ethicalads?.load();
    }
  }, [publisher, id]);

  if (!publisher) return null;
  return (
    <div className="ad-slot">
      <div data-ea-publisher={publisher} data-ea-type="text" id={`ea-${id}`} />
      <span className="ad-note">Ethical, privacy-respecting ads keep this course free.</span>
    </div>
  );
}
