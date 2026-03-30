# Swagger API Docs Guide

This project uses a modular OpenAPI setup designed for maintainability and evaluation demos.

## Docs Endpoints

- Swagger UI: /api-docs
- Raw OpenAPI JSON: /api-docs.json

## Folder Structure

- docs/swagger/index.js: Express integration and UI mounting
- docs/swagger/openapi.js: OpenAPI root config (info, servers, tags, components, paths)
- docs/swagger/components/schemas.js: Shared schemas and reusable responses
- docs/swagger/paths/*.paths.js: Path groups by module and role

## How To Add New Endpoint Docs

1. Open the relevant file in docs/swagger/paths.
2. Add the new path item with method, tag, summary, security, params, and responses.
3. Reuse component schemas where possible from docs/swagger/components/schemas.js.
4. Refresh /api-docs to verify.

## Documentation Convention

- Group by API role or domain.
- Keep operation summaries action-oriented.
- Add security for protected routes.
- Prefer reusable schemas and responses.
