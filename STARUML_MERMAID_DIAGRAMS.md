# BloomUp — System Design Diagrams (Mermaid & StarUML Reference)

You can render these diagrams directly in:
- **Mermaid Live Editor:** https://mermaid.live
- **GitHub / VS Code Markdown Preview**
- **StarUML:** Use the **Mermaid / PlantUML** import or recreate the exact classes, entities, use cases, and lifelines below.

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer (Browser — React 18 + Vite SPA)"]
        UI["Pages & Components\n(Landing, Dashboard, Earn, Impact, Grow, Admin)"]
        CTX["Context Providers\n(AuthContext, ThemeContext, ToastContext)"]
        REC["Rule-Based Recommendation Engine\n(src/utils/recommendations.js)"]
        SVC["Service Layer\n(src/services/bloomupService.js)"]
        UI --> CTX
        UI --> REC
        UI --> SVC
    end

    subgraph Hosting["Hosting & Edge CDN"]
        VERCEL["Vercel CDN\n(SPA Rewrite via vercel.json)"]
    end

    subgraph Backend["Supabase Cloud Backend (ap-south-1)"]
        AUTH["Supabase Auth (GoTrue)\nEmail/Password + JWT + Password Reset"]
        PG["PostgreSQL Database\n10 Tables + Triggers + RLS Policies"]
        RPC["Trusted RPC Functions\nverify_and_complete_application()"]
        STORAGE["Supabase Storage\n'avatars' Bucket (Per-User Folder RLS)"]
    end

    VERCEL -->|Serves Static Bundle| Client
    SVC -->|HTTPS + JWT| AUTH
    SVC -->|PostgREST + RLS| PG
    SVC -->|RPC Call| RPC
    RPC -->|Updates Verified Totals| PG
    SVC -->|Upload / Public URL| STORAGE
