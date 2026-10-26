# Default App Launch: Start with Login Page

Configure the Digital Banking application so that it opens directly to the full-screen, clean white authentication and registration page on initial launch and fresh session start, requiring the user to authenticate before accessing banking dashboards.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification:
> - **Default Startup Route**: App always starts on the login page on app launch (`currentUser` initialized to `null`).
> - **Input State**: Account number and password input fields remain clean and blank by default with helpful placeholder hints.
> - **Testing Accessibility**: Quick demo login buttons (Riyas - ACC1001 and Bank Manager) remain prominently available for fast one-click testing without manual typing.

- **Confirmed Decision 1**: Default `currentUser` to `null` in `bankEngine` during app bootstrap and state initialization, ensuring every fresh browser session or app launch presents the full-screen authentication portal.
- **Confirmed Decision 2**: Ensure logging out cleanly resets session state, and returning to the app defaults to the login interface.

---

### 1. Overview & Core Concept

- **What It Does**: Shifts the entry point from auto-logging into customer "Riyas" to a professional banking security zero-trust model where users are always greeted by the clean, full-screen digital banking login and registration portal.
- **Target Audience / Persona**: Retail banking customers, bank branch managers, and system auditors accessing the online banking portal.
- **Key Value**: Delivers authentic banking security behavior where user credentials or demo role selection is required prior to viewing balances, transactions, and account details.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **App Launch**: The user loads the application URL. Instead of immediately viewing account dashboard metrics, the user lands on the full-screen clean white authentication interface.
  2. **Blank Credentials**: Inputs for "Account Number" and "Password" are clean and blank, styled with smooth focus rings and subtle icon indicators.
  3. **One-Click Quick Demo Login**: Below the main form, clear quick demo buttons enable testers to immediately populate and authenticate as Customer (`ACC1001` / `Riyas`) or Bank Manager (`MGR001` / `Manager`) with spring micro-interactions.
  4. **Post-Login Experience**: Upon successful authentication, a welcoming feedback toast appears and the user smoothly transitions into their customized dashboard with spring animation curves.
  5. **Logout Flow**: Clicking the logout icon in the header cleanly disposes the session and returns immediately to the login screen.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Clean, trustworthy modern financial portal, compliant with zero-pill discipline and domain-native design.
  - *Color Palette*: Crisp white neutral canvas (`bg-white`), structural slate borders (`border-slate-200`), primary financial blue CTA (`bg-blue-600`), and subtle slate input backgrounds (`bg-slate-50`).
  - *Interactive Feedback & Motion*: Spring-settling physics (`cubic-bezier(0.16, 1, 0.3, 1)`) on demo cards and action buttons, smooth opacity and scale transitions between tabs.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Engine Bootstrap State**:
  - *Chosen Approach*: Initialize `currentUser` to `null` in both default state initialization and `localStorage` state rehydration in `bankEngine.ts`.
  - *Why*: Guarantees that opening the app always displays the login portal as requested, preventing accidental persistence of logged-in state across fresh browser sessions.
  - *Alternatives Considered*: Storing session expiry timestamps in `localStorage`; rejected because the user specifically requested that the app always start on the login page.

- **Decision 2: Quick Demo Buttons Preservation**:
  - *Chosen Approach*: Maintain and highlight the 1-click test account buttons in `LoginPage.tsx` so developers, reviewers, and evaluators can jump into any persona with one click while leaving the default input fields pristine and blank.
  - *Why*: Balances authentic security flow with zero-friction demonstration.

---

### 4. Technical Architecture & Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Startup                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Core Banking Engine (bankEngine.ts)             │
│        Initial state: currentUser = null (Unauthenticated)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │ currentUser == null           │
               ▼                               │
┌──────────────────────────────┐               │ currentUser != null
│   LoginPage Component        │               ▼
│  - Fullscreen clean white    │    ┌─────────────────────────────┐
│  - Blank Account & Password  │    │  Main Banking Application   │
│  - 1-Click Demo Selectors    │    │  - Header & Navigation      │
│  - Forgot Password OTP Toast │    │  - Dashboard & Management   │
└──────────────┬───────────────┘    │  - UML Tracing Drawer       │
               │ Authenticate       └─────────────────────────────┘
               ▼
     [ Set currentUser ] ───► Transitions to Dashboard
```

- **State & Handlers**:
  - `loadState()` in `src/services/bankEngine.ts`: Sets `currentUser: null` on startup so initial state renders the login view.
  - `LoginPage.tsx`: Preserves blank default input state (`loginAccountNo = ''`, `loginPassword = ''`) and interactive demo quick-fill actions.
  - `App.tsx`: Renders `<LoginPage />` whenever `!engineState.currentUser`, with seamless spring transition upon successful login.
