// lib/choices.js
// Every enum from doc/API.md §5, as uuid/int -> label maps. Single source
// of truth — pages import from here instead of redefining their own copy.
// A couple of labels intentionally read friendlier than the doc's raw enum
// name (e.g. submission status 2 "SUBMITTED" is shown as "Awaiting Review")
// to match the UX language already established across the admin pages.

export const ADMIN_STATUS = { 1: 'Active', 2: 'Inactive' };

export const MEMBER_STATUS = { 1: 'Active', 2: 'Inactive', 3: 'Suspended' };

export const PLATFORM = { 1: 'Instagram', 2: 'TikTok' };

export const COMPANY_STATUS = { 1: 'Active', 2: 'Inactive' };

export const JOB_STATUS = { 1: 'Draft', 2: 'Active', 3: 'Paused', 4: 'Completed' };

export const JOB_RECURRENCE = { 1: 'Daily', 2: 'Weekly', 3: 'Monthly' };

export const PAYMENT_PERIOD = { 1: 'Daily', 2: 'Weekly', 3: 'Monthly' };

export const CONTENT_TYPE = { 1: 'Reel', 2: 'Story', 3: 'Post', 4: 'Video' };

export const MEMBER_JOB_STATUS = { 1: 'Applied', 2: 'Active', 3: 'Completed', 4: 'Rejected' };

export const AFFILIATE_LINK_STATUS = { 1: 'Pending', 2: 'Submitted', 3: 'Active', 4: 'Paused' };

// "Member task status" in the doc — used on job submissions/tasks.
export const SUBMISSION_STATUS = { 1: 'Pending', 2: 'Awaiting Review', 3: 'Approved', 4: 'Rejected', 5: 'Missed' };

export const TASK_FILE_MEDIA_TYPE = { 1: 'Video', 2: 'Photo' };

export const FRAME_ASPECT_RATIO = { 1: '9:16', 2: '1:1', 3: '4:5' };

// Numeric width/height ratios for FRAME_ASPECT_RATIO, for consumers (the
// Frame Editor crop stage) that need a number rather than a label — e.g.
// react-easy-crop's `aspect` prop and CSS `aspect-ratio`.
export const FRAME_ASPECT_RATIO_VALUE = { 1: 9 / 16, 2: 1, 3: 4 / 5 };

export const FRAME_MEDIA_TYPE = { 1: 'Both', 2: 'Video', 3: 'Photo' };

export const FRAME_STATUS = { 1: 'Active', 2: 'Inactive' };

export const RENDER_STATUS = { 1: 'Processing', 2: 'Done', 3: 'Failed' };

export const PAYOUT_STATUS = { 1: 'Pending', 2: 'Paid' };

export const BANNER_LOCATION = { 1: 'Home Banner', 2: 'Event Banner', 3: 'Post of the Day' };

export const GUIDE_LOCATION = {
  1: 'Home', 2: 'Mission Today', 3: 'Earning', 4: 'Missed', 5: 'Rules',
  6: 'Leaderboard', 7: 'Job Board', 8: 'Affiliate Links', 9: 'Profile', 10: 'Bank Details',
};

export const TERMS_CATEGORY = { 1: 'Earnings', 2: 'Leaderboard', 3: 'Job' };

export const NOTIFICATION_TYPE = {
  1: 'Job Posted', 2: 'Task Assigned', 3: 'Task Submitted', 4: 'Task Approved', 5: 'Task Rejected',
};

export const BANK = {
  1: 'Maybank', 2: 'CIMB Bank', 3: 'Public Bank', 4: 'RHB Bank', 5: 'Hong Leong Bank',
  6: 'Ambank', 7: 'Bank Islam Malaysia', 8: 'Bank Rakyat', 9: 'Affin Bank', 10: 'Alliance Bank',
  11: 'UOB', 12: 'HSBC Bank', 13: 'Standard Chartered Bank', 14: 'OCBC Bank', 15: 'Citibank',
  16: 'Agrobank', 17: 'Bank Muamalat', 18: 'BSN', 19: 'Big Pay', 20: 'Touch N Go', 21: 'GX Bank',
};
