export const STORE_CONFIG = {
  storeName: "Bircham Elk Antler",
  legalOperator: "LEC Learn Experience Contribute Inc.",
  mode: "ecommerce",

  // Canonical commerce architecture: Methodz collects payment first,
  // then settles the underlying seller/operator downstream.
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

  customerSupportEmail: "orders@birchamelkantler.com",
  operationalEmail: "LECINC123@gmail.com",
  phone: "403-869-1869"
};
