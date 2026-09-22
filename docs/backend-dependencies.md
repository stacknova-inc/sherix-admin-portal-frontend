# Backend Dependencies

Things the frontend cannot safely guarantee on its own, discovered while implementing
Service Request visibility and real-time/mutation-safety work in the Admin Portal. Nothing
in this repo invents any of the endpoints, fields, or server-side behavior described below -
this is a request list for backend work, not a description of what exists today.

---

## 1. Service Request administrative actions - do not exist

No endpoint exists for any of the following. The frontend currently shows an in-UI notice
(`app/dashboard/requests/[id]/page.tsx`, `AdministrativeActionsCard`) instead of fake buttons.

| Operation | Suggested endpoint | Method | Notes |
|---|---|---|---|
| Assign mechanic | `/service-requests/:id/assign` | `PATCH` | Body: `{ mechanicId, reason, expectedVersion }` |
| Reassign mechanic | `/service-requests/:id/reassign` | `PATCH` | Body: `{ mechanicId, reason, expectedVersion }`. Should preserve the previous mechanic in the response's timeline/history so it isn't silently lost. |
| Cancel | `/service-requests/:id/cancel` | `PATCH` | Body: `{ reason, expectedVersion }`. Must remain discoverable afterward (status: `cancelled`), not deleted. |
| Administrative correction | `/service-requests/:id/correct` (or similar) | `PATCH` | Needs a defined "what can be corrected" contract, a dedicated permission distinct from general `SERVICE_REQUESTS` read access, and an audit trail of what changed. |
| Dispute resolution | `/service-requests/:id/dispute` (or similar) | `PATCH` | Not defined anywhere; `status: "disputed"` is currently read-only/display-only. |

For every one of these, when they do exist, the frontend needs:
- A documented **response body** (so the admin sees the confirmed new state, not just a 200).
- **Expected status codes**, specifically whether a conflict returns `409` (matching the
  pattern already used by `/commissions` and the policy-config endpoint - see below) and
  whether validation errors return `422` vs `400`.
- The exact **permission** required (today only `sherix_admin`/`operations_admin` can even
  view Service Requests via `Permission.SERVICE_REQUESTS`; there's no finer-grained
  correction/dispute permission to gate these actions with once they exist).

## 2. No `GET /service-requests/:id`

The list endpoint (`GET /service-requests`) is the only documented read endpoint. The detail
page (`hooks/useServiceRequests.ts`, `useServiceRequestDetail`) works around this by borrowing
a cached row from the list (instant paint) and then always confirming via
`GET /service-requests?search=<id>&limit=100`, matching by `_id`/`jobId`/`requestId`.

This is a workaround, not a guarantee: it depends on the backend's `search` param matching a
raw id, which is unverified. **Request:** a real `GET /service-requests/:id`, or a documented
`id`/`ids` filter, so direct links and background refreshes are reliable.

## 3. (removed) Idempotency key support

The frontend previously generated and sent a client-side `Idempotency-Key` header on several
mutations. It has been removed: the backend does not expect or document support for this
header on any endpoint, and there is no server-side confirmation it was ever read or enforced.

## 4. Optimistic concurrency (`expectedVersion` / `409`) - confirmed only for 4 endpoints

Real, working conflict detection exists for:
- `POST /commissions`, `PATCH /commissions/:id`, `PATCH /commissions/:id/deactivate` (now
  fixed to send `expectedVersion` - see change log), `PUT /commissions/bulk`
- The policy-config update endpoint (`services/policy-config.ts`)

Company and mechanic verification/status endpoints (`services/companies.ts`,
`services/mechanics.ts`) have **no version field on their types** (`Company`, `Mechanic`) and
send none. Two admins acting on the same company/mechanic concurrently have no compare-and-
swap protection. **Request:** either confirm these endpoints already guard against
concurrent writes some other way (e.g. a state-machine check server-side that rejects an
invalid transition), or add a `version`/`expectedVersion` contract matching the commissions
pattern. The frontend's error handling (`describeMutationError` in `lib/api.ts`) already
shows a clear conflict message *if* the backend ever returns `409` - it just currently has
no version to send that would trigger one.

Service Requests have no mutations at all yet, so this is moot there until §1 is resolved -
whatever endpoints get built should follow the same `expectedVersion` + `409` contract from
day one rather than needing this added retroactively.

## 5. `/service-requests/stats` response shape - unverified

