# Industry Survey Flow & Architecture

The following diagrams illustrate how different users (Data Gatherers and Super Admins) interact with the Industry Survey system, and how location data flows through the application.

## 1. User Interaction Flow (Data Gatherer)

This diagram shows the step-by-step journey of a Data Gatherer submitting an Industry Survey.

```mermaid
sequenceDiagram
    actor User as Data Gatherer
    participant Login as Keycloak Login
    participant UserPage as User Landing Page
    participant Dash as Data Gather Dashboard
    participant Survey as Industry Survey Form
    participant API as Backend (Laravel)
    
    User->>Login: Authenticates
    Login-->>UserPage: Redirects with Token
    
    User->>UserPage: Selects Location (GN Division)
    Note over UserPage: Saves location to sessionStorage
    
    User->>Dash: Clicks "Data Gather" Button
    Dash->>API: Fetch My Surveys (/api/my-industry-surveys)
    API-->>Dash: Returns Drafts & Submissions
    
    User->>Dash: Clicks "New Data Gather"
    Dash-->>Survey: Navigates with Location Context
    
    loop Survey Steps (1-6)
        User->>Survey: Fills Data (General, Labor, Materials, etc.)
        User->>Survey: Clicks "Save Draft"
        Survey->>API: POST /api/industry-surveys (Draft)
    end
    
    User->>Survey: Clicks "Submit"
    Survey->>API: POST /api/industry-surveys (Status: Submitted)
    API-->>Survey: Success Response
    Survey-->>Dash: Redirects back to Dashboard
```

## 2. Location & Data Flow Diagram

This flowchart illustrates how the location hierarchy is selected and how data is distributed across the platform based on that location.

```mermaid
graph TD
    subgraph Location Selection
        A[User Page] --> B{Select Location}
        B -->|1| C[Province]
        B -->|2| D[District]
        B -->|3| E[DSD]
        B -->|4| F[GN Division]
    end

    subgraph Data Capture
        F --> G((Session Storage))
        G -->|Passes CCODE| H[Industry Survey Form]
        H -->|Submits Data| I[(PostgreSQL DB)]
    end

    subgraph Data Presentation
        I -->|Aggregated Data| J[Public Dashboard /gnpage]
        J --> K[Shows Charts, Stats for selected GN/DSD]
        
        I -->|Raw Data| L[Admin Approval Panel]
    end
```

## 3. Super Admin Interaction

This diagram shows how a Super Admin governs the Industry Survey module, manages submissions, and configures questions.

```mermaid
flowchart LR
    Admin((Super Admin))
    
    subgraph Admin Control Panel
        Approve[Approve / Reject Surveys]
        Questions[Manage Survey Questions]
        Users[Manage Users & Roles]
        Export[Export Survey Data]
    end
    
    Admin --> Approve
    Admin --> Questions
    Admin --> Users
    Admin --> Export
    
    subgraph Backend Actions
        Approve -.->|Updates Status| DB[(Database)]
        Questions -.->|Dynamically Updates| SurveyForm[Industry Survey Form]
        Users -.->|Updates| Keycloak[Keycloak Identity]
    end
```
