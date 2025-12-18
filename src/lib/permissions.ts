/**
 * Permission constants based on the API documentation and requirements.
 * Using these constants ensures consistency and type safety throughout the application.
 */

export const PERMISSIONS = {
    // Profile
    PROFILE_VIEW: 'view:profile',
    PROFILE_UPDATE: 'update:profile',

    // Events
    EVENT_READ: 'read:event',
    EVENT_CREATE: 'create:event',
    EVENT_UPDATE: 'update:event',
    EVENT_DELETE: 'delete:event',
    EVENT_APPROVE: 'approve:event',
    EVENT_REJECT: 'reject:event',
    EVENT_HOLD: 'hold:event',

    // Users
    USER_READ: 'read:user',
    USER_CREATE: 'create:user',
    USER_UPDATE: 'update:user',
    USER_DELETE: 'delete:user',
    ORGANIZER_APPROVE: 'approve:organizer',
    ORGANIZER_REJECT: 'reject:organizer',

    // Tickets
    TICKET_CREATE: 'create:ticket',
    TICKET_READ: 'read:ticket',
    TICKET_SCAN: 'scan:ticket',
    TICKET_CHECKIN: 'checkin:ticket',
    TICKET_CHECKOUT: 'checkout:ticket',

    // Staff
    STAFF_MANAGE: 'manage:staff',

    // Payouts
    PAYOUT_CREATE: 'create:payout',
    PAYOUT_READ: 'read:payout',
    PAYOUT_UPDATE: 'update:payout',

    // Financial
    FINANCIAL_READ: 'read:financial',
    FINANCIAL_CREATE: 'create:financial',
    FINANCIAL_UPDATE: 'update:financial',
    FINANCIAL_SUMMARY: 'summary:financial',
    FINANCIAL_SALES: 'sales:financial',
    FINANCIAL_BILLS: 'bills:financial',

    // Analytics
    ANALYTICS_READ: 'read:analytics',

    // Admin Only
    ADMIN_FULL: 'admin:full',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