No Postman collection, fixture, or schema for this endpoint exists in the repository. The
frontend (`app/dashboard/requests/page.tsx`, `app/dashboard/page.tsx`,
`app/dashboard/reports-analytics/page.tsx`) reads it defensively through `metricValue()`
(`lib/live-data.ts`, which never renders a raw object) against a guessed set of field name
aliases (`totalRequests`/`total`, `requested`/`pending`, `completed`/`completedJobs`,
`expired`/`expiredJobs`). **Request:** the actual response shape, so these guesses can be
replaced with real, typed fields instead of an alias chain.

## 6. `/service-requests` `jobStages` / `timeline` array shapes - unverified

Same issue: `types/index.ts`'s `ServiceRequestTimelineEvent` and
`lib/service-request-helpers.ts`'s `normalizeTimelineEvent()` read through a broad alias list
(`status/stage/event/type/title`, `timestamp/createdAt/at/date`, `actor/by/performedBy/
updatedBy`, etc.) rather than assuming a fixed shape, specifically because the real field
names were never available to confirm. **Request:** a sample payload or schema for these two
arrays.

## 7. Service Request out-of-order protection - only as strong as `updatedAt`

`lib/service-request-helpers.ts`'s `pickNewerServiceRequest()` uses `updatedAt` as the only
available ordering signal to avoid a delayed/out-of-order response regressing already-newer
cached state. There is no version/sequence/revision field on the documented Service Request
shape. This is adequate for REST polling (no true out-of-order event risk without a live
event stream - see §8) but would not be sufficient if the backend ever adds real-time push
events, where true out-of-order delivery becomes possible. **Request, if/when real-time is
built:** a monotonic sequence number or revision id per Service Request, not just `updatedAt`
(two updates within the same clock tick, or client/server clock skew, can't be ordered
reliably from timestamps alone).

## 8. No real-time transport (WebSocket/SSE/etc.)

Confirmed absent repo-wide. The Service Request list/detail pages and the dashboard fall back
to periodic invalidation (`hooks/useAutoRefresh.ts`) instead. This is a product/infrastructure
decision, not something the frontend can add on its own - documented here so it's tracked
alongside everything else that depends on it (true push updates, real duplicate/out-of-order
event handling, etc.).

## 9. `companyId` on a Service Request - no populated object observed

`resolveCompany()` (`lib/service-request-helpers.ts`) falls back to cross-referencing the
already-fetched companies list when `companyId` isn't a populated object, and shows an
explicit "not available" notice when neither resolves. **Request:** confirm whether
`companyId` is ever returned populated, or whether cross-referencing the companies list is
the intended integration.

## 10. Payments / payouts have no mutation surface at all

`services/financial.ts` is 100% read-only (`earnings()`, `transactions()`, both `GET`). There
is no "process payout," "retry payment," or any mutation for this domain anywhere in the
frontend. Every duplicate-payment concern from the mutation-safety audit is currently moot
here because the feature doesn't exist yet - not a bug, just not built. If/when payment or
payout mutations are added, they should follow the `expectedVersion` + unknown-outcome
patterns already established for commissions in this pass, from the start.

## 11. Finance administration contracts required for controlled money movement

The only confirmed finance reads are `GET /financial/transactions` and
`GET /financial/earnings`. The transaction screen forwards non-empty `search`, `user`,
`company`, `serviceRequest`, `type`, `status`, `providerReference`, `startDate`, `endDate`,
`page`, and `limit` query parameters, but the backend must document which are supported and
return `{ data: Transaction[], pagination: { total, page, limit, pages } }` to make server
filtering and pagination authoritative.

The following APIs do **not** exist in this repository and must be specified before the admin
portal can expose a money-moving control: transaction/payout detail reads, payout list and
detail reads, outstanding cash-commission balances, dispute-hold reads, and financial-history
reads. In particular, the backend also needs explicit, permission-protected endpoints for
refunds, credits, reversals, and manual adjustments. Each mutation must define the required
permission, eligibility and refundable balance checks, impact-preview response, reason,
`409`/validation responses, audit event, and a safe way to retrieve the authoritative
post-mutation record. Until then the UI intentionally sends no financial mutation.

## 12. Ratings moderation endpoints are still required

`GET /reviews` and `GET /reviews/stats` are connected as read-only, with duplicate-review
protection. The supplied contract exposes **no** endpoint to keep visible, hide, restore, or
permanently remove a review; it also does not document reported-review fields, evidence access,
assignment, or review history. The moderation queue therefore deliberately does not render
fictional moderation controls. Required contracts include the necessary permission per action,
reason and confirmation semantics, audit output, and secure evidence access.

## 13. Dispute contracts connected from the supplied Postman collection

