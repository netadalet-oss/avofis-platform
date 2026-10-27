# AVOfis — pan-European legal, administrative and business services
**Architecture revision:** 28 October 2026. Branch: feature/avofis-client-mvp-2026.
**Status:** Catalogued proposed services; NOT an authorisation to practise, operate or accept payments.

## Market definition
Holland and Germany are operational priorities, NOT geographical limits. AVOfis can plan services involving Netherlands-to-Netherlands, Germany-to-Germany, Netherlands–Germany, other intra-European relationships, and European matters with or without any Türkiye connection. Relevant user groups include migrants, students, employees, employers, entrepreneurs, tenants, landlords, debtors, creditors, consumers, human-rights applicants and people dealing with any European authority.

Do not claim AVOfis is an accredited Dutch law firm, a German Rechtsanwaltskanzlei, a Dutch notary, a sworn translator, a licensed debt collector or an authorised court representative without verification. In the Netherlands, jurist is not a protected occupational title, while advocaat is a separate regulated profession. Practising as a company owner/worker still depends on verified immigration and employment authorisations.

## 16 service categories
Customer-facing catalogue (four editorial groups, 16 individual service pages):
**Legal / dispute / representation:** legal advice and opinions; court and agency representation; debt and collections; contracts and civil disputes; housing/tenancy/insurance; criminal complaints/victim rights/traffic.
**Public authorities / immigration / rights:** objections and fines; social security/tax/benefits; visas/residence/citizenship; ECHR/UN human-rights procedures.
**Europe / employment / commerce:** intra-European transactions, employment disputes, company/trade services, international recruitment.
**Documents / education:** documents/apostilles/translation, student/qualification matters.

All service pages provide a concrete list, initial-document requirements, a real process outline and explicit scope boundaries.
Audience pages add Europe-only cases, legal consultation, creditors/debtors, tenancy and benefits to earlier migrant, student, employer, travel and Türkiye-linked groups. Turkish links are optional; there is no mandatory Türkiye connection.

## Country-by-country authorisation decision
Classify each actual service by:
- Lead country and second relevant country, applicable law, receiving authority and client identity.
- Labour right of the person performing it, business registration, protected title, permitted professional service, court procedure and power of attorney.
- Particular procedure, deadline, remedy and stage of proceedings.
- Whether there is a regulated debt collection, tax-adviser, staff-supply, sworn-translation or notarial component.
- Who signs the client agreement, takes the professional responsibility, holds insurance and pays the fees.
- Whether a licensed Dutch advocaat, German Rechtsanwalt or other authorised professional must take the matter.
Never infer permission in one EU country from permissibility in a different country.

### Authoritative Dutch rules
**Jurist / administrative representation:** Dutch Rechtspraak says jurist is not a protected title; administrative procedures generally allow non-advocaat representation under written machtiging:
https://www.rechtspraak.nl/naar-de-rechter/rol-in-rechtszaak/gemachtigde/gemachtigde-bestuursrecht

**Cantonal cases:** generally ordinary claims up to and including €25,000; tenancy, labour, consumer purchase and some other statutory categories irrespective of the amount. A lawyer is not required for many first-instance kanton proceedings, but appeals and cassation ordinarily have different requirements:
https://www.rechtspraak.nl/naar-de-rechter/rechtszaak-beginnen-particulier-of-organisatie/dagvaardingsprocedure-beginnen-kantonrechter

**Debt collection:** Wki requirements may include registration with Justis before collecting third-party claims against natural persons resident in the Netherlands. Collections must not be offered as operating without the relevant status. Official:
https://www.justis.nl/producten/screening-incassodienstverlening/voor-wie-geldt-de-wki

**Huurcommissie:** written or appropriately verified authorisation for vertegenwoordiging and distinct statutory jurisdiction:
https://www.huurcommissie.nl/support/beleidsboeken/procesreglement/de-zitting

**Crime:** AVOfis must not imply Dutch criminal-defence counsel powers. Limited petty-offence representation differs depending on participation and procedural rule; verify per case:
https://www.rechtspraak.nl/naar-de-rechter/rol-in-rechtszaak/gemachtigde/gemachtigde-strafrecht

### Germany and intra-European
German RDG §2 covers case-specific legal examination for third parties; §3 requires an applicable permission; §10 covers registered specialist categories (including collections and specified foreign law advice). Services provided from abroad do not automatically escape the German rules:
https://www.gesetze-im-internet.de/rdg/BJNR284010007.html

### ECHR, UN mechanisms
The European Court of Human Rights Rule 36 allows different representation at initial application and later notified/hearing stages. At later stages a lawyer authorised in a Contracting State or another person approved by the President may be required. No claim of universal right to represent at all stages.
https://www.echr.coe.int/documents/d/echr/library-2025-roc-eng
Treat short deadlines, last domestic judgment date, admissibility and sensitive records as PRIORITY specialist screening; an online form does not stop any legal deadline.

## Product and routing modifications
- Main page now foregrounds domestic and cross-European legal services rather than Türkiye–Europe-only operations.
- /hizmetler: four professional editorial groups with 16 complete entries, full TR/NL/DE/EN scope descriptions.
- /kimler-icin: 14 targeted groups including users with no Türkiye ties.
- /basvuru: a service, primary jurisdiction, optional secondary jurisdiction, named other country, court/authority, applicant role, current stage and, for urgent legal subjects, decision-notification date. NEVER request sensitive documents at first contact.
- /api/intake: server-side matching catalogue keys, country and field validation plus verified Turnstile, feature gates and private Supabase writes.
- /yonetim: internally visible details for multi-jurisdiction incoming leads.
- /bilgi: official links for Dutch courts, Huurcommissie, Justis, UWV, SVB, Belastingdienst, German RDG, EU guidance, ECHR and OHCHR.
- Gold/navy brand remains unchanged. Main page features carefully selected services; full catalogue organised separately.

## Database and launch status
The existing database migration \`database/migrations/20261028_avofis_expanded_workflows.sql\` contains new lead routing fields and remains a **source-file proposal** until manually reviewed and applied to staging/production. Existing live-data gate values must remain OFF without full clearance. DB RLS must be tested for anon, unrelated client, case owner, operator, and admin. 
A green build or preview is not proof of GDPR compliance, security, operational licence, visual QA or professional authority. Review German legal-practice constraints, Wki, ECHR procedural rules, registered company/employment rights, contract terms and actual payment integrations before activating.
