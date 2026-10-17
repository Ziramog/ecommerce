# Mercadal Digital 360 — Agent Guidelines & Project Conventions

## Project Overview
- **Project**: Mercadal Digital 360
- **Architecture**: Unified Medusa 2 Backend + Dual Next.js 15 Storefronts + PostgreSQL + Redis.
- **Brands**:
  1. **Talabartería Mercadal**: B2B wholesale private portal (approved commercial clients, bulk pricing, quotes/RFQ, approval workflows).
  2. **Pampa Novus**: B2C retail premium e-commerce (mockup compliance, responsive desktop/mobile, Argentine checkout & payments).

## Infrastructure Model (Hybrid Local & Staging VPS)
- **Local PC (Windows / Antigravity 2.0)**: Development of Next.js storefronts, UI design, Git management, project orchestration. No local Docker/Postgres/Redis installed.
- **Staging VPS (Ubuntu 24.04 LTS)**: Hosts Medusa 2, PostgreSQL 16, and Redis 7 in **exclusive Mercadal staging containers**.
- **Private Access**: Connected securely via SSH / Tailscale private mesh. PostgreSQL, Redis, and Medusa Admin are strictly private (never exposed to public internet).

## Mandatory Operating Rules
- **Protect Existing VPS Services**: WOLFIM, Hermes, and Tailscale must remain completely untouched, functional, and unaffected in their ports and resources.
- **No Docker Reinstallation / Restart**: Never reinstall or restart the Docker daemon on the VPS.
- **Zero Interference with Existing Containers**: Never inspect, stop, modify, or delete existing containers, networks, volumes, or configurations.
- **Explicit Prior Authorization**: Never execute remote SSH commands or apply changes to the VPS without explicit user approval.
- **Project-Exclusive Staging Namespace**: All containers, volumes, networks, and compose files must be strictly prefixed (`mercadal-staging-*`).
- **Independent Lifecycle**: Mercadal staging containers can be started (`up`) and stopped (`down`) independently without impacting any other service.
- **Strict Separation of Staging vs Production**: Staging and future production environments must remain explicitly separated in namespaces, ports, volumes, and configurations.
- **No Git Secrets / No Log Exposure**: Never commit real credentials, `.env` files, or API keys. Never echo secrets to chat, terminal, or log files.
- **No commit / push without explicit authorization**.
- **Run build and lint checks** before proposing deployments or milestone completions.

## Model Preferences (Antigravity CLI)
- Complex implementation / architectural fix: `gemini-3.8-flash`
- Internal audit / review / validation: `gemini-3.7-flash`
- Mechanical refactors / formatting: `gemini-3.5-flash-lite`

## Architecture Documents Reference
- [Architecture Blueprint](file:///c:/Projects/mercadal-digital360/docs/architecture.md)
- [Requirements & Specifications](file:///c:/Projects/mercadal-digital360/docs/requirements.md)
- [Implementation Plan & PoC](file:///c:/Projects/mercadal-digital360/docs/implementation-plan.md)
