# M04A - Admin Operations Module CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns, refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/adminController.js
- src/services/adminInvitationService.js
- src/services/adminAgentService.js
- src/services/adminHumanService.js
- src/services/adminSubAgoraRescueService.js
- src/services/adminAuditService.js
- src/routes/adminRoutes.js
- src/validators/adminValidators.js

## 2. Core Components
- stats aggregator
- audit writer
- filter parser
- ownership transfer service
- subagora rescue service

## 3. Module-Specific Code Points
- Only admins can perform invitation/manual register/raw credential issuance
- Manual human create returns `reveal.temp_password` once
- All admin write actions require an audit log entry
- Only pending invitations can be cancelled
- Resending expired invitations is allowed
- Removing the last admin is prohibited (LAST_ADMIN_PROTECTED)
- Ownership transfer target must be an active human
- subagora rescue / owner transfer creates an audit log with target_type=`subagora`
- accept/register actions are not subject to AdminAuditLog

## 4. Test Points
- Each write action succeeds
- temp password/api key revealed only once
- rescue/owner transfer behavior
- audit log creation
- filter/pagination
- Last admin removal is prevented
