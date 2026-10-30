/**
 * Intentional fail-closed route for legacy clients or guessed public upload
 * calls. No request body is read. A real private document broker requires
 * separate verified Auth/RLS/Storage, virus scanning and user permission.
 * This is NOT the future authorised private upload endpoint.
 */
export const dynamic="force-dynamic";
export function POST():Response{
 return Response.json({
  error:"DOCUMENT_UPLOAD_NOT_RELEASED",
  accepted:false,
  storageWrite:false,
  independentSecurityApproval:false
 },{status:403,headers:{
  "Cache-Control":"no-store, max-age=0",
  "X-Content-Type-Options":"nosniff"
 }});
}
