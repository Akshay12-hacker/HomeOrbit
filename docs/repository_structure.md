HomeOrbit
├── assets
│   ├── icons
│   ├── images
│   ├── animations
│   └── fonts
│
├── docs
│   ├── implementation_plan.md
│   ├── api_documentation.md
│   └── architecture_notes.md
│
├── logs
│
├── src
│   │
│   ├── components
│   │   │
│   │   ├── ui
│   │   │   ├── Badge.js
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Skeleton.js
│   │   │   ├── Input.js
│   │   │   ├── EmptyState.js
│   │   │   └── index.js
│   │   │
│   │   ├── profile
│   │   │   ├── ProfileHeader.js
│   │   │   ├── InfoRow.js
│   │   │   ├── SubscriptionCard.js
│   │   │   ├── ActionButton.js
│   │   │   └── InfoCard.js
│   │   │
│   │   ├── home
│   │   │   ├── QuickActionCard.js
│   │   │   ├── DashboardCard.js
│   │   │   ├── DueCard.js
│   │   │   └── NoticeCard.js
│   │   │
│   │   ├── maintenance
│   │   │   ├── BillCard.js
│   │   │   ├── PaymentCard.js
│   │   │   └── DueSummary.js
│   │   │
│   │   ├── settings
│   │   │   ├── SettingItem.js
│   │   │   ├── SettingsSection.js
│   │   │   └── ToggleSetting.js
│   │   │
│   │   ├── modals
│   │   │   ├── PaymentSuccessModal.js
│   │   │   ├── LogoutModal.js
│   │   │   ├── SubscriptionModal.js
│   │   │   └── ErrorModal.js
│   │   │
│   │   └── loaders
│   │       ├── FullScreenLoader.js
│   │       └── PaymentLoader.js
│   │
│   ├── screens
│   │   │
│   │   ├── auth
│   │   │   ├── SplashScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── OTPScreen.js
│   │   │
│   │   ├── home
│   │   │   └── HomeScreen.js
│   │   │
│   │   ├── maintenance
│   │   │   ├── MaintenanceScreen.js
│   │   │   ├── CollectMaintenanceScreen.js
│   │   │   ├── CreateMaintenanceScreen.js
│   │   │   └── ApproveRejectScreen.js
│   │   │
│   │   ├── society
│   │   │   ├── SocietyScreen.js
│   │   │   ├── SocietyFundScreen.js
│   │   │   ├── AdminExpenseScreen.js
│   │   │   └── CreateNoticeScreen.js
│   │   │
│   │   ├── payments
│   │   │   ├── HistoryScreen.js
│   │   │   ├── ReceiptScreen.js
│   │   │   └── SubscriptionScreen.js
│   │   │
│   │   ├── profile
│   │   │   ├── ProfileScreen.js
│   │   │   └── EditProfileScreen.js
│   │   │
│   │   └── settings
│   │       └── SettingsScreen.js
│   │
│   ├── navigation
│   │   ├── AppNavigator.js
│   │   ├── TabNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── navigationService.js
│   │
│   ├── hooks
│   │   ├── usePaymentFlow.js
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useNetworkStatus.js
│   │   └── index.js
│   │
│   ├── services
│   │   │
│   │   ├── auth
│   │   │   ├── sendOtp.js
│   │   │   ├── verifyOtp.js
│   │   │   └── logout.js
│   │   │
│   │   ├── payments
│   │   │   ├── cashfreeService.js
│   │   │   ├── createOrder.js
│   │   │   ├── verifyPayment.js
│   │   │   ├── getOrderReceipt.js
│   │   │   └── getSubscriptionConfig.js
│   │   │
│   │   ├── society
│   │   │   ├── getSociety.js
│   │   │   ├── getMaintenanceDue.js
│   │   │   ├── getSocietyFund.js
│   │   │   ├── getLastPayment.js
│   │   │   └── getNotices.js
│   │   │
│   │   ├── notifications
│   │   │   ├── pushNotificationService.js
│   │   │   └── reminderService.js
│   │   │
│   │   ├── apiClient.js
│   │   ├── apiError.js
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── index.js
│   │
│   ├── store
│   │   ├── authStore.js
│   │   ├── paymentStore.js
│   │   ├── userStore.js
│   │   └── societyStore.js
│   │
│   ├── context
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── SubscriptionContext.js
│   │
│   ├── utils
│   │   ├── currency.js
│   │   ├── date.js
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   ├── permissions.js
│   │   └── helpers.js
│   │
│   ├── constants
│   │   ├── routes.js
│   │   ├── apiEndpoints.js
│   │   ├── paymentStatus.js
│   │   ├── storageKeys.js
│   │   └── appConfig.js
│   │
│   ├── storage
│   │   ├── authStorage.js
│   │   ├── cacheStorage.js
│   │   └── userStorage.js
│   │
│   ├── validators
│   │   ├── authValidator.js
│   │   ├── paymentValidator.js
│   │   └── profileValidator.js
│   │
│   ├── theme
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   ├── shadows.js
│   │   └── index.js
│   │
│   └── types
│       └── index.js
│
├── .env
├── .gitignore
├── App.js
├── SETUP.md
├── app.json
├── babel.config.js
├── metro.config.js
├── eas.json
├── package.json
├── package-lock.json
├── start-logger.js
└── README.md