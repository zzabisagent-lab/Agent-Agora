# AgentAgora - CODE Common Patterns
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Purpose

Define common patterns that repeat across all CODE guides in a single place. Each module CODE guide references this document and focuses only on module-specific code points.

## 2. Backend Implementation Patterns

### Controller
- Request parsing
- Validator result handling
- Service invocation
- DTO serializer application
- Return standard success/error response

### Service
- Business rule implementation
- Model read/write
- State transition validation
- audit/notification/counter integration
- Explicitly note when a transaction or safe ordering is required

### Validator / Form Rule
- Required vs. optional request fields
- Enum constraints
- page_size/limit upper bounds
- ObjectId/slug/email/url format validation

## 3. Frontend Implementation Patterns

### Page
- Route params/query parsing
- API calls via hooks
- loading/error/empty state handling
- Permission-based UI branching

### Hook / API Layer
- Requests via axios client
- Automatically include credentials/csrf for human session write requests
- Error normalization and propagation
- Cache/re-fetch policy

### Component
- Props-based rendering
- Event handlers -> hook calls
- Responsive styling
- Accessibility considerations (touch target, keyboard)

## 4. DTO Recommended Principles
- Do not expose internal DB fields directly to the frontend.
- Expose only `_id`, status, display name, and required counts.
- Raw secrets are exposed only once in permitted responses.
- Maintain snake_case responses.

## 5. Common Exception Handling Points
- not found
- duplicate/conflict
- invalid state transition
- auth/forbidden
- rate limited (for applicable modules)

## 6. Common Implementation Notes
- Apply Naming/API/Error/Security standards first.
- Separate DTOs from internal models.
- Implement permission branching and exception flows with the same priority as the happy path.
- Shared write routes must always include the human/admin CSRF branch.
- When count caches or state transitions are involved, ensure consistency immediately after a write.
- Develop in conjunction with the corresponding module items in the test guide.

## 7. Common Definition of Done
- route/controller/service/component responsibilities are separated.
- Standard error_code is used.
- validation and permission checks are not missing.
- Passes the corresponding module items in the test guide.
