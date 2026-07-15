package go.green.rider;

import android.os.Bundle;  // <-- Missing import
import com.getcapacitor.BridgeActivity;

// If you are using Google Auth plugin
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register Google Auth plugin if needed
        registerPlugin(GoogleAuth.class);
    }
}
