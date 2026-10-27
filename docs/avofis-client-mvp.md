# AVOfis client-service MVP

Existing repository is extended, NOT replaced. Responsive landing page in Turkish, Dutch and English; services and official-information pages; feature-gated public intake; client documents, messaging, contracts and Mollie payment; staff panel; access-controlled SQL migration.

## Local/staging setup

1. Use Node 22 or later, run npm install in the monorepo root, then npm run build:portal and npm run build:admin.
2. Create a new Supabase staging project. Apply database/migrations/20261027_avofis_mvp.sql in the SQL editor only after reviewing the policies. Back up any production database first.
3. Enable Supabase Auth email confirmation. Create a verified staff account, then add user_id to public.avofis_staff using privileged SQL. Never grant staff privileges by user_metadata.
4. Set variables from portal/.env.example and admin/.env.example. SUPABASE_SERVICE_ROLE_KEY and MOLLIE_API_KEY are server-only; never prefix them with NEXT_PUBLIC_.
5. Keep AVOFIS_LEGAL_READY, AVOFIS_INTAKE_ENABLED, AVOFIS_PAYMENT_ENABLED and NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED false until company registration, working rights, insurance, privacy, contracts and security tests are complete.
6. For payment testing configure Mollie test key and publicly accessible HTTPS AVOFIS_PUBLIC_BASE_URL for provider webhooks. Returning from checkout does not prove payment; only verified provider webhook updates status.
7. Enable NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED and AVOFIS_INTAKE_ENABLED together, with working Cloudflare Turnstile site/secret keys, only after legal approval.

## Features

- / : responsive three-language public landing page, professional authority disclaimers
- /hizmetler : services and specialist boundaries
- /bilgi : official information resources
- /gizlilik : provisional privacy information, must be completed with actual registered company information
- /basvuru : minimal-data Turnstile public enquiry (off until configured)
- /musteri : signed-in customer cases, typed-name contract acceptance, private document upload and read, case messages, hosted payment
- /yonetim : verified staff enquiry/case/contract/message area
- /api/intake : server-only Supabase service write after flags and CAPTCHA
- /api/payments/checkout : server-only Mollie checkout based on staff-approved case price and accepted agreement
- /api/payments/webhook : fetch payment from Mollie before updating payment state

## Security and launch limits

- Draft privacy page is not a final GDPR art. 13 notice. Add the real company identity, address, privacy contact, legal basis, recipients, retention and transfer details before intake.
- Typed-name acceptance is not a qualified electronic signature. Have a Dutch lawyer approve actual consumer terms, cancellation/withdrawal requirements, contract version and acceptance evidence.
- Client files use private Supabase bucket; database migration restricts uploads to accepted cases and case access to authenticated owner/staff. Test access control with 3 accounts.
- No automatic invoice/BTW computation, document retention/deletion workflow, external legal services, email notifications or qualified signatures are claimed here.
- Legacy research/CMS pages remain but must receive separate RLS, accessibility and vulnerability review. Public CMS edit controls have been disabled and admin CMS staff check no longer trusts mutable user metadata.
- Admin previously tracked .env.local with public NEXT_PUBLIC_SUPABASE_* settings; this file is removed. Check Git history and rotate any truly private secrets if found.
- Staff document listing UI, customer invitation/identity workflow, automated invoice PDF and live deployment are follow-on work before production.
- Latest Next.js/React versions are pinned; install lockfile and run full CI with real dependencies. Security scanner and live test still required.

## Acceptance checklist

- Anonymous users cannot read client cases, agreements, files or payment records.
- Client A cannot read or upload to client B's case.
- A user who registers with role='admin' in metadata cannot obtain staff access.
- Signed agreement cannot be altered; agreed price cannot be changed.
- Without all legal flags on, intake and payment endpoints reject requests.
- Fake payment redirect does not mark a payment paid.
- Staging mobile widths 320/375/390/430/768/1024 tested with keyboard and screen reader.
