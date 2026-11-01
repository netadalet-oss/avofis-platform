# LarenLex development: encrypted single-device task list

Real local workflow beyond catalog navigation: add/edit/complete/delete up to 100 tasks. App-private AES-256-GCM using AndroidKeyStore with random nonces and authenticated AAD; atomic file replacement and input limits. No internet, no login, no cross-device sync or legal due-date calculation. This remains a developer-only, single-user workspace with no accepted Auth/RLS or real-client confidentiality assurance.

Security constraints: no plaintext persistence, backup disabled by existing manifest, FLAG_SECURE active, no silent reset of corrupted ciphertext, no production keys, and no logging task contents. Real Android Keystore, process crash and key invalidation tests are NOT performed in JVM tests. The test suite checks source constraints and validation, not independent device acceptance.

Release gates: original 14/69/453 inventory, A2 accepted 0/453, A6 device 0/12, A7 permissions not approved; no claims about legal services, production identity or server integration.
