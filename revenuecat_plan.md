# RevenueCat Web Billing Integration Plan

## 1. Preparation & Prerequisites - DONE
- **Stripe Account:** Ensure you have a Stripe account connected to RevenueCat.
- **RevenueCat Project:** Set up a project in the RevenueCat dashboard.
- **Web Billing Platform:** In RevenueCat, add a Web Billing platform to your project (Project settings > Platforms > Add Web Billing).
- **App Configuration:** Fill in required fields (Stripe account, default currency, app name, support email, store URLs, appearance, etc.).
- **API Keys:** Note the Public API Key (for production) and Sandbox API Key (for testing).

## 2. Product, Entitlement, and Offering Setup - DONE
- **Entitlements:** Define entitlements in RevenueCat (e.g., "premium", "pro", etc.).
- **Products:** Create products in RevenueCat, associating them with your Web Billing app. Set identifiers, titles, descriptions, product type (subscription, consumable, non-consumable), duration, price, and trial/grace period as needed.
- **Offerings:** Group products into offerings for flexible paywall presentation.

## 3. Install RevenueCat Web SDK - DONE
- In your project root, install the SDK:
  ```bash
  npm install --save @revenuecat/purchases-js
  ```
- Confirm the package is listed in `package.json`.

## 4. Authentication & User Identification - TO DO
- **Identified Customers:**  
  - Use your existing authentication (Supabase, see `src/contexts/AuthContext.tsx`) to provide a unique App User ID to RevenueCat.
  - This enables cross-platform subscription access.

---

## Supabase Integration Details

- **Authentication:**
  - Users are authenticated via Supabase, and their profile is loaded from the `profiles` table.
  - The unique user ID (`user.id`) from Supabase is available via the `useAuth()` context.
- **RevenueCat Integration:**
  - Use the Supabase user’s `id` as the `appUserId` when configuring RevenueCat’s SDK:
    ```js
    const purchases = Purchases.configure({
      apiKey: WEB_BILLING_PUBLIC_API_KEY,
      appUserId: user.id, // from Supabase AuthContext
    });
    ```
  - This ensures subscriptions and entitlements are always mapped to the correct authenticated user.
- **Best Practices:**
  - Always use the Supabase user ID as the RevenueCat `appUserId` for all SDK calls.
  - Protect premium features on the backend (if needed) by checking the user’s subscription status before serving premium data.
  - Keep Supabase and RevenueCat user records in sync if you ever implement account deletion or merging.

---

# Built-in Paywall Integration

Follow these steps to implement RevenueCat's built-in paywall for a simple, consistent, and future-proof solution:

1. **SDK Initialization**
   - Initialize the SDK in your top-level React component (e.g., `src/App.tsx`) or a dedicated provider.
   - Use the Public API Key and the current user's ID from your Supabase auth context (`user.id`).
   - Example:
     ```js
     import Purchases from '@revenuecat/purchases-js';
     const purchases = Purchases.configure({
       apiKey: WEB_BILLING_PUBLIC_API_KEY,
       appUserId: user.id, // from Supabase AuthContext
     });
     ```

2. **Fetch Offerings When Paywall is Opened**
   - When the user opens the paywall (e.g., in your `PaywallModal.tsx`), fetch the current offerings:
     ```js
     const offerings = await Purchases.getOfferings();
     // Use offerings.current to access the active offering and its packages
     ```

3. **Display RevenueCat's Built-in Purchase Flow**
   - Present the available packages (products) from the offering in your UI.
   - When the user selects a package, trigger the purchase using the SDK:
     ```js
     const purchaseResult = await Purchases.purchasePackage(selectedPackage);
     ```
   - RevenueCat will handle the payment UI, compliance, and payment method selection.

4. **Handle Purchase Results and Entitlements**
   - On successful purchase, check the user's entitlements to unlock features:
     ```js
     const customerInfo = await Purchases.getCustomerInfo();
     const hasPro = customerInfo.entitlements.active['entitlement: pro_access'];
     ```
   - Update your app state/context accordingly.

5. **Subscription Management**
   - Provide a link or button for users to manage their subscription via RevenueCat's customer portal or your own management UI.

6. **Testing**
   - Use the Sandbox API Key and Stripe test cards for all test flows (purchase, trial, cancellation, renewal, entitlement unlock).


---

## References
- [RevenueCat Web Billing Docs](https://www.revenuecat.com/docs/web/web-billing/web-sdk)
- [Product Setup](https://www.revenuecat.com/docs/web/web-billing/product-setup)
- [Managing Subscriptions](https://www.revenuecat.com/docs/web/web-billing/managing-customer-subscriptions)
- [Tax & Compliance](https://www.revenuecat.com/docs/web/web-billing/tax)
- [Localization](https://www.revenuecat.com/docs/web/web-billing/localization)
