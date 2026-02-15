---
name: legacy-spring-war-maintainer
description: Maintain and stabilize legacy Spring WAR projects built with Maven and older servlet stacks such as eGovFrame era systems. Use when dependency conflicts, JDK compatibility, packaging errors, or migration-safe refactors are required without full framework upgrades.
---

# Legacy Spring War Maintainer

## Workflow
1. Capture baseline constraints.
Record current JDK, servlet container, Maven version, and deployment target.
2. Reproduce build and package failures.
Run `mvn clean package` with full errors and identify first failing plugin or dependency.
3. Resolve dependency drift safely.
Pin transitive versions and remove conflicting logging or XML parser combinations.
4. Protect runtime compatibility.
Confirm `war` packaging, web.xml or dispatcher config, and datasource settings remain compatible.
5. Plan incremental modernization.
Separate urgent fixes from upgrade backlog to avoid risky all-at-once migrations.

## Output Contract
Always provide:
- Compatibility matrix (JDK, Maven, container).
- Minimal safe fix set.
- Packaging and startup verification results.
- Deferred modernization tasks.