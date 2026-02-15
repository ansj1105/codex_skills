---
name: ios-release-fastlane
description: Prepare iOS release delivery with Fastlane, signing, and provisioning automation. Use when shipping to TestFlight or App Store, configuring match or sigh, validating export options, or checking CI release secrets.
---

# iOS Release Fastlane

## Workflow
1. Validate release metadata.
Check bundle ID, version build number, changelog, and target track.
2. Validate signing and provisioning.
Confirm `fastlane match` or `sigh` setup, team ID, and certificate profile mapping.
3. Validate archive export.
Check export method and `exportOptions` values for App Store or TestFlight.
4. Validate CI environment.
Ensure `FASTLANE_USER`, app-specific password or API key, and signing secrets are present.
5. Execute lane and verify.
Run the intended lane and capture the uploaded build identifier.

## Output Contract
Always include:
- Lane executed and environment assumptions.
- Signing source used (`match` or manual profile mapping).
- Export method used for archive.
- Post-upload verification steps.
