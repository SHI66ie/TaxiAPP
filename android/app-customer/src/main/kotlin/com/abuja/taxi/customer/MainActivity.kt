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
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FloatingActionButton
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import com.abuja.taxi.customer.ui.theme.AbujaEmerald
import com.abuja.taxi.customer.ui.screens.LoginScreen
import com.abuja.taxi.customer.ui.screens.MapScreen
import com.abuja.taxi.customer.ui.screens.QrScannerScreen
import com.abuja.taxi.customer.ui.screens.RatingScreen
import com.abuja.taxi.customer.ui.screens.ReferralScreen
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
                    val isRatingPending by customerViewModel.isRatingPending.collectAsState()
                    val bookedRide by customerViewModel.bookedRide.collectAsState()
                    var showSignup by remember { mutableStateOf(false) }
                    var showReferral by remember { mutableStateOf(false) }
                    var showScanner by remember { mutableStateOf(false) }
                    var chatRideId by remember { mutableStateOf<String?>(null) }

                    if (user != null) {
                        if (isRatingPending && bookedRide != null) {
                            RatingScreen(
                                rideId = bookedRide!!.id,
                                viewModel = customerViewModel
                            )
                        } else if (showScanner && bookedRide != null) {
                            QrScannerScreen(
                                onQrScanned = { qr ->
                                    customerViewModel.verifyQrCode(bookedRide!!.id, qr)
                                    showScanner = false
                                },
                                onBack = { showScanner = false }
                            )
                        } else if (showReferral) {
                            ReferralScreen(
                                viewModel = authViewModel,
                                onBack = { showReferral = false }
                            )
                        } else if (chatRideId != null) {
                            ChatScreen(
                                rideId = chatRideId!!,
                                viewModel = chatViewModel,
                                onBack = { chatRideId = null }
                            )
                        } else {
                            MapScreen(
                                viewModel = customerViewModel,
                                authViewModel = authViewModel,
                                onNavigateToChat = { chatRideId = it },
                                onNavigateToScan = { showScanner = true }
                            )
                            
                            // Floating action button for Referral (Simulated for MVP)
                            Box(modifier = Modifier.fillMaxSize()) {
                                FloatingActionButton(
                                    onClick = { showReferral = true },
                                    modifier = Modifier.padding(16.dp).align(Alignment.TopStart),
                                    containerColor = AbujaEmerald,
                                    contentColor = Color.White
                                ) {
                                    Text("🎁", modifier = Modifier.padding(8.dp))
                                }
                            }
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
