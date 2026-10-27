# AVOfis: public portal, client workflow and internal operations

**Source branch:** feature/avofis-client-mvp-2026. This is a feature-gated staging implementation, not a certified production launch.

## Customer-facing information architecture

Top navigation: Services / Who we help / How it works / Information / Contact / Client login / Start an enquiry.
The logo leads home. Customer-facing content NEVER includes incorporation notes, shareholder/immigration details, funding plans or internal work tasks.

The shared canonical catalogue is \`portal/src/lib/avofis-site.ts\`, with TR / NL / DE / EN texts and nine categories:

1. Visas, residence and citizenship — invitation, sponsorship, family reunion, residence renewals, refusals and relevant specialists.
2. Employment and workplace disputes — wages, termination, contract documentation, employer and employee routes.
3. Public authorities, objections and fines — municipalities, migration authorities, tax, traffic, customs, administrative deadlines.
4. Contracts and civil disputes — sale and services, debts, tenancy, consumer claims, travel and tourism disputes, deliveries.
5. ECHR and UN human-rights mechanisms — admissibility, domestic remedies, chronology, evidence and qualified legal review.
6. Documents, apostilles and translations — civil-status records, powers of attorney, notarisation and sworn translations.
7. Education and diplomas — qualifications, transcripts, student residence, admission and education agreements.
8. Company formation and cross-border trade — KVK, supply/distribution agreements, import/export, transport, customs, specialists.
9. International employment and recruitment — offers, work permits, staffing, recruitment and labour-supply authorisation.

The audience taxonomy includes European residents with Türkiye links, migrant families, students, employees, entrepreneurs, visa applicants/sponsors, Türkiye-to-Europe, Europe-to-Türkiye and ECHR/UN applicants.

Per-service detail routes: \`/hizmetler/[slug]\`; per-audience detail: \`/kimler-icin/[slug]\`.
Avoid generic slogans, imaginary credentials, invented testimonials or unverified prices. Keep official sources in \`/bilgi\`.
Other pages: \`/nasil-calisir\`, \`/iletisim\`, \`/basvuru\`, \`/musteri\`, \`/yonetim\`, \`/yonetim/isletme\`.
Historical unrelated pages redirect and must not be used as public navigation.

## Real service lifecycle

1. Contact purpose, country and applicant role identified; no sensitive uploads in public form.
2. Staff checks urgency, jurisdiction and professional authorisation. Appeal or human-rights dates REQUIRE expert review, not an automatic calculator.
3. Scope, costs, third-party providers and service contract clarified and approved.
4. Secure account, agreement and necessary case documents.
5. Access-controlled case tasks, manually recorded due dates, messages and status.
6. Verified payment settlement (Mollie webhook + provider retrieval) and deliverables.
7. Closure and retention/deletion according to reviewed policy.

Nine guided-intake categories and four locales are supported in \`/api/intake\`. 
Cases may use category slugs; older keys remain accepted for historical records.
The intake API validates all inputs, verifies Turnstile SERVER-SIDE and uses a server-only Supabase service role.

## Internal system separation

\`/yonetim\`: independent database staff role for leads, cases, agreements, payments and messages.
\`/yonetim/isletme\`: administrator-only company programme (not indexed in public navigation), with tasks in nine internal workstreams: company, legal, finance, services, partners, operations, security, marketing and quality. It stores real task status, assigned label, notes, priorities, due dates and estimated budget. No fictional tasks are pre-created.

Customer tasks in \`avofis_case_tasks\` have explicit \`visible_to_client\` and RLS checks against the owner. Only staff may create/update case tasks. A due date is merely a manually reviewed date, not an automatic determination of court or administrative deadlines.
Company tasks in \`avofis_internal_tasks\` are readable and writable ONLY by verified database admins.

The operating programme should be populated by authorised management with these work packages:
1 Business model and revenue lines; 2 target markets and user interviews; 3 service catalogue and permission map;
4 share ownership / management / signing roles; 5 shareholders agreement and deadlock rules;
6 immigration and employment authorisation opinion; 7 Dutch BV, notary, KVK and UBO;
8 brand and trade-name clearance; 9 business address and verified contacts;
10 start-up capital and 6-month cash budget; 11 VAT, corporate tax, payroll and accounting;
12 bank and payments onboarding; 13 service pricing and margin;
14 independent specialists in NL/DE/TR; 15 professional, general and cyber insurance;
16 written case SOPs and quality controls; 17 service terms, withdrawal and complaints;
18 GDPR lawful basis, retention, DPA and international transfers;
19 accessible public portal and case system; 20 staff operation and critical deadlines;
21 market-appropriate communications and acquisition; 22 staging functional, access and security tests;
23 controlled legal launch authorisation; 24 first-90-day operating KPIs and review.

The admin may create these as REAL tasks after work authorisation and private data protection have been assessed. They are not public marketing material.

## Design contract

Use exactly:
\`\`\`css
--ref-panel: #030A22;
--ref-panel-2: #04102C;
--ref-panel-3: #071738;
--ref-gold: #dfbf59;
--ref-gold-strong: #f0d56d;
.card { background: linear-gradient(145deg,rgba(4,13,38,.99),rgba(1,4,15,.998)); }
\`\`\`
Consistent heading hierarchy, equal card geometry, aligned Lucide icons, 44px+ actionable targets; test narrow 320px/375px/390px, tablets 768px/1024px and desktop. Core public content has four languages; authenticated operational screens may still require additional localisation before broad rollout.

## Migration / operational steps (MANDATORY, NOT DONE BY A GIT COMMIT)

1. Backup staging DB and verify RLS before running SQL. Apply \`database/migrations/20261027_avofis_mvp.sql\` first.
2. Review and apply \`database/migrations/20261028_avofis_expanded_workflows.sql\`. It adds lead context, case task RLS and admin-only internal tasks.
3. Manually bootstrap verified accounts in \`avofis_staff\`. Do not grant privileges using public user_metadata.
4. Test unauthenticated, client A, client B, staff and admin role matrix for ALL tables and private storage.
5. Configure Turnstile, Supabase, auth email, secure service role, real business details, privacy notice version, approved agreements and Mollie test account.
6. Confirm jurisdiction-specific company law, immigration/work rights, legal practice, representation rules, GDPR, labour supply and travel organisers' regulations with qualified advisers.
7. Keep feature gates OFF until all checks pass: \`AVOFIS_LEGAL_READY\`, \`AVOFIS_INTAKE_ENABLED\`, \`NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED\`, \`NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED\`, \`AVOFIS_PAYMENT_ENABLED\`, \`NEXT_PUBLIC_AVOFIS_INTERNAL_ENABLED\`.
8. Verify production payment and case data flows separately. Build success / a Vercel preview URL does not verify real integrations.

Staging / preview uses generated fixtures and must not collect personal/sensitive files prior to authorisation. Do not call an untested action "live" or "operational".
