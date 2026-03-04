# Roadmap: Dynamic Downloaded Show Screens

## Phase 1 (done in code now)
1. Add remote config service in app (`configService`)
2. Add strict payload validator (`schemaVersion`, `templateId/profile.id`)
3. Add local cache fallback per access code
4. Bind access-code gate to VPS fetch + cache fallback

## Phase 2 (VPS backend)
1. Create `GET /show-config?code=...`
2. Add DB tables:
   - `access_codes`
   - `show_configs`
   - `access_code_bindings`
3. Add admin flow to bind code -> config version
4. Add rate limit + code lock policy

## Phase 3 (data model expansion)
1. Move current static escalion UI definition to server JSON
2. Add sections/rows/icons/actions schema
3. Add training overlay schema (card selectors, segments, transitions)
4. Add Wi-Fi animation rules schema (speed, symbols, counts)

## Phase 4 (runtime renderer)
1. Replace template-specific hardcode with data-driven renderer
2. Keep whitelist of supported component types (no remote JS execution)
3. Add schema migrations (`schemaVersion` + client migrators)
4. Add telemetry for invalid configs and rendering errors

## Phase 5 (security hardening)
1. Add response signature (Ed25519)
2. Verify signature in app before applying config
3. Add key rotation strategy (`kid` + active public keys list)
4. Add replay protection (`issuedAt`, `expiresAt`, nonce if needed)

## Phase 6 (ops and release)
1. Add staging endpoint + staging keys
2. Add smoke tests for known access codes
3. Add rollback mechanism (pin previous config version)
4. Add monitoring dashboards (error rates, fetch latency, cache-hit ratio)

## Acceptance checklist
1. New code can be added only on server, no app rebuild needed
2. App starts and works offline after one successful fetch
3. Invalid or tampered config is rejected safely
4. Existing BLE flow remains stable while switching templates
