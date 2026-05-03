// Google AdSense Configuration
export const AD_NETWORKS = {
  googleAdSense: {
    publisherId: 'ca-pub-1207458044982701',
    enabled: true,
  },
};

export const AD_SLOTS = {
  // Hero Banner - Top of page (728x90 or 970x90)
  heroBanner: {
    slotId: '6601970930',
    width: 970,
    height: 90,
    format: 'horizontal',
    cpm: '$8-15',
    placement: 'top',
    revenue: '$300-800/month (100k visitors)',
  },
  // Sidebar Premium - High visibility (300x250)
  sidebarPremium: {
    slotId: '2009877398',
    width: 300,
    height: 250,
    format: 'rectangle',
    cpm: '$10-20', // HIGHEST CPM
    placement: 'sidebar-sticky',
    revenue: '$300-750/month (100k visitors)',
  },
  // In-Content Native Ad
  inContentNative: {
    slotId: '1359140704',
    width: 728,
    height: 90,
    format: 'native',
    cpm: '$5-12',
    placement: 'between-content',
    revenue: '$200-480/month (100k visitors)',
  },
  // Footer Leaderboard - Last impression (728x90)
  footerLeaderboard: {
    slotId: '9046059037',
    width: 728,
    height: 90,
    format: 'horizontal',
    cpm: '$2-4',
    placement: 'footer',
    revenue: '$80-240/month (100k visitors)',
  },
};

export const TOTAL_REVENUE_POTENTIAL = {
  '100k_visitors': '$980-2275/month',
  '500k_visitors': '$4900-11375/month',
  '1m_visitors': '$9800-22750/month',
};
