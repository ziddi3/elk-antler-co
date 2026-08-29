export const STORE_CONFIG = {
  storeName: "Bircham Elk Antler",
  mode: "ecommerce",

  // Canonical commerce architecture: Methodz collects payment first,
  // then settles Bircham Elk & Antler Co. downstream.
  commerceOwner: "methodz",
  paymentGateway: "methodz_stripe",
  currency: "CAD",
  taxBehavior: "exclusive_plus_gst",

  // Customer-facing store capabilities.
  shippingZones: ["Canada", "United States", "International"],
  inventoryTracking: true,

  // Methodz replaces GoHighLevel for CRM, lead routing and automation.
  crmProvider: "methodz",
  leadRouter: "methodz",
  customerDatabase: "methodz",
  orderNotifications: "methodz",
  automatedFollowups: "methodz",
  abandonedCart: "methodz",
  analyticsRouter: "methodz",

  // This storefront is a seller/merchant endpoint, not a PPL buyer.
  leadScraperEnabled: false,
  pplMatchingEnabled: false,

  supportContact: "orders@birchamelkantler.com"
};
