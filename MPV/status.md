# Project Status Tracking Template: The HR Company Onboarding MVP

## 1. Implementation Phases

This MVP project is divided into three sequential phases, each focused on delivering a core component of the solution.

*   **Phase 1: Middleware & Core Integration (vTiger <-> Maxio Sync)**
    *   **Objective:** Build and test the automated, bi-directional data flow between vTiger CRM and Maxio.
    *   **Key Activities:** Environment setup, API authentication, webhook listener development, Maxio customer/subscription creation logic, CRM record update logic, job queuing (if used), logging.
    *   **Duration Estimate:** 3-4 weeks.

*   **Phase 2: Client Portal Development ("Unified Onboarding Hub")**
    *   **Objective:** Design, build, and integrate the client-facing portal module within the vTiger Customer Portal.
    *   **Key Activities:** UI/UX design & stakeholder review, frontend component development (form, progress tracker), integration with middleware API, data persistence to CRM, basic error handling for form submission.
    *   **Duration Estimate:** 3-4 weeks.

*   **Phase 3: Integration, UAT & Demo Preparation**
    *   **Objective:** Connect the middleware and portal, conduct end-to-end testing, perform User Acceptance Testing (UAT) with stakeholders, and prepare the final demo.
    *   **Key Activities:** End-to-end system integration testing, internal QA, UAT coordination and execution, bug fixing, demo environment setup, preparation of demo scripts and success metric reports.
    *   **Duration Estimate:** 2-3 weeks.

## 2. Milestone Checklist

The following are the concrete, tangible deliverables that mark the completion of key project stages.

*   [ ] **M1: Technical Spike Complete.** Feasibility of vTiger and Maxio APIs confirmed. Basic "hello world" API calls successful in sandbox environments.
*   [ ] **M2: Webhook & Sync Engine MVP.** Middleware can successfully receive a vTiger webhook, create a customer/subscription in Maxio (sandbox), and update the vTiger lead record with the Maxio IDs.
*   [ ] **M3: "Unified Onboarding Hub" UI Prototype.** Interactive mockup or clickable prototype of the portal form and progress tracker, reviewed and approved by Philip/Peter.
*   [ ] **M4: Functional Portal Module.** The "Unified Onboarding Hub" is built as a working module within the vTiger Customer Portal (dev/staging). Form data can be submitted and is successfully saved to a test client record in vTiger CRM via the middleware.
*   [ ] **M5: End-to-End Integration Test Passed.** A full test run: Lead status change in vTiger triggers Maxio sync, which then allows portal access. Client submits form data via portal, which is saved in CRM. All steps complete without manual intervention.
*   [ ] **M6: UAT Signed Off.** Key internal users (Sales, Finance) and stakeholders (Philip, Peter) have tested the prototype in the staging environment and provided formal sign-off, confirming it meets the core MVP objectives.
*   [ ] **M7: Final Demo Prepared & Delivered.** A polished demo environment is ready, showcasing both the automated sync and the client portal. Success metrics (technical logs, user feedback summary) are compiled and presented.

## 3. Testing Criteria

Testing will focus on validating the core MVP functionality and its resilience.

*   **Core Integration (vTiger -> Maxio -> vTiger):**
    *   Verify that updating a lead's status to "Ready for Finance Setup" in vTiger triggers the webhook.
    *   Verify that the middleware correctly extracts the IBAN and company details from the webhook payload.
    *   Verify that a new customer and subscription record is successfully created in Maxio (sandbox) with the correct data.
    *   Verify that the generated `Customer_ID` and `Subscription_ID` from Maxio are correctly retrieved.
    *   Verify that the vTiger lead record is updated with these IDs in the correct custom fields.
    *   Test error handling: Simulate Maxio API failure (e.g., invalid data, downtime) and verify the job is logged as failed with a clear error message. Test vTiger API failure on the update step.

*   **Client Portal ("Unified Onboarding Hub"):**
    *   Verify that a client can log into the vTiger Customer Portal and access the "Unified Onboarding Hub" after their lead is converted (or a test flag is set).
    *   Verify that all required fields in the consolidated form are present and correctly labeled.
    *   Verify that form data is saved to the client's CRM record upon submission (check vTiger directly).
    *   Verify that the progress tracker updates correctly as sections are completed (if multi-step).
    *   Test error handling: Simulate middleware API failure during form submission and verify the portal displays a user-friendly error message and retains the form data.

*   **End-to-End User Journey:**
    *   Simulate the full internal staff workflow: Sales updates status -> System auto-syncs with Maxio -> Operations can convert lead with one click.
    *   Simulate the full client workflow: Client logs in -> Completes and submits form -> Data appears in CRM for Account Manager.
    *   Verify that the conceptual welcome email trigger point (post-Maxio sync) is demonstrable (even if email sending is mocked).

## 4. Deployment Stages

Given the MVP's nature as a prototype, deployment will be cautious and staged, focusing on non-production environments until final approval.

*   **Stage 1: Development Environment**
    *   **Purpose:** Initial build and component-level testing by the development team.
    *   **Environment:** Local developer machines and a shared dev server.
    *   **Data:** Uses mock data or a dedicated dev instance of vTiger/Maxio sandboxes.
    *   **Access:** Development team only.

*   **Stage 2: Staging / UAT Environment**
    *   **Purpose:** Integrated testing, QA, and User Acceptance Testing (UAT) with stakeholders.
    *   **Environment:** A dedicated, isolated staging server mirroring production as closely as possible. Uses The HR Company's provided sandbox/test instances of vTiger CRM and Maxio.
    *   **Data:** Uses anonymized or fabricated test client data.
    *   **Access:** Project team, QA, and designated UAT participants (Sales, Finance, Philip, Peter).

*   **Stage 3: Production Demo Environment (Optional)**
    *   **Purpose:** To conduct the final stakeholder demo. This is *not* for live client use.
    *   **Environment:** A separate, clean instance, potentially using production APIs in a read-only or highly controlled manner (e.g., creating test subscriptions that are immediately voided). **OR** a pristine copy of the Staging environment.
    *   **Data:** Uses a single, pre-configured demo client record.
    *   **Access:** Project team and executive stakeholders (Philip, Peter) for the demo session only. Strictly controlled.

*   **Stage 4: Post-MVP Handover (Not Deployment)**
    *   **Purpose:** If the MVP is successful, the codebase, documentation, and learnings are handed over to The HR Company or a Phase 2 team for potential productionization. The MVP prototype itself is *not* deployed to the live production environment serving real clients.