/** AVOfis B03: safety check for staging target selection.
 * This is a pure preflight. It NEVER connects to Supabase, modifies data,
 * certifies a real project or authorizes a production deployment.
 */
export function checkStagingTarget(env){
 const fail=(code)=>({configured:false,code,productionReleaseAuthorized:false,
  realAuthStorageE2E:false});
 if(!env||env.AVOFIS_DATABASE_TARGET_ENV!=="staging")return fail("STAGING_MODE_REQUIRED");
 const production=env.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF;
 const staging=env.AVOFIS_STAGING_SUPABASE_PROJECT_REF;
 const regex=/^[a-z0-9]{20}$/;
 if(typeof production!=="string"||!regex.test(production))return fail("PRODUCTION_REF_REQUIRED");
 if(typeof staging!=="string"||!regex.test(staging))return fail("STAGING_REF_REQUIRED");
 if(staging===production)return fail("LIVE_PROJECT_TARGET_REFUSED");
 const url=env.AVOFIS_STAGING_SUPABASE_URL;
 if(typeof url!=="string"||url!=="https://"+staging+".supabase.co" &&
    url!=="https://"+staging+".supabase.co/")return fail("STAGING_URL_MISMATCH");
 // A correct string is not proof of a separately provisioned project.
 // Production ref may be checked against connected project metadata by a
 // separate authorised operator; never infer it from this setting.
 return {configured:true,code:"STAGING_TARGET_SHAPE_OK",
  productionReleaseAuthorized:false,realAuthStorageE2E:false};
}
if(process.argv[1]&&import.meta.url==="file://"+process.argv[1]){
 const check=checkStagingTarget(process.env);
 process.stdout.write(JSON.stringify(check)+"\n");
 if(!check.configured)process.exitCode=1;
}
