# Backend Implementation Guide: The HR Company Onboarding MVP

**Version:** 1.0
**Date:** 2024-06-26

---

## 1. API Design

The backend will expose a minimal internal API for the frontend portal and handle all communication with vTiger and Maxio via their respective APIs. The core functionality is event-driven (triggered by CRM status change).

### 1.1 Internal API (For Frontend Portal)

*   **Endpoint:** `POST /api/onboarding/submit`
    *   **Method:** `POST`
    *   **Description:** Receives the consolidated client data from the "Unified Onboarding Hub" form and saves it to the vTiger CRM.
    *   **Request Payload (JSON):**
        ```json
        {
          "clientId": "vtiger_client_id_123", // Unique ID of the client in vTiger
          "companyTradingName": "Acme Corp Ltd",
          "operatingHours": "Mon-Fri, 9am-5pm",
          "sickLeavePolicy": "Statutory + 3 company days",
          "annualLeavePolicy": "25 days + public holidays",
          "probationPeriod": "6 months",
          "noticePeriodEmployee": "1 month",
          "noticePeriodEmployer": "1 month"
          // ... other fields from the consolidated form
        }
        ```
    *   **Response:** `200 OK` with `{ "status": "success", "message": "Data saved to CRM." }` or `500 Internal Server Error` with error details.

### 1.2 Webhook/Trigger Endpoint (From vTiger CRM)

*   **Endpoint:** `POST /webhook/vtiger/lead-status-change`
    *   **Method:** `POST`
    *   **Description:** Listens for webhook notifications from vTiger CRM when a lead's status is updated to "Ready for Finance Setup". This triggers the Maxio sync process.
    *   **Request Payload (JSON - Example from vTiger Webhook):**
        ```json
        {
          "event": "record.update",
          "module": "Leads",
          "record_id": "vtiger_lead_id_456",
          "data": {
            "leadstatus": "Ready for Finance Setup",
            "cf_iban": "IE12BOFI90000112345678", // Custom field for IBAN
            "company": "Acme Corp Ltd",
            "email": "contact@acmecorp.com",
            "firstname": "John",
            "lastname": "Doe"
          }
        }
        ```
    *   **Response:** `200 OK` with `{ "status": "received" }`. Processing happens asynchronously.

---

## 2. Data Models

The MVP middleware is stateless and does not require its own persistent database for core business data. All data resides in vTiger and Maxio.

However, for operational purposes (logging, audit trail, job queuing), the following simple collections/tables are recommended.

### 2.1 `sync_jobs` Collection/Table (For Logging & Retry)

*   **Purpose:** Track the status of each sync job between vTiger and Maxio.
*   **Fields:**
    *   `job_id` (String, Primary Key): Unique ID for the sync job (e.g., UUID).
    *   `vtiger_lead_id` (String): The ID of the lead in vTiger that triggered the job.
    *   `status` (String): `pending`, `processing`, `maxio_created`, `crm_updated`, `failed`.
    *   `maxio_customer_id` (String, Nullable): The Customer ID generated in Maxio.
    *   `maxio_subscription_id` (String, Nullable): The Subscription ID generated in Maxio.
    *   `error_message` (String, Nullable): Details of any error encountered.
    *   `created_at` (DateTime): Timestamp when the job was created.
    *   `updated_at` (DateTime): Timestamp when the job status was last updated.

### 2.2 `application_logs` Collection/Table

*   **Purpose:** General application logging for debugging and monitoring.
*   **Fields:**
    *   `log_id` (String, Primary Key): Unique log entry ID.
    *   `timestamp` (DateTime): When the log entry was created.
    *   `level` (String): `info`, `warn`, `error`, `debug`.
    *   `message` (String): The log message.
    *   `context` (Object/JSON, Nullable): Additional structured data (e.g., `{ "job_id": "..." }`, `{ "api_call": "maxio_create_customer" }`).

---

## 3. Business Logic

The core business logic revolves around the automated sync process triggered by the CRM.

1.  **Trigger Reception:**
    *   The `/webhook/vtiger/lead-status-change` endpoint receives a payload from vTiger.
    *   The service validates that the `leadstatus` is `"Ready for Finance Setup"`.
    *   If valid, it creates a new entry in the `sync_jobs` table with status `pending` and immediately returns a `200 OK` response to vTiger.
    *   It then pushes a job onto an asynchronous task queue (e.g., BullMQ) for processing. *This ensures the webhook response is fast and the sync process is resilient.*

