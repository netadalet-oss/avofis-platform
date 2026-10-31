/**
 * R-527/R-580/R-587 and B02: public CMS is READ-ONLY.
 * User-controlled metadata is not publication authorization.
 * Publishing requires server-side staff/MFA, revision and dual approval.
 */
export const CMS_PUBLICATION_UNAVAILABLE =
  "CMS yayınlama işlemi sunucu tarafında yetki ve çift onay doğrulanana kadar kapalıdır.";

export function canOfferCmsEditing(): boolean {
  return false;
}

export async function refuseUnverifiedCmsWrite(): Promise<{ error: { message: string } }> {
  return { error: { message: CMS_PUBLICATION_UNAVAILABLE } };
}
