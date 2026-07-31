export const typography = {
  // Tier 1: Page Hero Title (Main Screen Titles)
  pageTitle: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900' as const,
    className: 'text-4xl font-black text-slate-900',
  },

  // Tier 2: Page Subheader (Screen Subtitles)
  pageSubheader: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    className: 'text-base text-slate-500 mt-1.5',
  },

  // Tier 3: Section Title (Major Module Sections)
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
    className: 'text-2xl font-extrabold text-slate-900',
  },

  // Tier 4: Section Subtitle (Section Descriptions)
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    className: 'text-base text-slate-500 mt-1',
  },

  // Tier 5: Card Title (Card & Modal Headers)
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800' as const,
    className: 'text-xl font-extrabold text-slate-900',
  },

  // Tier 6: Item Header / Button Text / Key Identifiers
  itemTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700' as const,
    className: 'text-base font-bold text-slate-900',
  },

  // Tier 7: Body Text / Details
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    className: 'text-base text-slate-700',
  },

  // Tier 8: Caption / Metadata / Status Badges
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
    className: 'text-sm font-bold text-slate-500',
  },
} as const;
