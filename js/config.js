/* =====================================================================
   STORE CONFIGURATION  —  Elk & Antler Co.
   =====================================================================
   👋 MOM, THIS IS THE ONLY FILE YOU NEED TO EDIT TO START TAKING PAYMENTS!

   STEP 1 — Get your free PayPal Client ID:
     1. Go to  https://www.paypal.com/  and sign up for a FREE Business
        account (it's free — PayPal only takes a small fee per sale).
     2. Go to  https://developer.paypal.com/dashboard/  and log in.
     3. Click "Apps & Credentials" → make sure the toggle says "Live".
     4. Click "Create App", give it a name (e.g. "Elk Antler Store"),
        and copy the "Client ID" it shows you.

   STEP 2 — Paste that Client ID below, replacing the word
            REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID

   STEP 3 — Save the file. That's it — checkout now sends money to YOU. 🎉

   (While the placeholder is here, the site runs in DEMO mode so you can
    still click around and test everything safely.)
   ===================================================================== */

window.STORE_CONFIG = {
  storeName: "Elk & Antler Co.",
  currency: "USD",                 // change to "CAD" for Canadian dollars
  freeShippingThreshold: 45,       // free shipping over this amount
  shippingFlatRate: 7.95,          // shipping charged under the threshold

  // 👇 PASTE YOUR PAYPAL CLIENT ID HERE 👇
  paypalClientId: "REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID"
};
