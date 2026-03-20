---
name: java-spring-flyway-docker-backend
description: Build or refactor backend services to Spring Boot with layered domain/application/infrastructure structure, Gradle builds, Flyway migrations, Redis-backed workers, Docker/EC2 deployment, and external proxy integration. Use when replacing a Node backend with Java, when settlement or policy logic needs stronger typing and transaction boundaries, or when designing Spring APIs with Flyway and Redis from scratch.
---

# Java Spring Flyway Docker Backend

Use this skill when the backend should be implemented in Java with Spring Boot instead of Node.js.

## Goals

- Prefer strong typing for settlement, policy, state transition, and batch workflows.
- Keep module boundaries explicit: `domain`, `application`, `infrastructure`, `interfaces`, `config`.
- Use Flyway for schema ownership.
- Use Docker Compose for local and EC2 parity.
- Keep external systems behind gateway or proxy interfaces.

## Recommended stack

- Java 21
- Spring Boot 3.x
- Gradle
- Spring Web
- Spring Validation
- Spring JDBC or JPA only when it clearly reduces risk
- Flyway
- PostgreSQL
- Redis for queue, stream, cache, or lock use cases

## Structural rules

1. Separate layers:
   - `domain`: enums, aggregate state, domain services, invariants
   - `application`: use cases, commands, result DTOs, transactional orchestration
   - `infrastructure`: persistence, Redis, HTTP clients, crypto helpers
   - `interfaces`: controllers, request/response DTOs
   - `config`: Spring wiring and property binding
2. Keep controllers thin.
3. Put transactional boundaries in application services.
4. Model statuses as enums instead of stringly typed state.
5. Keep external calls behind interfaces such as `CoinManageGateway`.

## Migration workflow

When replacing a Node backend:

1. Preserve API contract intent first.
2. Move data model and state transitions before adding optimization.
3. Replace package manager and runtime files with Gradle and Spring bootstrapping.
4. Keep Docker, env, and Flyway runnable before expanding business logic.
5. Add at least one Spring test and one domain or service test before finishing.

## Redis guidance

- Use Redis Streams when event sequencing and consumer groups matter.
- Use Redis locks only for narrow critical sections.
- Do not let Redis become the source of truth when Postgres owns settlement state.

## Verification

- `./gradlew test`
- `./gradlew build`
- If schema changed: run Flyway validate or compose migration path

