/**
 * Intentional fail-closed route for legacy clients or guessed public upload
 * calls. No request body is read. A real private document broker requires
 * separate verified Auth/RLS/Storage, virus scanning and user permission.
 * This is NOT the future authorised private upload endpoint.
 */
export const dynamic="force-dynamic";
function rejectPublicDocumentAccess():Response{
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

// Do not let another HTTP verb expose private document creation or reads.
export const POST=rejectPublicDocumentAccess;
export const GET=rejectPublicDocumentAccess;
export const PUT=rejectPublicDocumentAccess;
export const PATCH=rejectPublicDocumentAccess;
export const DELETE=rejectPublicDocumentAccess;
