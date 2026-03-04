# Dynamic Show Config: API Contract (v1)

## Purpose
- App sends an access code to VPS.
- VPS returns a data-only config for the show profile.
- App validates, caches, and renders only supported templates.

## Endpoint
- `GET /show-config?code=<access_code>`

## Success Response (`200`)
```json
{
  "schemaVersion": 1,
  "version": "2026-03-04.1",
  "updatedAt": "2026-03-04T10:45:00.000Z",
  "profile": {
    "id": "escalion",
    "displayName": "Алексей Белинский"
  },
  "templateId": "escalion",
  "payload": {
    "notes": "optional custom fields"
  }
}
```

## Error Responses
- `404`: unknown access code
- `410`: code revoked
- `429`: too many attempts
- `500`: server failure

## Required Fields (validated in app)
- `schemaVersion` must be `1`
- `templateId` (or `profile.id`) must exist
- currently supported template ids: `escalion`

## Security Requirements
- HTTPS only
- Rate limit by IP/code
- Access logs with timestamp + code hash (not plain code)
- Optional response signing (recommended for next phase)

## Caching Behavior (client)
- On successful fetch: save to local cache (`AsyncStorage`)
- On network/server error: use cached config for same code if available
- If no remote and no cache: show error on access gate
