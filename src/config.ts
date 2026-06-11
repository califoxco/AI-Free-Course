/**
 * Monetization configuration — everything ships OFF by default and turns on
 * by filling in a value. Components render nothing while unconfigured, so the
 * site stays clean until each program is approved.
 */
export const monetization = {
  /**
   * Email capture form action. For Buttondown:
   *   https://buttondown.com/api/emails/embed-subscribe/<username>
   * For Kit (ConvertKit), paste the form action URL from any HTML embed.
   * Empty string = the signup blocks are hidden entirely.
   */
  newsletterAction: '',

  /**
   * EthicalAds publisher id (apply at https://www.ethicalads.io/publishers/
   * once the site is live). Empty = no ads rendered anywhere.
   */
  ethicalAdsPublisher: '',

  /**
   * Affiliate replacements. Key = the exact resource URL used in the course
   * data, value = your tagged affiliate URL (e.g. an impact.com tracking link
   * for Coursera). Resources not listed here link out unchanged.
   */
  affiliateOverrides: {} as Record<string, string>,

  /** Amazon Associates tag (e.g. 'ailearn-20') applied to any amazon.com links. */
  amazonTag: '',
};

export function hasAffiliates(): boolean {
  return Object.keys(monetization.affiliateOverrides).length > 0 || !!monetization.amazonTag;
}

/** Returns the (possibly affiliate-tagged) URL for an external resource. */
export function outboundUrl(url: string): string {
  const override = monetization.affiliateOverrides[url];
  if (override) return override;
  if (monetization.amazonTag && /(^|\.)amazon\.com$/.test(safeHost(url))) {
    const u = new URL(url);
    u.searchParams.set('tag', monetization.amazonTag);
    return u.toString();
  }
  return url;
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
