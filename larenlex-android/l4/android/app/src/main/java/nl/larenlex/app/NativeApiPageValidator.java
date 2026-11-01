package nl.larenlex.app;

import org.json.JSONArray;
import org.json.JSONObject;

/** Bounds a source page; never treats source metadata as authorization. */
public final class NativeApiPageValidator {
    private NativeApiPageValidator() { }
    public static JSONArray requirePage(String raw, String expectedModule) throws Exception {
        if(raw == null || raw.length() > 65536) throw new SecurityException("Unbounded response");
        JSONObject response = new JSONObject(raw);
        if(!expectedModule.matches("LX-(0[1-9]|1[0-4])") || !expectedModule.equals(response.optString("module_id")))
            throw new SecurityException("Module mismatch");
        JSONArray rows = response.optJSONArray("records");
        if(rows == null || rows.length()>100) throw new SecurityException("Invalid page");
        for(int i=0;i<rows.length();i++)if(!(rows.opt(i) instanceof JSONObject))throw new SecurityException("Invalid row");
        return rows;
    }
}
