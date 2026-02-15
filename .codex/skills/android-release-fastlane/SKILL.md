---
name: android-release-fastlane
description: Prepare and ship Android release builds with Fastlane and Gradle signing settings. Use when publishing to Play Console, configuring signing or flavors, validating R8 Proguard behavior, or preserving release artifacts like mapping files.
---

# Android Release Fastlane

## Workflow
1. Validate release inputs.
Confirm `applicationId`, versioning, and release notes source.
Check keystore path, alias, and passwords are provided via secure local or CI secrets.
2. Validate Gradle release configuration.
Check `signingConfigs`, `buildTypes`, and any product flavors.
Run `./gradlew :app:assembleRelease` and `./gradlew :app:bundleRelease`.
3. Verify shrinker and symbols.
Check R8 Proguard is configured as intended.
Archive `mapping.txt` with version tag for crash deobfuscation.
4. Validate Fastlane lane.
Inspect `fastlane/Fastfile` lanes and required env vars.
Run lane in dry-run style where possible before production upload.
5. Release readiness summary.
Report artifact paths, signing identity used, and post-release checks.

## Output Contract
Always include:
- Build artifacts (`.aab` or `.apk`) and their paths.
- Mapping file retention status.
- Required secrets checklist for local and CI.
- Next command to execute for release.