2.  **Asynchronous Sync Job Processing:**
    *   A worker process picks up the job from the queue.
    *   **Step 1: Create Customer in Maxio**
        *   Extract required data (IBAN, Company Name, Contact Email, etc.) from the webhook payload.
        *   Call Maxio's `POST /customers` API to create a new customer.
        *   If successful, store the returned `customer.id` and proceed. If failed, update `sync_jobs` with `status: 'failed'` and the error message, then exit.
    *   **Step 2: Create Subscription in Maxio**
        *   Using the `customer.id` from Step 1, call Maxio's `POST /subscriptions` API to create a subscription (assuming a default plan/product ID is configured for new signups).
        *   If successful, store the returned `subscription.id`. If failed, update `sync_jobs` with `status: 'failed'` and the error message, then exit.
    *   **Step 3: Update CRM with Maxio IDs**
        *   Using vTiger's `PUT /Leads/{record_id}` API, update the lead record.
        *   Set the custom fields designated for `Maxio_Customer_ID__c` and `Maxio_Subscription_ID__c` (these fields must be pre-created in vTiger) with the IDs retrieved from Maxio.
        *   Optionally, update the lead status to "Finance Setup Complete" or similar.
        *   If successful, update `sync_jobs` with `status: 'crm_updated'`. If failed, update `sync_jobs` with `status: 'failed'` and the error message.

3.  **Frontend Data Submission:**
    *   The `/api/onboarding/submit` endpoint receives the form data.
    *   It directly calls vTiger's `PUT /Leads/{clientId}` (or `PUT /Contacts/{clientId}` if converted) API to update the client's record with the submitted form data, mapping each form field to its corresponding custom field in vTiger.

---

## 4. Security

*   **Authentication (Internal API):**
    *   The `/api/onboarding/submit` endpoint must be protected. Since it will be called from within the vTiger Customer Portal (which handles user auth), the simplest approach is to use a **pre-shared secret token**.
    *   The frontend (portal module) will include this token in an `Authorization: Bearer <SECRET_TOKEN>` header.
    *   The backend will validate this token on every request to this endpoint. The token value will be stored in environment variables.
*   **Authentication (Webhook):**
    *   vTiger webhooks should be configured to send a **secret signature** in a header (e.g., `X-Vtiger-Signature`).
    *   The backend will validate this signature using a shared secret (stored in env vars) to ensure the request genuinely came from vTiger.
*   **Authentication (vTiger/Maxio APIs):**
    *   Use API keys or OAuth tokens provided by vTiger and Maxio. These credentials will be stored securely in environment variables or a secrets manager. **Never hardcode them.**
*   **Authorization:**
    *   The MVP scope is narrow. Authorization is handled implicitly:
        *   The webhook endpoint only processes leads with the correct status.
        *   The internal API endpoint trusts the vTiger portal's authentication; the portal ensures only the authenticated client can access *their own* data. The `clientId` in the payload is used to target the correct record in vTiger.

---

## 5. Performance

*   **Asynchronous Processing:** Using a task queue (BullMQ) for the CRM-Finance sync ensures the webhook response is immediate (< 1s), providing a good user experience for the Salesperson in vTiger. The actual sync, which might take a few seconds, happens in the background.
*   **Caching (Optional):** Cache authentication tokens for vTiger and Maxio APIs (if they are long-lived) to avoid re-authenticating on every API call. Use Redis with a TTL slightly shorter than the token's expiry.
*   **Rate Limiting (Client-Side):** Implement simple debouncing on the frontend form's submit button to prevent accidental multiple submissions.
*   **Database Indexing:** Ensure the `sync_jobs` table has an index on `vtiger_lead_id` and `status` for quick lookups.
*   **Connection Pooling:** Use connection pooling for any database connections (e.g., to PostgreSQL for logs) to manage resources efficiently.

---

## 6. Code Examples

### 6.1 Environment Variables (.env)

