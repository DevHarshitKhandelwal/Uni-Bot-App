package dev.harshit.unibot;

import android.os.Build;
import android.content.pm.ApplicationInfo;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (isDebuggable && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            bridge.getWebView().getSettings().setMixedContentMode(
                    WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            );
        }
    }
}
