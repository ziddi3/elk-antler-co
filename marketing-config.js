export const MARKETING_CONFIG = {
  provider: "methodz",
  analytics: {
    googleAnalytics: { enabled: true, routedThroughMethodz: true },
    googleSearchConsole: { enabled: true, verificationManagedExternally: true },
    metaPixel: { enabled: true, routedThroughMethodz: true }
  },
  lifecycle: {
    emailMarketing: { enabled: true, provider: "methodz" },
    reviewRequests: { enabled: true, provider: "methodz" },
    discountCodes: { enabled: true, provider: "methodz" },
    abandonedCart: { enabled: true, provider: "methodz" },
    automatedFollowups: { enabled: true, provider: "methodz" }
  }
};
