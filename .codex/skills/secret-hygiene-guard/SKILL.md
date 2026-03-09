---
name: secret-hygiene-guard
description: Prevent real secrets from entering code, tests, docs, examples, commits, or PRs. Use when adding env vars, wallet keys, API tokens, signing material, fixtures, sample data, or any workflow that could leak production secrets. Also use immediately after a suspected secret exposure to rotate, purge history, and verify cleanup.
---

# Secret Hygiene Guard

## Non-negotiable rules

- Never place a real secret in source code, tests, fixtures, docs, `.env.example`, screenshots, or chat output.
- Never reuse a production wallet key, API token, SSH key, seed phrase, or signing key for test data.
- If an example needs a realistic value, use a placeholder or generate a throwaway test credential.
- Treat any committed secret as compromised even if the repo is private.

## Safe defaults

- Use placeholders such as `replace-with-private-key`, `test-only-key`, or `YOUR_API_KEY`.
- For blockchain tests, generate a fresh throwaway keypair that is not used anywhere else.
- Keep production secrets only in runtime secret stores or untracked local env files.
- Keep test addresses and production addresses visibly different.

## Before editing

1. Identify whether the change touches any secret-bearing field such as `PRIVATE_KEY`, `SECRET`, `TOKEN`, `API_KEY`, `MNEMONIC`, `PASSWORD`, `JWT`, or wallet signing config.
2. If yes, decide the safe representation before writing code:
   - Placeholder only
   - Throwaway generated test credential
   - Existing secret loaded only from untracked runtime config
3. If a real value is already present, stop treating it as data and switch to incident response.

## While editing

- Do not paste real secrets into tests to satisfy address or checksum validation.
- Prefer deriving test addresses from generated test-only keys.
- When adding examples, include comments that the value is fake only if that is not obvious from the placeholder.
- Keep docs and sandbox pages free of production wallet addresses unless the address is intentionally public and non-sensitive.

## Pre-commit checks

Run targeted searches before commit whenever secret-bearing code changed.

```bash
rg -n "PRIVATE_KEY|SECRET|TOKEN|API_KEY|MNEMONIC|PASSWORD|JWT|seed phrase|BEGIN .* PRIVATE KEY" .
```

If a specific leaked value is known, search for the exact string before commit and again after history cleanup.

```bash
rg -n "known_leaked_value_here" .
git grep -n "known_leaked_value_here" $(git rev-list --all)
```

## Incident response

If a real secret was committed, do all of the following:

1. Assume the secret is compromised.
2. Rotate or replace the live secret first.
3. Remove the secret from the working tree.
4. Rewrite git history to purge the leaked value.
5. Force-push the cleaned branch if the remote contains the leak.
6. Invalidate or update every external registration that relied on the old secret or wallet.
7. Verify the leaked value no longer appears in current files or reachable git history.

## Wallet-specific guidance

- A compromised hot wallet requires wallet rotation, not necessarily token contract redeployment.
- Confirm whether the leaked wallet is only an operational wallet or also a contract owner/admin.
- If it is only a hot wallet, update the wallet address and private key in runtime config and external partner registrations.
- If it controls contract admin permissions, review ownership transfer before assuming simple rotation is enough.

## Output expectations

When using this skill, always report:

- Whether any real secret was found
- Where it was found
- Whether the value appears in current files, git history, or both
- What was rotated or must still be rotated
- Whether remote history cleanup was completed
