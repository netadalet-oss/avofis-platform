// Level 1: no verified company formation or public-client onboarding approval.
// Changing environment variables must not unlock real registration or publishing.
export const PUBLIC_ACCOUNT_REGISTRATION_ENABLED = false;
// AV-025: without verified onboarding/IdP, public sign-in is also unavailable.
export const PUBLIC_ACCOUNT_LOGIN_ENABLED = false;
export const PUBLIC_CMS_EDITING_ENABLED = false;
// B02: published content has not been independently reviewed for public release.
// This static gate cannot be opened with environment variables.
export const PUBLIC_CMS_CONTENT_READER_ENABLED = false;
