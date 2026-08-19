package com.abuja.taxi.customer.ui.components

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun PaymentWebView(
    url: String,
    onPaymentComplete: (String) -> Unit
) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        // In a real app, look for a success callback or redirect URL
                        if (url?.contains("callback") == true || url?.contains("mock-checkout") == true) {
                            onPaymentComplete("ABJ_PAY_MOCK_" + System.currentTimeMillis())
                        }
                    }
                }
                settings.javaScriptEnabled = true
                loadUrl(url)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