```

---

## 2. Database Entity-Relationship Diagram (10 PostgreSQL Tables)

```mermaid
erDiagram
    PROFILES ||--o{ APPLICATIONS : submits
    OPPORTUNITIES ||--o{ APPLICATIONS : receives
    PROFILES ||--o{ OPPORTUNITIES : creates
    PROFILES ||--o{ STUDENT_SKILLS : possesses
    PROFILES ||--o{ LEARNING_GOALS : sets
    PROFILES ||--o{ VOLUNTEERING_RECORDS : earns
    OPPORTUNITIES ||--o{ VOLUNTEERING_RECORDS : generates
    PROFILES ||--o{ USER_ACHIEVEMENTS : unlocks
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : defines
    PROFILES ||--o{ ACTIVITY_LOGS : records

    PROFILES {
        uuid id PK
        text email
        text full_name
        text avatar_url
        text location
        text college
        text course
        text academic_year
        text role "student | organization | admin"
        boolean onboarding_completed
        numeric verified_earnings
        int impact_points
        numeric volunteering_hours
        int completed_opportunities
    }

    OPPORTUNITIES {
        uuid id PK
        text type "earn | impact"
        text title
        text description
        text category
        text organization
        text[] required_skills
        numeric payment_amount
        text currency
        int impact_points
        numeric duration_hours
        text work_mode
        timestamptz deadline
        text status "open | closed | completed"
        boolean is_demo
        uuid created_by FK
    }

    APPLICATIONS {
        uuid id PK
        uuid student_id FK
        uuid opportunity_id FK
        text message
        text status "pending | accepted | rejected | completed | withdrawn"
        timestamptz verified_at
        timestamptz created_at
    }

    SKILLS {
        uuid id PK
        text name UK
        text category "technical | non-technical"
    }

    STUDENT_SKILLS {
        uuid id PK
        uuid student_id FK
        text skill_name
        text category
        text proficiency "beginner | intermediate | advanced"
    }

    LEARNING_GOALS {
        uuid id PK
        uuid student_id FK
        text title
        text description
        text skill_tag
        date target_date
        int progress
        text status "in_progress | completed"
    }

    VOLUNTEERING_RECORDS {
        uuid id PK
        uuid student_id FK
        uuid opportunity_id FK
        numeric hours_logged
        int points_awarded
        uuid verified_by FK
        timestamptz verified_at
    }

    ACHIEVEMENTS {
        uuid id PK
        text code UK
        text title
        text description
        text pillar
        int points_required
    }

    USER_ACHIEVEMENTS {
        uuid id PK
        uuid student_id FK
        uuid achievement_id FK
        timestamptz earned_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid student_id FK
        text action_type
        text title
        jsonb metadata
        timestamptz created_at
    }
```

---

## 3. Use Case / Role Interaction Diagram

```mermaid
flowchart LR
    Guest(["Guest User"])
    Student(["Student User"])
    Admin(["Admin / Organization"])

    Guest --> UC1["View Landing Page & Pillars"]
    Guest --> UC2["Sign Up / Log In / Reset Password"]

    Student --> UC3["Complete 5-Step Onboarding"]
    Student --> UC4["Browse & Apply to Earn Gigs"]
    Student --> UC5["Browse & Apply to Impact Drives"]
    Student --> UC6["Manage Skills & Learning Goals"]
    Student --> UC7["Track Applications & Withdraw Pending"]
    Student --> UC8["View Verified Earnings & Impact Stats"]
    Student --> UC9["Edit Profile & Upload Avatar"]

    Admin --> UC10["Create & Manage Earn/Impact Tasks"]
    Admin --> UC11["Assign Tasks Directly to Students"]
    Admin --> UC12["Accept / Reject Applications"]
    Admin --> UC13["Verify & Complete Tasks\n(Credits Virtual Earnings & Points)"]
```

---

## 4. Sequence Diagram — Task Assignment & Virtual Reward Verification

```mermaid
sequenceDiagram
    actor Admin
    participant AdminUI as Admin Console (/admin)
    participant Svc as bloomupService.js
    participant DB as Supabase PostgreSQL (RLS + RPC)
    actor Student
    participant StudentUI as Student Dashboard (/dashboard)

    Admin->>AdminUI: Create Earn Task (₹1,500 virtual reward)
    AdminUI->>Svc: createOpportunity(payload)
    Svc->>DB: INSERT INTO opportunities (checks is_org_or_admin)
    DB-->>AdminUI: Opportunity Created

    Admin->>AdminUI: Assign Task to Student
    AdminUI->>Svc: assignTaskToStudent(studentId, oppId)
    Svc->>DB: UPSERT applications (status = 'accepted')
    Svc->>DB: INSERT INTO activity_logs
    DB-->>AdminUI: Assignment Confirmed

    Student->>StudentUI: View Assigned Task in My Applications
    StudentUI-->>Student: Shows status = ACCEPTED

    Admin->>AdminUI: Click "Verify & Complete"
    AdminUI->>Svc: verifyAndCompleteApplication(applicationId)
    Svc->>DB: RPC verify_and_complete_application()
    Note over DB: SECURITY DEFINER checks is_org_or_admin()<br/>Updates application.status = 'completed'<br/>Credits profile.verified_earnings += 1500<br/>Logs activity_logs entry
    DB-->>AdminUI: Success

    Student->>StudentUI: Refresh Dashboard
    StudentUI-->>Student: Verified Earnings updated to ₹1,500
```

---

## 5. Sequence Diagram — Authentication, Route Guard & Onboarding

```mermaid
sequenceDiagram
    actor User
    participant Router as React Router + ProtectedRoute
    participant Auth as AuthContext
    participant SupaAuth as Supabase Auth
    participant PG as PostgreSQL (profiles)

    User->>Router: Navigate to /login
    User->>Auth: Submit Email & Password
    Auth->>SupaAuth: signInWithPassword()
    SupaAuth-->>Auth: JWT Session + User
    Auth->>PG: SELECT * FROM profiles WHERE id = user.id
    PG-->>Auth: Profile (role, onboarding_completed)

    alt role in ['admin', 'organization']
        Router-->>User: Redirect to /admin
    else onboarding_completed == false
        Router-->>User: Redirect to /onboarding
    else onboarding_completed == true
        Router-->>User: Redirect to /dashboard
    end
```

---

## 6. Class / Component Architecture Diagram (StarUML Class View)

```mermaid
classDiagram
    class AuthContext {
        +User user
        +Profile profile
        +boolean loading
        +signUp(email, password, fullName)
        +signIn(email, password)
        +signOut()
        +resetPasswordForEmail(email)
        +updatePassword(newPassword)
        +refreshProfile()
    }

    class ThemeContext {
        +string theme
        +toggleTheme()
        +setTheme(next)
    }

    class BloomUpService {
        +updateProfile(userId, updates)
        +uploadAvatar(userId, file)
        +listOpportunities(type)
        +applyToOpportunity(params)
        +withdrawApplication(params)
        +upsertStudentSkill(params)
        +createLearningGoal(params)
        +createOpportunity(payload)
        +assignTaskToStudent(params)
        +verifyAndCompleteApplication(appId)
    }

    class RecommendationEngine {
        +scoreOpportunity(opp, profile, skills)
        +getRecommendedOpportunities(opps, profile, skills, limit)
    }

    AuthContext --> BloomUpService : fetches profile
    RecommendationEngine --> BloomUpService : scores fetched opportunities
```

---

## 7. State Diagram — Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending : Student submits application
    [*] --> accepted : Admin directly assigns task
    pending --> accepted : Admin accepts
    pending --> rejected : Admin rejects
    pending --> withdrawn : Student withdraws
    accepted --> completed : Admin calls Verify & Complete
    pending --> completed : Admin calls Verify & Complete
    completed --> [*] : Virtual reward / impact points credited
    rejected --> [*]
    withdrawn --> [*]
```
