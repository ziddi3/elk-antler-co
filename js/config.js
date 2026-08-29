/* =====================================================================
   STOREFRONT RUNTIME CONFIGURATION — Bircham Elk & Antler Co.
   =====================================================================
   Customer payments are collected by Methodz through Stripe in CAD.
   Methodz owns payment orchestration, CRM, routing, lifecycle automation,
   reporting and downstream settlement to the seller/operator.
   ===================================================================== */

window.STORE_CONFIG = {
  storeName: "Bircham Elk & Antler Co.",
  currency: "CAD",
  taxBehavior: "exclusive_plus_gst",
  gstRate: 0.05,
  freeShippingThreshold: 45,
  shippingFlatRate: 7.95,
  paymentProvider: "methodz_stripe",
  checkoutEndpoint: "/api/checkout",
  supportEmail: "orders@birchamelkantler.com",
  operationalEmail: "LECINC123@gmail.com",
  phone: "403-869-1869"
};
