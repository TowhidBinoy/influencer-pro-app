/**
 * Influencer Pro - Hamburger Drawer Menu Configuration
 */

export const MENU_CONFIG = {
  mainNav: {
    title: "Main Portal",
    items: [
      { label: "Dashboard", link: "/dashboard", iconName: "home" },
      { label: "Campaigns & Tasks", link: "/campaign", iconName: "campaign" },
      { label: "Submit Proof", link: "/submit-proof", iconName: "submit" },
      { label: "Earnings & Payouts", link: "/earnings", iconName: "earnings" },
      { label: "Leaderboard", link: "/leaderboard", iconName: "leaderboard" },
      { label: "My Profile", link: "/profile", iconName: "profile" },
    ],
  },
  support: {
    title: "Support & Help",
    items: [
      { label: "Contact Support", action: "support", iconName: "support" },
      { label: "Log Out", action: "logout", iconName: "logout" },
    ],
  },
};

export const ANIMATION_CONFIG = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  sidebar: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  section: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.25 },
  },
};