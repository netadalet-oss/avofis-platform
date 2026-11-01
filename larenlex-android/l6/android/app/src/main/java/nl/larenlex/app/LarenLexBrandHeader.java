package nl.larenlex.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Preview-only visual identity, not evidence of a reviewed corporate mark. */
public final class LarenLexBrandHeader {
    private LarenLexBrandHeader() {}

    private static int dp(Activity activity, int value) {
        return (int) (value * activity.getResources().getDisplayMetrics().density + .5f);
    }

    public static LinearLayout create(Activity activity, String title, int titleSp) {
        LinearLayout row = new LinearLayout(activity);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, dp(activity, 4), 0, dp(activity, 10));

        ImageView mark = new ImageView(activity);
        mark.setImageResource(R.drawable.larenlex_brand_mark);
        mark.setScaleType(ImageView.ScaleType.FIT_CENTER);
        mark.setContentDescription("LarenLex geçici LL marka simgesi");
        LinearLayout.LayoutParams markParams = new LinearLayout.LayoutParams(
                dp(activity, 52), dp(activity, 52));
        markParams.setMargins(0, 0, dp(activity, 12), 0);
        row.addView(mark, markParams);

        LinearLayout labels = new LinearLayout(activity);
        labels.setOrientation(LinearLayout.VERTICAL);

        TextView brand = new TextView(activity);
        brand.setText("LarenLex");
        brand.setTextSize(15);
        brand.setTextColor(Color.rgb(135, 102, 44));
        brand.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        labels.addView(brand);

        TextView heading = new TextView(activity);
        heading.setText(title);
        heading.setTextSize(titleSp);
        heading.setTextColor(Color.rgb(17, 39, 66));
        heading.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        heading.setMaxLines(3);
        labels.addView(heading);
        row.addView(labels, new LinearLayout.LayoutParams(0, -2, 1f));
        row.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);
        return row;
    }
}
