package nl.larenlex.app;

import org.json.JSONObject;

/** Referential schema check only, not a substitute for server RLS. */
public final class NativeApiRecordSchemaValidator {
    private NativeApiRecordSchemaValidator() { }
    public static void validate(JSONObject row, String tenant, String matter, String module) {
        if(row==null || !tenant.equals(row.optString("tenant_id")) || !matter.equals(row.optString("matter_id"))
            || !module.equals(row.optString("module_id")) || row.optString("id").length()>64
            || row.optString("id").isEmpty() || row.optInt("version",0)<1)
            throw new SecurityException("Record rejected by schema boundary");
    }
}
