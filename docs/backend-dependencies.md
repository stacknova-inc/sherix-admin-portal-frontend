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
| Assign mechanic | `/service-requests/:id/assign` | `PATCH` | Body: `{ mechanicId, reason, expectedVersion, idempotencyKey-supported }` |
| Reassign mechanic | `/service-requests/:id/reassign` | `PATCH` | Body: `{ mechanicId, reason, expectedVersion }`. Should preserve the previous mechanic in the response's timeline/history so it isn't silently lost. |
| Cancel | `/service-requests/:id/cancel` | `PATCH` | Body: `{ reason, expectedVersion }`. Must remain discoverable afterward (status: `cancelled`), not deleted. |
| Administrative correction | `/service-requests/:id/correct` (or similar) | `PATCH` | Needs a defined "what can be corrected" contract, a dedicated permission distinct from general `SERVICE_REQUESTS` read access, and an audit trail of what changed. |
| Dispute resolution | `/service-requests/:id/dispute` (or similar) | `PATCH` | Not defined anywhere; `status: "disputed"` is currently read-only/display-only. |

For every one of these, when they do exist, the frontend needs:
- A documented **response body** (so the admin sees the confirmed new state, not just a 200).
- **Expected status codes**, specifically whether a conflict returns `409` (matching the
  pattern already used by `/commissions` and the policy-config endpoint - see below) and
  whether validation errors return `422` vs `400`.
- Whether the endpoint honors an `Idempotency-Key` request header (see §3).
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

## 3. Idempotency key support - unverified everywhere

The frontend now generates and sends an `Idempotency-Key` header (see `lib/api.ts`,
`generateIdempotencyKey`, `hooks/useIdempotencyKey.ts`) on these mutations:

- `POST /commissions` (create)
- `PUT /commissions/bulk` (bulk update)
- `POST /admin/notifications/broadcast`
- `PATCH /admin/verification/companies/{approve|reject}/:id`
- `PATCH /admin/verification/accounts/companies/{reactivate|suspend}/:id`
- `PATCH /admin/verification/mechanics/{approve|reject}/:id`
- `PATCH /admin/verification/accounts/users/{reactivate|suspend}/:id`

**Whether any backend endpoint actually reads or enforces this header is unverified.** No
response, error message, or documentation in this repository confirms server-side support.
Until confirmed, treat this as a best-effort client-side hint only - it prevents nothing on
its own if the backend doesn't deduplicate by that header.

**Request:** confirm whether `Idempotency-Key` (or an equivalent, e.g. a body field) is
supported, on which endpoints, with what dedup window, and what response a replayed key
should produce (ideally: the original success response, not a new operation and not an error).

Mutations that do **not** yet send an idempotency key (same pattern would apply once
confirmed): staff create/update, service create/update, issue create/update, general
settings update, policy config update. These were left as-is in this pass to keep the change
scoped to the endpoints most likely to have financial/communication consequences from a
duplicate (commissions, broadcast notifications, account status changes).

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
frontend. Every idempotency/duplicate-payment concern from the mutation-safety audit is
currently moot here because the feature doesn't exist yet - not a bug, just not built. If/when
payment or payout mutations are added, they should follow the `expectedVersion` +
`Idempotency-Key` + unknown-outcome patterns already established for commissions in this pass,
from the start.
