---
name: ios-xcodebuild-doctor
description: Diagnose and fix iOS Xcode build and archive failures. Use when xcodebuild fails, when SPM or CocoaPods dependencies conflict, when signing breaks, or when DerivedData cache issues cause unstable builds.
---

# iOS Xcodebuild Doctor

## Workflow
1. Collect context.
Capture exact `xcodebuild` error output, Xcode version, target, and scheme.
2. Inspect build settings.
Run `xcodebuild -showBuildSettings` for the failing scheme.
Check deployment target, signing style, team ID, and code signing identity.
3. Resolve dependency layer issues.
For SPM, refresh and resolve package versions.
For CocoaPods, verify Podfile lock consistency and reinstall only when needed.
4. Address cache instability.
Clear DerivedData for the affected project if reproducible cache corruption is suspected.
Avoid broad cache purges unless isolated cleanup fails.
5. Rebuild and verify.
Run clean build and archive commands.
Document exact command set that now passes.

## Output Contract
Always provide:
- Root cause and fix location.
- Which cache or dependency action was taken and why.
- Final `xcodebuild` command that succeeds.
- Remaining signing or environment prerequisites.
