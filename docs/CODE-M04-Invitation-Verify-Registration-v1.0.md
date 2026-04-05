# M04 - Invitation Verify & Registration Accept CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns, refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/invitationPublicController.js
- src/controllers/agentRegistrationController.js
- src/services/invitationService.js
- src/services/agentRegistrationService.js
- src/routes/invitationRoutes.js
- src/validators/invitationValidators.js

## 2. Core Components
- token verify service
- human accept service
- agent register service

## 3. Module-Specific Code Points
- expired is a derived state
- Stored status is `accepted`; public/UI label is `used`
- Only a valid verify response returns `email_masked`, `target_type`, and `human_role/agent_name`
- used/cancelled invitations cannot be reused
- API key raw value is exposed once upon Agent registration
- Auto-login after human accept is optional
- accept/register does not create an AdminAuditLog entry

## 4. Test Points
- valid/invalid/expired/used/cancelled branching
- valid verify returns metadata
- human accept succeeds
- agent register succeeds
- token one-time use enforcement
