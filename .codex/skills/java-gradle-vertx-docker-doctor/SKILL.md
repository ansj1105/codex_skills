---
name: java-gradle-vertx-docker-doctor
description: Diagnose and fix Java Gradle backend failures for Vert.x style services with Docker Compose, PostgreSQL Redis and Flyway dependencies. Use when build test startup migration or container integration breaks in Java 17 Gradle projects.
---

# Java Gradle Vertx Docker Doctor

## Workflow
1. Capture failing command and environment.
Collect `./gradlew` output, Java version, and Compose service status.
2. Reproduce with smallest Gradle path.
Run `./gradlew clean test` and `./gradlew shadowJar` or module equivalent.
3. Verify runtime dependencies.
Check PostgreSQL Redis and Flyway config values from env and config files.
4. Verify container integration.
Run `docker compose config` and then start only required services.
Check port conflicts, missing networks, and mounted file paths.
5. Verify end-to-end startup.
Start app with explicit profile and confirm health endpoint and critical DB queries.

## Output Contract
Always provide:
- Root cause and failing layer (build, migration, infra, runtime).
- Minimal config or code changes.
- Verification commands and pass results.
- Remaining deployment risk notes.