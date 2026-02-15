---
name: android-gradle-doctor
description: Diagnose and fix Android Gradle build, test, and dependency failures in Android projects. Use when Gradle sync/build/test fails, when AGP Kotlin Gradle versions conflict, or when cache and daemon issues cause flaky behavior.
---

# Android Gradle Doctor

## Workflow
1. Collect failure context.
Run failing command, stacktrace, and Gradle versions.
Capture `android/build.gradle`, `android/app/build.gradle`, `gradle.properties`, `gradle/wrapper/gradle-wrapper.properties`.
2. Reproduce with minimal commands.
Run `./gradlew :app:assembleDebug`.
Run `./gradlew :app:lint :app:testDebugUnitTest`.
3. Diagnose dependency and toolchain issues.
Run `./gradlew :app:dependencies --configuration debugRuntimeClasspath`.
Check AGP, Kotlin, Gradle wrapper, and JDK compatibility.
4. Resolve cache and daemon instability.
Run `./gradlew --stop`.
If needed, clean module build outputs and retry.
Only clear global Gradle caches when simpler fixes fail.
5. Verify and summarize.
Re-run failing tasks.
Report root cause, exact file edits, and any version matrix decisions.

## Output Contract
Always provide:
- Root cause in one sentence.
- Minimal diff required to fix.
- Verification commands and their result.
- Follow-up risks such as deprecated APIs or pending version upgrades.
