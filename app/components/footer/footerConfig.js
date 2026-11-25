/**
 * Influencer Pro - Bottom Navigation Configuration
 */

export const FOOTER_CONFIG = {
  navItems: [
    {
      id: 'campaign',
      label: 'Campaigns',
      link: '/campaign',
      iconName: 'campaign',
    },
    {
      id: 'leaderboard',
      label: 'Rankings',
      link: '/leaderboard',
      iconName: 'leaderboard',
    },
    {
      id: 'home',
      label: 'Home',
      link: '/dashboard',
      isCenter: true,
      iconName: 'home',
    },
    {
      id: 'submit-proof',
      label: 'Submit Proof',
      link: '/submit-proof',
      iconName: 'submit',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      link: '/earnings',
      iconName: 'earnings',
    },
  ],
};

export const FOOTER_THEME = {
  background: '#0f0b1e',
  borderColor: '#231A3D',
  activeColor: '#B13CFF',
  inactiveColor: '#94A3B8',
};