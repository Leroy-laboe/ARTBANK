// Content for the Terms of Service, Privacy Policy and Cookie Policy pages.
// Template legal copy, not attorney-drafted — see the note in each page's
// component. Written to match the actual product (ArtSpace, interim Supabase
// auth ahead of JO1N ID, guardian/minor accounts, no live payments) rather
// than generic boilerplate, so it doesn't promise features that don't exist
// or contradict docs/pivot-checklist/17-do-not-build-guardrails.md (no
// auction/investment framing, no claim of automated contracts).

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const termsContent: LegalDoc = {
  title: 'Terms of Service',
  updated: 'Last updated: 20 August 2026',
  intro:
    'These Terms govern your use of ARTBANK — a platform for artists to document their creative work and build a professional identity, and for buyers and organizations to source creative talent. By creating an account or otherwise using ARTBANK, you agree to these Terms.',
  sections: [
    {
      heading: '1. Eligibility & accounts',
      body: [
        'You must provide accurate information when creating an account. You are responsible for activity that happens under your account and for keeping your credentials secure.',
        'ARTBANK supports guardian-managed accounts for minors. Where an account belongs to a minor, a verified guardian is responsible for the account and for approving any engagement, opportunity, or enquiry on the minor’s behalf.',
      ],
    },
    {
      heading: '2. Your ArtSpace and your work',
      body: [
        'Artists retain full ownership of the artwork, images, and documentation they upload to ArtSpace. Using ARTBANK does not transfer any ownership or exclusive rights in your work to us.',
        'You’re responsible for the accuracy of the records you create — provenance, history, and any other documentation attached to your work — and for having the right to upload and display it.',
      ],
    },
    {
      heading: '3. Buyers, sourcing, and enquiries',
      body: [
        'Buyers and organizations may browse public artist profiles and submit sourcing briefs or enquiries. ARTBANK helps surface relevant matches, but does not automatically create contracts, agreements, or commitments on behalf of either party — every engagement requires the artist’s (or their guardian’s) explicit review and approval.',
        'Any terms of sale, commission, licensing, or collaboration are agreed directly between the artist and the buyer. ARTBANK is not a party to those agreements.',
      ],
    },
    {
      heading: '4. Prohibited conduct',
      body: [
        'You agree not to misrepresent your identity or affiliations, upload work you don’t have the right to share, harass or misrepresent yourself to other users, or attempt to circumvent the platform’s identity or guardian-approval safeguards.',
      ],
    },
    {
      heading: '5. Identity & verification',
      body: [
        'ARTBANK currently uses email/password sign-in as an interim identity path while JO1N ID — an external identity provider — is being finalized. Once available, JO1N ID will become the primary way to verify your identity on ARTBANK.',
      ],
    },
    {
      heading: '6. Fees & payments',
      body: [
        'ARTBANK does not currently process payments between artists and buyers. Any commercial terms are arranged directly between the parties involved. Should ARTBANK introduce paid tools, memberships, or in-platform payment processing in the future, those will be governed by updated terms presented to you before you’re charged.',
      ],
    },
    {
      heading: '7. Termination',
      body: [
        'You may stop using ARTBANK and request account deletion at any time. We may suspend or terminate accounts that violate these Terms.',
      ],
    },
    {
      heading: '8. Disclaimers',
      body: [
        'ARTBANK is provided "as is." We don’t guarantee that using the platform will result in sales, opportunities, or any particular outcome for artists or buyers.',
      ],
    },
    {
      heading: '9. Changes to these Terms',
      body: [
        'We may update these Terms as ARTBANK evolves. Material changes will be communicated before they take effect.',
      ],
    },
    {
      heading: '10. Contact',
      body: ['Questions about these Terms can be sent to legal@artbank.world.'],
    },
  ],
};

