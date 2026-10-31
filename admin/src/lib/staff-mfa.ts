/**
 * AVOfis P09: MFA assurance level is checked with Supabase Auth on each
 * privileged server request. Never infer MFA from client-supplied flags or
 * from user_metadata, role, IP address, or a plain password session.
 *
 * https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel
 */
export type MfaAssessment={
 allowed:boolean;reason:"AAL2_VERIFIED"|"MFA_REQUIRED"|"MFA_UNAVAILABLE"
};
export async function evaluateStaffMfa(
 service:{auth:{mfa:{getAuthenticatorAssuranceLevel:(jwt:string)=>
 Promise<{data:{currentLevel?:string|null}|null,error:unknown}>}}},jwt:string
):Promise<MfaAssessment>{
 if(!jwt||jwt.length<32)return {allowed:false,reason:"MFA_REQUIRED"};
 try{
  // Explicit JWT parameter forces Supabase Auth to verify this exact
  // bearer token against the identity provider rather than a browser cache.
  const {data,error}=await service.auth.mfa.getAuthenticatorAssuranceLevel(jwt);
  if(error||!data)return {allowed:false,reason:"MFA_UNAVAILABLE"};
  return data.currentLevel==="aal2"?
   {allowed:true,reason:"AAL2_VERIFIED"}:
   {allowed:false,reason:"MFA_REQUIRED"};
 }catch{return {allowed:false,reason:"MFA_UNAVAILABLE"};}
}