```env
# Application
PORT=3000
APP_SECRET_TOKEN=your_strong_secret_here

# vTiger CRM
VTIGER_API_URL=https://yourcompany.vtiger.com/restapi/v1
VTIGER_ACCESS_KEY=your_vtiger_access_key
VTIGER_USERNAME=your_vtiger_username
VTIGER_WEBHOOK_SECRET=your_webhook_validation_secret

# Maxio
MAXIO_API_URL=https://api.maxio.com/v1
MAXIO_API_KEY=your_maxio_api_key

# Redis (for BullMQ & optional caching)
REDIS_URL=redis://localhost:6379

# PostgreSQL (for logging)
DATABASE_URL=postgresql://user:pass@localhost:5432/mvp_logs
```

### 6.2 Webhook Handler (Node.js/Express)
```javascript 
const express = require('express');
const crypto = require('crypto');
const { addSyncJobToQueue } = require('./jobQueue'); // Your BullMQ setup

const app = express();
app.use(express.json());

const VTIGER_WEBHOOK_SECRET = process.env.VTIGER_WEBHOOK_SECRET;

app.post('/webhook/vtiger/lead-status-change', (req, res) => {
    // 1. Validate Webhook Signature (Simple HMAC example)
    const signature = req.headers['x-vtiger-signature'];
    const expectedSignature = crypto
        .createHmac('sha256', VTIGER_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Check if it's the right event
    const { event, data } = req.body;
    if (event !== 'record.update' || data.leadstatus !== 'Ready for Finance Setup') {
        return res.status(200).json({ status: 'ignored' }); // Not our event
    }

    // 3. Create Job Record & Queue for Async Processing
    const jobData = {
        vtiger_lead_id: req.body.record_id,
        lead_data: data // Pass the relevant data to the worker
    };

    addSyncJobToQueue(jobData) // This function adds to BullMQ
        .then(job => {
            console.log(`Job ${job.id} queued for lead ${jobData.vtiger_lead_id}`);
            res.status(200).json({ status: 'received', jobId: job.id });
        })
        .catch(err => {
            console.error('Failed to queue job:', err);
            res.status(500).json({ error: 'Failed to process request' });
        });
});

module.exports = app;
```
### 6.3 Core Sync Job Worker (Node.js/BullMQ)
```javascript
const MaxioClient = require('./maxioClient'); // Wrapper for Maxio API
const VtigerClient = require('./vtigerClient'); // Wrapper for vTiger API
const { updateSyncJobStatus } = require('./db'); // Function to update sync_jobs table

async function processSyncJob(job) {
    const { vtiger_lead_id, lead_data } = job.data;
    let maxioCustomerId = null;
    let maxioSubscriptionId = null;

    try {
        // Update Job Status
        await updateSyncJobStatus(job.id, 'processing');

        // Step 1: Create Customer in Maxio
        const maxioCustomerData = {
            email: lead_data.email,
            company: lead_data.company,
            first_name: lead_data.firstname,
            last_name: lead_data.lastname,
            // ... map other required fields
        };
        const customerResponse = await MaxioClient.createCustomer(maxioCustomerData);
        maxioCustomerId = customerResponse.id;
        await updateSyncJobStatus(job.id, 'maxio_created', { maxioCustomerId });

        // Step 2: Create Subscription in Maxio (assuming default product)
        const subscriptionData = {
            customer_id: maxioCustomerId,
            product_handle: 'default-hr-package', // Your default product ID
            // ... other subscription details like billing cycle
        };
        const subscriptionResponse = await MaxioClient.createSubscription(subscriptionData);
        maxioSubscriptionId = subscriptionResponse.id;

        // Step 3: Update CRM with Maxio IDs
        const vtigerUpdateData = {
            cf_maxio_customer_id: maxioCustomerId, // Your custom field name
            cf_maxio_subscription_id: maxioSubscriptionId // Your custom field name
            // Optionally: leadstatus: 'Finance Setup Complete'
        };
        await VtigerClient.updateLead(vtiger_lead_id, vtigerUpdateData);

        // Job Success
        await updateSyncJobStatus(job.id, 'crm_updated', { maxioCustomerId, maxioSubscriptionId });
        console.log(`Successfully synced lead ${vtiger_lead_id} to Maxio IDs: ${maxioCustomerId}, ${maxioSubscriptionId}`);

    } catch (error) {
        // Job Failed
        await updateSyncJobStatus(job.id, 'failed', { error_message: error.message });
        console.error(`Sync job ${job.id} for lead ${vtiger_lead_id} failed:`, error.message);
        throw error; // BullMQ will handle retries based on its configuration
    }
}

module.exports = processSyncJob;
```



