package com.abuja.taxi.customer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.activity.viewModels
import com.mapbox.common.MapboxOptions
import com.abuja.taxi.customer.ui.AuthViewModel
import com.abuja.taxi.customer.ui.ChatViewModel
import com.abuja.taxi.customer.ui.CustomerViewModel
import com.abuja.taxi.customer.ui.screens.ChatScreen
import com.abuja.taxi.customer.ui.screens.LoginScreen
import com.abuja.taxi.customer.ui.screens.MapScreen
import com.abuja.taxi.customer.ui.screens.SignupScreen
import com.abuja.taxi.customer.ui.theme.AbujaTaxiTheme
import androidx.compose.runtime.*

class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val customerViewModel: CustomerViewModel by viewModels()
    private val chatViewModel: ChatViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Mapbox with the public token
        MapboxOptions.accessToken = getString(R.string.mapbox_access_token)

        setContent {
            AbujaTaxiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val user by authViewModel.currentUser.collectAsState()
                    var showSignup by remember { mutableStateOf(false) }
                    var chatRideId by remember { mutableStateOf<String?>(null) }

                    if (user != null) {
                        if (chatRideId != null) {
                            ChatScreen(
                                rideId = chatRideId!!,
                                viewModel = chatViewModel,
                                onBack = { chatRideId = null }
                            )
                        } else {
                            MapScreen(
                                viewModel = customerViewModel,
                                authViewModel = authViewModel,
                                onNavigateToChat = { chatRideId = it }
                            )
                        }
                    } else if (showSignup) {
                        SignupScreen(
                            viewModel = authViewModel,
                            onNavigateToLogin = { showSignup = false }
                        )
                    } else {
                        LoginScreen(
                            viewModel = authViewModel,
                            onNavigateToSignup = { showSignup = true }
                        )
                    }
                }
            }
        }
    }
}
