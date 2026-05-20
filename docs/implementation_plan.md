# Remove Premade / Mock APIs & Associated UI

This plan outlines the process of stripping all mock APIs and their dependent UI elements from the application, ensuring that only components interacting with the real backend remain.

## User Review Required

> [!WARNING]
> This is a highly destructive operation. It will remove several screens and features from the app because they currently rely on mock data. Please carefully review the list of items to be deleted below and confirm this is what you want.

## Proposed Changes

### Services Layer (`src/services/index.js`)

**[MODIFY]** `src/services/index.js`
- Remove all `requestOne` fallback endpoint configurations.
- **[DELETE]** `getUserPlots`
- **[DELETE]** `verifyPayment`
- **[DELETE]** `addExpense`
- **[DELETE]** `getPaymentHistory`
- **[DELETE]** `searchSocieties` (redundant, using `getSociety`)
- **[DELETE]** `joinSociety` (mock endpoint)
- Retain only real services: `sendOTP`, `verifyOTP`, `getSociety`, `getMaintenanceDue`, `getSocietyFund`.

### Screens & UI Layer

**[DELETE] Screens completely:**
Since these screens rely on mock APIs or are purely placeholder, they will be deleted and removed from the navigator:
- `HistoryScreen.js`
- `ReceiptScreen.js`
- `AdminExpenseScreen.js`
- `SubscriptionScreen.js`
- `CollectMaintenanceScreen.js`
- `CreateMaintenanceScreen.js`
- `ApproveRejectScreen.js`
- `CreateNoticeScreen.js`

**[MODIFY] `src/navigation/AppNavigator.js`**
- Remove all references and routes to the deleted screens.
- Remove the "History" tab from `MainTabs`.

**[MODIFY] `src/screens/HomeScreen.js`**
- Remove the "Recent Payments" section.
- Remove the "Plot Information" section.
- Simplify `getDashboard` logic to only fetch `societyFund` and `maintenanceDue`.

**[MODIFY] `src/screens/MaintenanceScreen.js`**
- Remove the "Select Plot" dropdown and logic since `getUserPlots` is removed.
- Remove the Mock Razorpay Payment flow since `verifyPayment` is removed. It will just display the dues.

**[MODIFY] `src/screens/SocietyScreen.js`**
- Remove the `joinSociety` API call. Selecting a society will simply save the ID locally and navigate to the dashboard directly.

## Open Questions

1. Do you want to keep the "Settings" and "Profile" tabs? They don't have mock APIs yet, but they are mostly static right now.
2. In `MaintenanceScreen`, since the mock payment flow is removed, should I leave a non-functional "Pay Now" button, or remove the checkout bar entirely?

## Verification Plan
1. Ensure the app compiles and launches successfully.
2. Verify that logging in and selecting a society correctly navigates to the dashboard.
3. Verify that the Dashboard, Maintenance, and Society Fund screens render using strictly real data from your backend.
