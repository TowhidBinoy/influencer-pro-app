// lib/endpoints.js
// Single source of truth for the backend base URL and every documented
// endpoint (doc/API.md). Mirrors mrs-g6-frontend's app/api/api.js —
// pure constants, no fetch logic (that's lib/api.js).

export const BASE_URL = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/login/admin-access-token/',
    MEMBER_LOGIN: '/login/member-access-token/',
    REFRESH_TOKEN: '/login/refresh-token/',
    VERIFY_TOKEN: '/login/verify-token/',
    LOGOUT: '/login/logout/',
  },

  ADMIN: {
    // 6. Admin users
    USERS: '/admins/users/',
    USER: (uuid) => `/admins/users/${uuid}/`,
    USER_RESET_PASSWORD: (uuid) => `/admins/users/${uuid}/resetpassword/`,
    USER_ARCHIVE: (uuid) => `/admins/users/${uuid}/archive/`,

    // 7. Activity log
    ACTIVITY_LOG: '/admins/activity-log/',
    ACTIVITY_LOG_SINGLE: (uuid) => `/admins/activity-log/${uuid}/`,

    // 8. Dashboard KPI
    DASHBOARD_KPI: '/admins/dashboard/kpi/',

    // 9. Members
    MEMBERS: '/members/',
    MEMBER: (uuid) => `/members/${uuid}/`,
    MEMBER_CHANGE_PASSWORD: (uuid) => `/members/${uuid}/change-password/`,
    MEMBER_ARCHIVE: (uuid) => `/members/${uuid}/archive/`,

    // 10. Member bank details (read-only for admin)
    MEMBER_BANK_DETAILS: (memberUuid) => `/members/${memberUuid}/bank-details/`,
    MEMBER_BANK_DETAIL: (memberUuid, uuid) => `/members/${memberUuid}/bank-details/${uuid}/`,

    // 10a. Member login audit (read-only, admin-only)
    MEMBER_AUDIT_LOGIN: (memberUuid) => `/members/${memberUuid}/audit_login/`,
    MEMBER_AUDIT_LOGIN_SINGLE: (memberUuid, uuid) => `/members/${memberUuid}/audit_login/${uuid}/`,

    // 11. Orgs (companies)
    ORGS: '/jobs/org/',
    ORG: (uuid) => `/jobs/org/${uuid}/`,
    ORG_ARCHIVE: (uuid) => `/jobs/org/${uuid}/archive/`,

    // 12. Jobs
    JOBS: (orgUuid) => `/jobs/org/${orgUuid}/job/`,
    JOB: (orgUuid, uuid) => `/jobs/org/${orgUuid}/job/${uuid}/`,
    JOB_ARCHIVE: (orgUuid, uuid) => `/jobs/org/${orgUuid}/job/${uuid}/archive/`,

    // 12a. Job list, all orgs (flat — no org uuid needed)
    JOB_LIST: '/jobs/list/',
    JOB_LIST_SINGLE: (uuid) => `/jobs/list/${uuid}/`,

    // 13. Job requirements
    JOB_REQUIREMENTS: (orgUuid, jobUuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/requirement/`,
    JOB_REQUIREMENT: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/requirement/${uuid}/`,
    JOB_REQUIREMENT_ARCHIVE: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/requirement/${uuid}/archive/`,

    // 14. Frames on a job
    JOB_FRAMES: (orgUuid, jobUuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/frames/`,
    JOB_FRAME: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/frames/${uuid}/`,
    JOB_FRAME_ARCHIVE: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/frames/${uuid}/archive/`,

    // 14a. Frame library (all jobs, flat — no org/job uuid needed in the path)
    FRAME_LIBRARY: '/frame/library/',
    FRAME_LIBRARY_ITEM: (uuid) => `/frame/library/${uuid}/`,
    FRAME_LIBRARY_ARCHIVE: (uuid) => `/frame/library/${uuid}/archive/`,

    // 35a. Rendered content library — raw Frame Editor uploads, admin-only
    RENDERED_CONTENT: '/frame/content/',
    RENDERED_CONTENT_ITEM: (uuid) => `/frame/content/${uuid}/`,

    // 15. Submissions (nested under a job)
    SUBMISSIONS: (jobUuid) => `/jobs/job/${jobUuid}/submission/`,
    SUBMISSIONS_PENDING: (jobUuid) => `/jobs/job/${jobUuid}/submission/pending/`,
    SUBMISSIONS_APPROVED: (jobUuid) => `/jobs/job/${jobUuid}/submission/approved/`,
    SUBMISSIONS_REJECTED: (jobUuid) => `/jobs/job/${jobUuid}/submission/rejected/`,
    SUBMISSION: (jobUuid, uuid) => `/jobs/job/${jobUuid}/submission/${uuid}/`,
    SUBMISSION_APPROVE: (jobUuid, uuid) => `/jobs/job/${jobUuid}/submission/${uuid}/approve/`,
    SUBMISSION_REJECT: (jobUuid, uuid) => `/jobs/job/${jobUuid}/submission/${uuid}/reject/`,

    // 15a. Results (nested under a job) — display-only performance metrics
    RESULTS_PENDING: (jobUuid) => `/jobs/job/${jobUuid}/result/pending/`,
    RESULTS_MEMBER: (jobUuid, memberUuid) => `/jobs/job/${jobUuid}/result/member/${memberUuid}/`,

    // 16. Member job applications, admin side (approve/reject/complete)
    JOB_MEMBERS: (orgUuid, jobUuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/member/`,
    JOB_MEMBER: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/member/${uuid}/`,
    JOB_MEMBER_APPROVE: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/member/${uuid}/approve/`,
    JOB_MEMBER_REJECT: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/member/${uuid}/reject/`,
    JOB_MEMBER_COMPLETE: (orgUuid, jobUuid, uuid) => `/jobs/org/${orgUuid}/job/${jobUuid}/member/${uuid}/complete/`,

    // 16a. Pending applications, all jobs (flat — no org/job uuid needed)
    APPLICATIONS_PENDING: '/jobs/applications/pending/',
    APPLICATIONS_PENDING_SINGLE: (uuid) => `/jobs/applications/pending/${uuid}/`,

    // 18. Job settings (singleton)
    JOB_SETTINGS: '/jobs/settings/',

    // 19. Payouts
    PAYOUTS: '/earnings/payouts/',
    PAYOUT: (uuid) => `/earnings/payouts/${uuid}/`,
    PAYOUT_MARK_PAID: (uuid) => `/earnings/payouts/${uuid}/mark-paid/`,
    PAYOUT_ARCHIVE: (uuid) => `/earnings/payouts/${uuid}/archive/`,

    // 20. Earnings statistics / 21. Earnings KPI
    EARNINGS_STATISTICS: '/earnings/statistics/',
    EARNINGS_KPI: '/earnings/kpi/',

    // 20a-20b. Influencer leaderboard (third-party proxy) — IsAuthenticated
    // since API 1.6, both roles can call this (see MEMBER copy below too)
    INFLUENCER_LEADERBOARD: '/front-view/influencer/leaderboard/',
    INFLUENCER_RANK: (phoneNumber) => `/front-view/influencer/rank/${phoneNumber}/`,

    // 22. Banners
    BANNERS: '/front-view/banners/',
    BANNER: (uuid) => `/front-view/banners/${uuid}/`,
    BANNER_ARCHIVE: (uuid) => `/front-view/banners/${uuid}/archive/`,

    // 23. Guides
    GUIDES: '/front-view/guides/',
    GUIDE: (uuid) => `/front-view/guides/${uuid}/`,
    GUIDE_ARCHIVE: (uuid) => `/front-view/guides/${uuid}/archive/`,

    // 24. Terms & conditions (no archive action)
    TERMS: '/front-view/terms/',
    TERM: (uuid) => `/front-view/terms/${uuid}/`,

    // 35. Notifications (own feed, admin role)
    NOTIFICATIONS: '/notifications/',
    NOTIFICATION: (uuid) => `/notifications/${uuid}/`,
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread_count/',
    NOTIFICATION_READ: (uuid) => `/notifications/${uuid}/read/`,
    NOTIFICATIONS_READ_ALL: '/notifications/read-all/',
  },

  MEMBER: {
    // 25. Profile
    PROFILE: '/members/profile/',

    // 26. Change password (self-service, requires current_password)
    CHANGE_PASSWORD: '/members/profile/change-password/',

    // 27. Own bank details
    BANK_DETAILS: '/members/profile/bank-details/',
    BANK_DETAIL: (uuid) => `/members/profile/bank-details/${uuid}/`,
    BANK_DETAIL_ARCHIVE: (uuid) => `/members/profile/bank-details/${uuid}/archive/`,

    // 28. Platform accounts
    PLATFORM_ACCOUNTS: '/members/profile/platform-accounts/',
    PLATFORM_ACCOUNT: (uuid) => `/members/profile/platform-accounts/${uuid}/`,
    PLATFORM_ACCOUNT_ARCHIVE: (uuid) => `/members/profile/platform-accounts/${uuid}/archive/`,

    // 29. Job board
    AVAILABLE_JOBS: (memberUuid) => `/members/${memberUuid}/available-jobs/`,
    AVAILABLE_JOB: (memberUuid, uuid) => `/members/${memberUuid}/available-jobs/${uuid}/`,
    AVAILABLE_JOB_APPLY: (memberUuid, uuid) => `/members/${memberUuid}/available-jobs/${uuid}/apply/`,

    // 30. My jobs (GET only — see ADMIN.MEMBER_JOBS for the same path's admin actions)
    MY_JOBS: (memberUuid) => `/members/${memberUuid}/jobs/`,
    JOBS_PENDING_RESULTS: (memberUuid) => `/members/${memberUuid}/jobs/pending-results/`,
    JOB_PENDING_RESULTS: (memberUuid, memberJobUuid) => `/members/${memberUuid}/jobs/${memberJobUuid}/pending-results/`,

    // 31. Frames for a job
    JOB_FRAMES: (memberUuid, jobUuid) => `/members/${memberUuid}/jobs/${jobUuid}/frames/`,
    JOB_FRAME: (memberUuid, jobUuid, uuid) => `/members/${memberUuid}/jobs/${jobUuid}/frames/${uuid}/`,

    // 14c. Frame Editor render (standalone — not nested under a task/job/org)
    FRAME_RENDER: (frameUuid) => `/frame/${frameUuid}/render/`,
    FRAME_RENDER_ITEM: (frameUuid, uuid) => `/frame/${frameUuid}/render/${uuid}/`,
    FRAME_RENDER_DOWNLOADED: (frameUuid, uuid) => `/frame/${frameUuid}/render/${uuid}/downloaded/`,

    // 32. Tasks
    TASKS: (memberUuid) => `/members/${memberUuid}/tasks/`,
    TASKS_TODAY: (memberUuid) => `/members/${memberUuid}/tasks/today/`,
    TASK: (memberUuid, uuid) => `/members/${memberUuid}/tasks/${uuid}/`,
    TASK_SUBMIT: (memberUuid, uuid) => `/members/${memberUuid}/tasks/${uuid}/submit/`,
    TASK_CONTENT: (memberUuid, uuid) => `/members/${memberUuid}/tasks/${uuid}/content/`,
    TASK_CONTENT_FILE: (memberUuid, uuid, fileUuid) => `/members/${memberUuid}/tasks/${uuid}/content/${fileUuid}/`,
    TASK_RESULT: (memberUuid, uuid) => `/members/${memberUuid}/tasks/${uuid}/result/`,

    // 33. Earnings / 34. Missed / 35. My payouts
    EARNINGS: (memberUuid) => `/members/${memberUuid}/earnings/`,
    MISSED: (memberUuid) => `/members/${memberUuid}/missed/`,
    PAYOUTS: (memberUuid) => `/members/${memberUuid}/payouts/`,

    // 21-23. Banners / Guides / Terms — IsAuthenticated (not IsAdmin), so
    // members read the same routes admins manage. The old /front-view/content/
    // aggregator these used to point to no longer exists in the API (removed
    // since 1.1) — members read banners/guides/terms directly instead.
    BANNERS: '/front-view/banners/',
    BANNER: (uuid) => `/front-view/banners/${uuid}/`,
    // Live-window banners only, bare array, not paginated — for display.
    BANNERS_PUBLIC: '/front-view/banners/public/',
    GUIDES: '/front-view/guides/',
    GUIDE: (uuid) => `/front-view/guides/${uuid}/`,
    TERMS: '/front-view/terms/',
    TERM: (uuid) => `/front-view/terms/${uuid}/`,

    // 20a-20b. Influencer leaderboard (third-party proxy) — relaxed from
    // IsAdmin to IsAuthenticated in API 1.6, members can call this directly now
    INFLUENCER_LEADERBOARD: '/front-view/influencer/leaderboard/',
    INFLUENCER_RANK: (phoneNumber) => `/front-view/influencer/rank/${phoneNumber}/`,

    // 35. Notifications (own feed, member role)
    NOTIFICATIONS: '/notifications/',
    NOTIFICATION: (uuid) => `/notifications/${uuid}/`,
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread_count/',
    NOTIFICATION_READ: (uuid) => `/notifications/${uuid}/read/`,
    NOTIFICATIONS_READ_ALL: '/notifications/read-all/',
  },
};
