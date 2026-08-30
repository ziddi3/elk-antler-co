export const AUTOMATION_CONFIG = {
  provider: 'methodz',
  crm: { status: 'active', endpoint: '/api/webhooks/lead' },
  customerProfiles: { status: 'partial', basis: 'CRM lead/contact ingestion' },
  orderNotifications: { status: 'active-via-stripe-lifecycle-and-smtp' },
  transactionalEmail: { status: 'active-when-smtp-configured' },
  automatedFollowups: { status: 'active-lifecycle-job-queue' },
  abandonedCartReminders: { status: 'active-when-stripe-expired-session-contains-email' },
  reviewRequests: { status: 'active-when-BIRCHAM_REVIEW_URL-configured' },
  salesReporting: { status: 'active-from-purchase-events' },
  inventoryReporting: { status: 'not-implemented' },
  methodHubIntegration: { status: 'canonical-dock-relationship-not-runtime-automation' },
  supportAI: { status: 'future' }
};
