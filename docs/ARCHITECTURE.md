# Tasklane Architectural Decision Records (ADR)

This document details the architectural decisions, trade-offs, and security choices made for Tasklane. It serves as technical defense documentation for engineering evaluation.

---

## 1. Authentication and Session Token Strategy

### Context & Requirements
- Secure authentication without exposing user sessions to cross-site scripting (XSS) or credential exfiltration.
- Stateless scalability across distributed server instances.
- Automatic session extension with instant revocation in case of token theft.

### Decision
A dual-token pattern combining short-lived in-memory JSON Web Tokens (JWT) with rotating refresh tokens stored in secure `httpOnly` cookies:
1. **Access Token:**
   - Lifetime: 15 minutes.
   - Storage: JavaScript in-memory variable (never written to `localStorage` or `sessionStorage` where XSS attacks can extract it).
   - Transmission: Standard `Authorization: Bearer <token>` header.
2. **Refresh Token:**
   - Lifetime: 7 days.
   - Storage: HTTP-only cookie with `Secure`, `SameSite=Lax` (or `SameSite=None` when deployed on separate subdomains), and `path='/'`.
   - Database Persistence: Hashed with SHA-256 before storage in MongoDB to protect against database compromise.
   - Rotation: Every refresh request invalidates the previous refresh token and issues a new pair in the same token family.
   - **Reuse Detection:** If an already-revoked refresh token is presented (indicating a replay or token interception attack), all active refresh tokens in the entire family are immediately revoked, terminating any unauthorized session.

---

## 2. Server-Enforced Role-Based Access Control (RBAC)

### Context & Requirements
- Support `admin` and `user` roles.
- Prevent privilege escalation and horizontal data leakage.

### Decision
1. **Server-Side Enforcement:**
   - Client-side navigation guards (`ProtectedRoute` and `RoleRoute`) are purely cosmetic and provide user experience feedback.
   - Every single backend API endpoint validates role permissions before touching the database.
2. **Horizontal Leakage Prevention via 404 Responses:**
   - When a standard user attempts to access a task ID that belongs to another user (and they are neither creator nor assignee), the server responds with `404 Not Found` rather than `403 Forbidden`.
   - *Rationale:* A `403 Forbidden` response confirms the existence of the resource ID to an attacker, facilitating resource enumeration. A `404` prevents attackers from discovering whether an ID is valid.
3. **Self-Demotion and Orphan Safeguards:**
   - An administrator cannot demote or deactivate their own account.
   - The platform counts active administrators and strictly prohibits demoting or deactivating the last active administrator, preventing orphaned workspaces.

---

## 3. Kanban Ordering Strategy

### Context & Requirements
- Drag and drop task reordering within and between status columns.
- Reordering must persist across page refreshes and multi-user sessions without requiring full-column rewrite locks.

### Decision
A fractional/float midpoint order indexing strategy:
- Each task maintains an integer/float `order` field (defaulting to increments of 1000).
- When a task is moved to a column or dropped between two tasks (with orders $O_A$ and $O_B$), its new order is calculated as $\frac{O_A + O_B}{2}$.
- When placed at the top or bottom, it takes $O_{min} - 1000$ or $O_{max} + 1000$.
- *Trade-off:* This allows single-document `PATCH /tasks/:id/status` updates ($O(1)$ database write) rather than updating arrays of all tasks in the column ($O(N)$ writes), drastically improving concurrency.

---

## 4. Overdue Definition and Calculation

### Context & Requirements
- Transparent calculation across diverse user timezones.

### Decision
A task is classified as overdue if and only if:
1. `dueDate` is strictly before the start of today (`00:00:00.000`) in the user's reference timezone.
2. The task status is NOT `completed`.
- *Implementation:*
  - A Mongoose virtual property `isOverdue` provides this state automatically on task serialization.
  - Backend query filters leverage `{ dueDate: { $lt: startOfToday }, status: { $ne: 'completed' } }`.
  - Frontend components utilize the shared `getRelativeDueDateText` helper so overdue states are consistent across table rows, kanban badges, and dashboard metrics.

---

## 5. Database Schema and Indexing Decisions

### Context & Requirements
- High-performance filtering, debounced title search, pagination, and activity timeline retention.

### Mongoose Schema Decisions
1. **Compound Indexes:**
   - `{ status: 1, dueDate: 1 }`: Optimizes dashboard metric queries and upcoming deadline sorts.
   - `{ assignee: 1, status: 1 }`: Optimizes filtered user task queries and team task count aggregations.
   - `{ createdBy: 1, status: 1 }`: Optimizes creator-scoped filtering.
   - `{ title: 'text' }`: Provides full-text search fallback alongside regex queries.
2. **Activity Timeline Snapshots:**
   - The `Activity` collection stores a string snapshot of `taskTitle` alongside the `task` ObjectId reference.
   - *Rationale:* If a task is deleted, the activity history remains readable (e.g. "Liam Chen deleted task 'Prepare Q4 review'") without failing population or showing "Unknown task".
3. **CSV Export Protection:**
   - Export streams execute formula sanitization to mitigate CSV injection: cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with a single quote.
