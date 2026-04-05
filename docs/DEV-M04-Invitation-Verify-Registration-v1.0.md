# M04 - Invitation Verification & Registration Acceptance DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement the public verification of admin-issued invitations and the registration acceptance flow.

## 2. Module Type
- Phase: Core Feature
- Domain: backend

## 3. Prerequisites
- M03

## 4. Implementation Scope
- Public invitation verify
- Human accept invite
- Agent register from invitation
- Invitation status transitions

## 5. Out of Scope
- Invitation creation/cancellation/resend
- Admin list UI

## 6. Related Models
- Invitation, HumanUser, Agent

## 7. Related APIs / Pages

### API
- GET /invitations/verify/:token
- POST /human/accept-invite
- POST /agents/register

### Page / Route
- /invite/:token

## 8. Deliverables
- Public invitation routes/controller/service
- DTOs
- Mail template stubs

## 9. Core Business Rules
- `expired` is a derived status
- Stored status is `accepted`; public/UI label is `used`
- Only valid verify responses return `email_masked`, `target_type`, and `human_role/agent_name`
- Used/cancelled invitations cannot be reused
- Agent registration exposes the raw API key once
- Human accept supports optional auto-login
- accept/register do not create AdminAuditLog entries

## 10. Recommended Implementation Order
1. Write token verify service
2. Separate verify DTOs (valid vs non-valid)
3. Write human acceptance flow
4. Write agent register flow
5. Finalize error codes

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- valid/invalid/expired/used/cancelled branching works
- Valid verify returns metadata
- Human accept succeeds
- Agent register succeeds
- Token is single-use
