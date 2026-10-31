/**
 * S1/B02/R-524/R-527/R-580/R-587: Fail closed until a server-verified
 * staff, MFA, scoped CMS permission, and two-person publication workflow exist.
 * This is a transport guard, NOT authorization or proof that Supabase RLS is fixed.
 * No request data is logged, echoed, stored, or sent to external systems.
 */
type WritableResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body: string): unknown;
};

export function rejectUnverifiedCmsMutation(
  _request: unknown,
  response: WritableResponse
): void {
  response.statusCode = 503;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify({
    code: 'CMS_WRITE_UNAVAILABLE',
    message: 'İçerik değişiklikleri şu anda kullanıma açık değildir.'
  }));
}
