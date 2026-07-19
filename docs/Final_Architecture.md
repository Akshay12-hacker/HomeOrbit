                    Backend
                       │
         JWT + Refresh Token
                       │
         ┌─────────────┴─────────────┐
         │                           │
     Expo App                  Next.js Web
         │                           │
 Splash/Login/OTP              /login page
         │                           │
         └─────────────┬─────────────┘
                       │
                 AuthProvider
                       │
               Validate Token
                       │
              Load User Profile
                       │
          Render Dashboard or Redirect