The portal now uses `GET /disputes`, `GET /disputes/stats`, `GET /disputes/:id`,
`PATCH /disputes/:id`, and `POST /disputes/:id/resolve`. The resolve request follows the
documented `outcome`, conditional `party`, optional `amount`, and optional `note` payload.
The UI requires a non-empty resolution note. Response examples are still needed for dispute detail,
pagination/filter parameter names, financial impact previews, evidence, messages, notifications,
timeline/audit events, and precise closed/reopen behavior. There is no documented reopen or
payout-hold mutation endpoint, so none is exposed.

`GET`, `POST`, and `PATCH /admin/dispute-reasons` are connected for reason management using
`{ title, isActive }`. The `POST /admin/dispute-reasons/bulk` endpoint is intentionally not
wired until its request body schema is supplied; bulk payload envelopes vary and guessing one
would be unsafe.

## 14. Support ticket endpoints do not exist yet

The Support Tickets screens (`app/dashboard/support-tickets/page.tsx`,
`app/dashboard/support-tickets/[id]/page.tsx`, `services/support-tickets.ts`,
`hooks/useSupportTickets.ts`) are built end-to-end on the frontend - filters, conversation
thread, internal-note vs public-reply distinction, ownership/assignee, resolution workflow -
against an **anticipated, not-yet-implemented** REST contract, at the explicit request of the
product owner ("build the full UI first, backend will be implemented later"). No endpoint
under this path has ever been confirmed to exist; calling it against the real backend today
will 404. Required endpoints, matching the `expectedVersion`/`409` patterns already
established for disputes and commissions:

| Operation | Suggested endpoint | Method | Notes |
|---|---|---|---|
| List tickets | `/admin/support/tickets` | `GET` | Query params sent today: `search`, `requesterType`, `status`, `priority`, `category`, `assignee`, `startDate`, `endDate`, `page`, `limit`. Expected response: `{ data: SupportTicket[], pagination: { total, page, limit, pages } }`. |
| Stats | `/admin/support/tickets/stats` | `GET` | Powers the metric tiles; exact field names unconfirmed. |
| Detail | `/admin/support/tickets/:id` | `GET` | Must include `messages` (conversation, each with `visibility: "public" \| "internal"` or `isInternal`), `attachments`, `requester`, `assignee`/`assignedTo`, `resolutionNote`, `resolvedAt`, `resolvedBy`. |
| Update status | `/admin/support/tickets/:id/status` | `PATCH` | Body: `{ status }`. |
| Assign / reassign | `/admin/support/tickets/:id/assign` | `PATCH` | Body: `{ assigneeId }`. |
| Add note or reply | `/admin/support/tickets/:id/notes` | `POST` | Body: `{ body, visibility: "public" \| "internal" }`. A `visibility: "internal"` note must never be exposed to the requester via any customer-facing surface. |
| Resolve | `/admin/support/tickets/:id/resolve` | `POST` | Body: `{ resolutionNote }`; a resolution note is required client-side. |

The permission `Permission.SUPPORT_TICKETS` (`lib/rbac.ts`) gates both the route and, once it
exists, the API path prefix `/admin/support/tickets` - the backend should authorize this
prefix independently rather than relying on frontend gating alone.

## 15. Support Ticket / Dispute cross-linking and job-scoped filtering

Support Tickets and Disputes are, and must remain, separate records and separate
workflows - a ticket is never converted into a dispute. The frontend now models an
**optional** relationship between them, built ahead of the backend the same way the
rest of the ticket domain was (§14):

| Field/Operation | Location | Notes |
|---|---|---|
| `SupportTicket.jobId` | Ticket detail response | Optional. Links a ticket to the Service Request/Job it's about. General support tickets (account, app, billing, general questions) have no `jobId` and must remain valid without one. |
| `SupportTicket.disputeId` | Ticket detail response | Optional. Set once a ticket has been escalated. The ticket record itself is otherwise unchanged - same id, same status field, same conversation. |
| `Dispute.supportTicketId` | Dispute detail response | Optional. Set only when the dispute originated from a ticket escalation. A dispute created independently (the normal case today) has none. |
| Escalate ticket | `POST /admin/support/tickets/:id/escalate` | Body: `{ reason }`. Expected to create (or link) a Dispute and return the updated ticket (with `disputeId` populated), following the same `409` conventions as the rest of §14. The frontend calls this today; it will 404 until implemented. |
| Filter tickets by job | `GET /admin/support/tickets?jobId=...` | New query param, used by the Service Request detail page's "Related Records" tab to show tickets about a specific job. |
| Filter disputes by job | `GET /disputes?jobId=...` | `Dispute.jobId` already exists; only the query-param filtering behavior needs confirming - the frontend already sends it. |

