# Implementation Plan: User Authentication (Login/Signup)

Implement a robust authentication flow for both Passenger and Driver Android apps, connected to the Abuja Taxi backend.

## User Review Required

> [!IMPORTANT]
> The existing Node.js backend does not have dedicated Auth endpoints. I will be adding `/api/auth/register` and `/api/auth/login` to the server as part of this plan.

> [!NOTE]
> I will use a mock authentication mechanism in the backend for now, which can be easily swapped for Supabase Auth in the future.

## Proposed Changes

### [Component] Backend API

#### [MODIFY] [apiRoutes.js](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/server/src/routes/apiRoutes.js)
- Add POST `/auth/register` and POST `/auth/login` routes.

#### [NEW] [authService.js](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/server/src/services/authService.js)
- Implement logic for user registration and login.
- Support for roles: `PASSENGER` and `DRIVER`.

---

### [Component] Android Core-Network

#### [MODIFY] [TaxiApiService.kt](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/android/core-network/src/main/kotlin/com/abuja/taxi/core/network/api/TaxiApiService.kt)
- Add `login` and `register` methods.
- Add `AuthRequest` and `AuthResponse` models.

---

### [Component] Android Customer & Driver Apps

#### [NEW] [LoginScreen.kt](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/android/app-customer/src/main/kotlin/com/abuja/taxi/customer/ui/screens/LoginScreen.kt)
#### [NEW] [SignupScreen.kt](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/android/app-customer/src/main/kotlin/com/abuja/taxi/customer/ui/screens/SignupScreen.kt)
#### [NEW] [AuthViewModel.kt](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/android/app-customer/src/main/kotlin/com/abuja/taxi/customer/ui/AuthViewModel.kt)
- Implement similar screens and ViewModels for the Driver app (sharing the Core-Network logic).

#### [MODIFY] [MainActivity.kt](file:///C:/Users/Lenovo/Documents/GitHub/TaxiAPP/android/app-customer/src/main/kotlin/com/abuja/taxi/customer/MainActivity.kt)
- Add navigation logic to switch between Auth and Map screens based on session state.

## Verification Plan

### Automated Tests
- Unit tests for `AuthViewModel` using Mockito/Turbine.
- Integration tests for `TaxiApiService` using MockWebServer.

### Manual Verification
1. Start Node.js backend.
2. Launch Customer/Driver app.
3. Verify signup creates a new user (check server logs).
4. Verify login navigates to the Map screen.
5. Verify session persistence (restart app).
