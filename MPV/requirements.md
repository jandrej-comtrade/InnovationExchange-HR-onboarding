# Detailed Requirements Document: The HR Company Onboarding MVP

## 1. Project Overview

This document specifies the requirements for a Minimum Viable Product (MVP) prototype designed to streamline The HR Company's client onboarding process. The MVP will address two core, explicitly defined problems:

1.  **Manual System Synchronization:** Automate the bi-directional data flow between the vTiger CRM and Maxio finance system. Specifically, it must automatically provision client payment details (IBAN) from the CRM into Maxio upon contract signing, and then automatically feed the generated Maxio `Subscription ID` and `Customer ID` back into the CRM to finalize the client conversion. This eliminates the current manual, error-prone steps requiring intervention from Sales and Finance staff.

2.  **Fragmented Client Experience:** Replace the current process of sending multiple, unbranded, table-style email forms with a unified, self-service "Unified Onboarding Hub." This hub will be a dedicated section within the existing vTiger Customer Portal, accessible immediately after contract signing. It will present clients with a single, dynamic web form to collect *all* necessary information for both the Master Contract and the Employee Handbook, eliminating redundancy and the barrage of emails.

The primary objective is to validate the technical feasibility and user value of these two core automations. The MVP is a proof-of-concept, not a production-ready system, and explicitly excludes full integration with uRISQ+ or Natural HR, document migration from Microsoft 365, or re-engineering internal assignment workflows.

## 2. Functional Requirements

### 2.1. Core Integration: vTiger CRM <-> Maxio
*   **FR-001: Trigger on Contract Signing:** The system shall automatically trigger the finance setup process when a client record in vTiger CRM is marked as "Ready for Finance Setup" (e.g., after digital contract signing).
*   **FR-002: CRM to Maxio Data Push:** The system shall extract the client's IBAN and essential company details from the designated vTiger CRM record and automatically create a new customer/subscription record in Maxio using Maxio's API.
*   **FR-003: Maxio to CRM Data Pull:** Upon successful creation of the record in Maxio, the system shall retrieve the generated `Subscription ID` and `Customer ID` from Maxio.
*   **FR-004: CRM Record Update:** The system shall automatically update the corresponding client record in vTiger CRM with the retrieved `Subscription ID` and `Customer ID`.
*   **FR-005: Lead Conversion Enablement:** The successful completion of FR-004 shall enable the Operations staff to convert the lead to a "Client" status in vTiger CRM without any manual data re-entry.

### 2.2. Client-Facing Portal: "Unified Onboarding Hub"
*   **FR-010: Portal Location:** The "Unified Onboarding Hub" shall be implemented as a new, dedicated section/module within the existing vTiger Customer Portal.
*   **FR-011: Client Access:** Access to the "Unified Onboarding Hub" shall be granted to the client immediately after their digital contract is signed and their initial CRM record is created.
*   **FR-012: Consolidated Data Form:** The hub shall present the client with a single, dynamic, web-based form that collects all information required for *both* the Master Contract *and* the Employee Handbook (e.g., company trading name, operating hours, sick leave policy).
*   **FR-013: Branded User Interface:** The form and surrounding portal interface shall have a clean, professional design that consistently reflects The HR Company's branding.
*   **FR-014: Form Data Persistence:** All data submitted by the client via the consolidated form shall be saved directly and immediately to their corresponding record in the vTiger CRM.
*   **FR-015: Progress Indicators (Basic):** The interface shall provide simple visual indicators to the client, showing which sections of the form have been completed and which are pending.

### 2.3. Communication Engine (Conceptual Demonstration)
*   **FR-020: Triggered Welcome Email (Demo):** The MVP shall *demonstrate the concept* of an automated, branded welcome email. This email would be triggered upon the successful completion of the Maxio setup (FR-004). It would introduce the client's Account Manager and provide a direct link to the "Unified Onboarding Hub," conceptually replacing the separate introductory emails.

## 3. Non-Functional Requirements

*   **NFR-001: Integration Method:** The solution must use API-based integration, specifically leveraging vTiger's REST API and Maxio's REST API.
*   **NFR-002: Middleware:** The bi-directional data flow between vTiger and Maxio must be handled by a lightweight middleware service (e.g., built with Python/Node.js or prototyped with an iPaaS like Zapier/Make).
*   **NFR-003: Frontend Framework:** The "Unified Onboarding Hub" must be developed as a custom module within the existing vTiger Customer Portal framework to ensure seamless integration and data binding.
*   **NFR-004: Authentication:** The portal must leverage the existing vTiger Customer Portal login credentials for client authentication.
*   **NFR-005: Prototype Nature:** The system is to be built as a functional prototype for validation, not as a fully scalable, production-grade application. Performance and load testing beyond basic functionality are out of scope for the MVP.
*   **NFR-006: Success Metric - Technical Feasibility:** The primary technical success criterion is the demonstrable, automated, and reliable bi-directional data flow between vTiger CRM and Maxio as defined in FR-001 to FR-005.

## 4. Dependencies and Constraints

*   **D&C-001: Core Systems:** The solution is entirely dependent on the existing vTiger CRM (open-source version with Viger Experts customizations) and Maxio (Advanced Billing) systems. These systems cannot be replaced for the MVP.
*   **D&C-002: API Availability & Stability:** The project assumes that the vTiger CRM REST API and the Maxio REST API are stable, well-documented, and have the necessary permissions enabled for read/write operations.
*   **D&C-003: Test Environments:** The HR Company must provide non-production (sandbox/test) environments for both vTiger CRM and Maxio for development, integration, and User Acceptance Testing (UAT).
*   **D&C-004: Out of Scope Integrations:** Integration with uRISQ+ and Natural HR systems is explicitly out of scope for this MVP.
*   **D&C-005: Out of Scope Data Migration:** Migration of existing client documentation (e.g., handbooks) from Microsoft 365 to vTiger is out of scope.
*   **D&C-006: Out of Scope Workflow Changes:** Re-engineering the internal business logic for Account Manager assignment or the contract review process is out of scope. The MVP focuses on data flow and client UI, not core workflow logic.
*   **D&C-007: Portal Extensibility:** The solution assumes that the existing vTiger Customer Portal can be extended with new custom modules/pages to host the "Unified Onboarding Hub."