export const privacyContent: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'Last updated: 20 August 2026',
  intro:
    'This Privacy Policy explains what information ARTBANK collects, how we use it, and the choices you have — for artists, buyers, and guardians using the platform.',
  sections: [
    {
      heading: '1. Information we collect',
      body: [
        'Account information: your email address and password (handled securely by our authentication provider, Supabase — ARTBANK never sees or stores your password directly).',
        'Profile & professional information: anything you choose to add to your ArtSpace profile — role (artist or buyer), organization, country, and collecting or professional interests.',
        'Artwork & documentation: images, descriptions, and history records you upload for your work.',
        'Usage data: basic activity like profile views and enquiry activity, shown back to you inside ArtSpace.',
      ],
    },
    {
      heading: '2. How we use your information',
      body: [
        'To operate your account and ArtSpace, to connect artists with relevant buyer enquiries, and to show you activity relevant to your own profile (like profile views or new matches).',
        'We do not sell your personal information to third parties.',
      ],
    },
    {
      heading: '3. Identity providers',
      body: [
        'ARTBANK currently authenticates accounts through Supabase Auth as an interim path. Once JO1N ID (an external identity provider) is live, it will become the primary way accounts are verified, and this policy will be updated to reflect what JO1N ID shares with ARTBANK.',
      ],
    },
    {
      heading: '4. Minors & guardian accounts',
      body: [
        'Where an account belongs to a minor, it is linked to a verified guardian account. Guardians can view and manage the minor’s ArtSpace, and any external enquiry or opportunity involving a minor’s work requires the guardian’s approval before it proceeds.',
      ],
    },
    {
      heading: '5. What buyers can see',
      body: [
        'Buyers can only see the parts of an artist’s profile and work that the artist has chosen to make public. Private performance data — like enquiry history or profile analytics — is visible only to the artist (or their guardian).',
      ],
    },
    {
      heading: '6. Data retention & security',
      body: [
        'We retain account and profile data for as long as your account is active. You can request deletion of your account and associated data at any time.',
      ],
    },
    {
      heading: '7. Your rights',
      body: [
        'You can access, correct, or request deletion of your personal information by contacting us using the details below.',
      ],
    },
    {
      heading: '8. Cookies',
      body: [
        'ARTBANK uses cookies for essential functions like keeping you signed in. See our Cookie Policy for details.',
      ],
    },
    {
      heading: '9. Changes to this policy',
      body: [
        'We may update this Privacy Policy as ARTBANK evolves. Material changes will be communicated before they take effect.',
      ],
    },
    {
      heading: '10. Contact',
      body: ['Questions about this policy, or requests about your data, can be sent to privacy@artbank.world.'],
    },
  ],
};

export const cookiesContent: LegalDoc = {
  title: 'Cookie Policy',
  updated: 'Last updated: 20 August 2026',
  intro:
    'This Cookie Policy explains what cookies and similar technologies ARTBANK currently uses, and why.',
  sections: [
    {
      heading: '1. What are cookies',
      body: [
        'Cookies are small pieces of data stored in your browser. Some are essential for a site to function; others are used for preferences, analytics, or advertising.',
      ],
    },
    {
      heading: '2. What ARTBANK currently uses',
      body: [
        'ARTBANK currently uses only strictly necessary cookies and local storage — specifically, the session token that keeps you signed in, managed by our authentication provider, Supabase.',
        'As of this version, ARTBANK does not use advertising cookies or third-party analytics tracking. If that changes, this policy will be updated first, and — where required — you’ll be asked for consent.',
      ],
    },
    {
      heading: '3. Managing cookies',
      body: [
        'Because the only cookie ARTBANK sets today is required to keep you signed in, blocking it will sign you out. You can manage or clear cookies at any time through your browser settings.',
      ],
    },
    {
      heading: '4. Changes to this policy',
      body: [
        'We’ll update this page if the cookies ARTBANK uses change — for example, if analytics or additional features are introduced.',
      ],
    },
    {
      heading: '5. Contact',
      body: ['Questions about this policy can be sent to privacy@artbank.world.'],
    },
  ],
};