No dispute-assignment/investigator endpoint exists (§13 already covers the documented
dispute contract, which has no `assign` operation). The dispute detail page
intentionally has no assign/reassign control for the same reason the ticket-domain
"don't invent controls" rule applies elsewhere in this document.

## 16. Optional aggregate earnings breakdown fields

The Earnings & Payments summary (`GET /financial/earnings`) currently returns enough
for Total Earnings, (Sherix) Commission, Provider Earnings, Pending Payouts, and Paid
This Month - all already wired up. If a fuller breakdown matching the per-service
worked example (Service Amount, Customer Service Fee, Total Customer Payment, Sherix
Revenue as a value distinct from Sherix Commission) is wanted at the *aggregate*
level, the backend would need to add those as named fields (or confirm existing
alias names) to that response. **This is not implemented now** - the frontend does
not compute these by summing/multiplying other numbers, consistent with the
no-client-side-financial-math rule already established in §11. The per-transaction
detail view (`app/dashboard/transactions/page.tsx`) already reads `serviceAmount`,
`serviceFee`, and a new `sherixRevenue`/`platformRevenue` alias per transaction, and
shows "Not available" until the backend supplies them.

## 17. Audit log filtering, pagination, and entity/reason/outcome fields - support unconfirmed

`GET /audit/` and `GET /audit/stats` are the only two confirmed-working audit endpoints (they
already return data in production). Everything below this line describes filtering and detail
capability the frontend now *requests* from `GET /audit/` but cannot confirm the backend
honors - the UI falls back to full client-side filtering over whatever `GET /audit/` returns,
so nothing breaks if these are ignored, but large histories will not paginate or filter
correctly server-side until they are implemented.

**Query parameters now sent on every request** (`services/audit.ts`, `AuditLogListParams`):
`search`, `actor`, `action`, `entityType`, `entityId`, `outcome`, `startDate`, `endDate`,
`page`, `limit`. Please confirm which of these the backend supports, and the exact accepted
values for `entityType` and `outcome` (the frontend currently assumes lowercase-with-underscore
entity type values like `user`, `service_request`, `payment`, `commission`, `payout`,
`dispute`, `ticket`, `review`, `configuration`, `content`, `admin`, and outcome values
`success` / `failed` / `warning` - see `AUDIT_ENTITY_TYPE_OPTIONS` / `AUDIT_OUTCOME_OPTIONS` in
`lib/audit.ts`).

**Pagination**: for stable pagination of large histories, `GET /audit/` should return
`{ data: AuditLog[], pagination: { total, page, limit, pages } }` (matching the pattern
already used by `/disputes`, `/financial/transactions`, and other paginated endpoints in this
portal). Without a `pagination` object in the response, the frontend treats the response as a
single unpaginated page and falls back to client-side pagination only.

**Fields needed per audit record**, so that filters and the read-only detail view work
correctly (all optional/defensive on the frontend today - see `AuditLog` in
`services/audit.ts`):
- `entityType` / `entityId` (or `resourceType`/`resourceId`, `targetType`/`targetId`) - what
  the action was performed on. Used to render a "Target" column and, where the viewer's role
  and the entity type are both recognized, a safe deep link back to that record
  (`lib/audit.ts`, `safeAuditEntityHref`). An unrecognized `entityType` or an inaccessible
  destination silently omits the link rather than rendering a dead one - this is deliberate,
  not a gap to fix on the frontend side.
- `reason` (or `note`) - why the action was taken, shown in the detail dialog.
- `result` / `outcome` - separate from any generic `status` field if the two differ in
  meaning for a given action type.
- `before`, `after`, and/or `changes` - optional structured payloads describing what changed.
  The frontend renders these (as formatted JSON) only when present, after recursively masking
  any key that looks like a credential (password/token/secret/card number/bank account/...) -
  those are hidden for every role, no exception - and, for a smaller set of restricted keys
  (evidence/document/attachment/receipt/KYC), only for `SUPER_ADMIN` and `COMPLIANCE_ADMIN`
  (`lib/audit.ts`, `maskAuditPayload`, `canViewAuditSensitiveDetails`). **Please confirm the
  backend does not rely on the frontend as the only place this masking happens** - if
  `before`/`after` ever contains a real secret, it should not be sent to any role that
  shouldn't see it in the first place; frontend masking is a defense-in-depth measure, not a
  substitute for not sending the data.

No endpoint exists for editing or deleting an audit log entry, and the frontend does not
expose any such control - audit history is read-only in this portal by design.
