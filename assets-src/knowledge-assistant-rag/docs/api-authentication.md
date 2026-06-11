# API Authentication Guide

The Meridian API uses **OAuth 2.0 client credentials** flow.

## Tokens
- Access tokens are valid for **60 minutes**.
- Request new tokens from `https://auth.meridianapi.example/oauth/token`.
- Tokens are JWTs signed with RS256; validate the `aud` claim is `meridian-api`.

## API keys
Client secrets must be rotated **every 90 days**. Secrets are shown once at creation; store them in your secret manager, never in source control.

## Environments
- Sandbox: `https://sandbox.meridianapi.example/v2`
- Production: `https://api.meridianapi.example/v2`

Sandbox data resets nightly at 04:00 UTC.
