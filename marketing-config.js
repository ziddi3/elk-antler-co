export const MARKETING_CONFIG = {
  provider: 'methodz',
  eventBoundary: {
    status: 'wired',
    storefrontEndpoint: '/api/events',
    conductorEndpoint: '/api/events/storefront'
  },
  analytics: {
    methodzFirstParty: { status: 'active' },
    googleAnalytics: {
      status: 'conductor-exporter',
      requiredRuntimeConfig: ['GA_MEASUREMENT_ID', 'GA_API_SECRET']
    },
    googleSearchConsole: {
      status: 'external-verification-required'
    },
    metaConversionsApi: {
      status: 'conductor-exporter',
      requiredRuntimeConfig: ['META_PIXEL_ID', 'META_CONVERSIONS_API_TOKEN', 'META_GRAPH_API_VERSION']
    },
    metaPixel: {
      status: 'replaced-by-server-side-conductor-export'
    }
  },
  lifecycle: {
    transactionalEmail: { status: 'conductor-queue', requiredRuntimeConfig: ['SMTP_HOST', 'SMTP_FROM'] },
    reviewRequests: { status: 'wired-when-review-url-configured', requiredRuntimeConfig: ['BIRCHAM_REVIEW_URL'] },
    abandonedCart: { status: 'wired-from-stripe-session-expired' },
    automatedFollowups: { status: 'conductor-queue' },
    discountCodes: { status: 'not-implemented' }
  }
};
