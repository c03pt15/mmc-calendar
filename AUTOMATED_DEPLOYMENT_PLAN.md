# Technical Feasibility: Automated MMC Calendar Deployment

This document outlines the effort and technical steps required to automate the creation of self-contained versions of the MMC Calendar for different groups using a **Shared Database (Multi-Tenant) strategy**.

## Overview

The MMC Calendar is built with a modern stack (**React + Vite + Supabase**) that is naturally well-suited for automation. By using a shared database with Row Level Security (RLS), we can ensure that each organization maintains its own private data space while you manage only one central codebase and database schema.

## Selected Strategy: Multi-Tenant Shared Database

This approach allows you to update the app and schema once, and have all "instances" benefit immediately.

### 1. Schema Modifications
To support multiple groups in one database, an `org_id` (or `organization_id`) must be added to every table that contains user data.

| Table | Added Column | Purpose |
| :--- | :--- | :--- |
| `tasks` | `org_id` (text/uuid) | Identifies which organization owns the task. |
| `categories` | `org_id` (text/uuid) | Allows organizations to have their own custom categories. |
| `activities` | `org_id` (text/uuid) | Segregates activity logs per organization. |

### 2. Supabase Row Level Security (RLS)
Security is the most critical part of this approach. We use Supabase RLS to "filter" data automatically based on the user's organization.

**Proposed RLS Logic:**
- Each user will have an `org_id` stored in their `auth.users` metadata.
- A Policy will be created for each table:
  ```sql
  -- Example Policy for the tasks table
  CREATE POLICY "Users can only see tasks from their org"
  ON tasks FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id'));
  ```
- This ensures that the database itself protects the data isolation.

### 3. Automated Self-Provisioning (SaaS Flow)

You can build a "sign-up and spin-off" flow that automates the creation of new organization profiles.

#### Technical Architecture

1.  **Landing Page**: A simple form (Name, Org Name, Admin Email).
2.  **Orchestrator (Backend)**: A serverless function (e.g., Vercel Function).
3.  **The "Spin-off" Logic**:
    -   **Step 1: DB Entry**: Register the new organization and admin user in the shared database.
    -   **Step 2: Hosting**: Deploy a new frontend instance (or subfolder/subdomain) that points to the main Supabase project with its unique `org_id`.
    -   **Step 3: Completion**: Redirect the user to their new URL.

### 4. Effort Estimate
Building this "Orchestrator" and wiring it to the APIs would take approximately **10–15 hours** of development time to ensure error handling and proper security.

## Conclusion
The Shared Database approach turns the MMC Calendar into a true SaaS platform. It is the most scalable and maintainable way to manage hundreds of versions while keeping your development overhead low.
