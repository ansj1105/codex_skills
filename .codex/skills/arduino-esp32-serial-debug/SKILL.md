---
name: arduino-esp32-serial-debug
description: Diagnose and iterate Arduino ESP32 firmware sketches with fast serial-driven debugging. Use when .ino builds fail, board settings mismatch, upload errors occur, peripherals misbehave, or runtime logs are needed to isolate hardware software integration issues.
---

# Arduino Esp32 Serial Debug

## Workflow
1. Lock board and toolchain settings.
Confirm board type, partition scheme, flash frequency, and COM port.
2. Reproduce compile and upload path.
Build sketch and capture first compile error or upload failure.
3. Isolate peripheral assumptions.
Validate pin mappings, voltage expectations, and required init sequence.
4. Add focused serial probes.
Instrument setup and loop checkpoints with concise tagged serial logs.
5. Verify on-device behavior.
Test reboot behavior, watchdog stability, and sensor response under repeated runs.

## Output Contract
Always include:
- Required board and port settings.
- Root cause category (build, upload, pinmap, runtime).
- Minimal code or config fix.
- Manual test checklist for device verification.