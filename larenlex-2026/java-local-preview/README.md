# LarenLex W1: local-only Java 21 preview

This is a **temporary local preview** to inspect the exact Gold HTML and the real 554-card v86 catalogue. It is **not** the target Spring Boot + Vaadin Flow application, and it must never be deployed to a public host: it does not provide authentication, authorization, payments or real institution APIs.

Compile on Java 21: `javac LarenLexW1Preview.java`.

From the downloaded LarenLex W1 cumulative handover ZIP, extract `W1_GITHUB_GOLD/LarenLex_W1_25_MODUL_554_KART_GOLD_IC_ONIZLEME.html`. Then run:

`java LarenLexW1Preview /path/to/LarenLex_W1_25_MODUL_554_KART_GOLD_IC_ONIZLEME.html`

Open `http://127.0.0.1:8765/` locally. The server binds only to loopback, serves a fixed HTML path, rejects other routes, and contains no private customer data.

The HTML contains the v86 legal card text and is **internal review material** pending legal approval. Do not publish it on a public domain. The full W1 must still implement Java 21 + Spring Boot + Vaadin Flow, PostgreSQL, 25 modules, real imported 554 cards, role isolation and tests. Existing AvOfis code is preserved and migrated incrementally.
