package com.abuja.taxi.driver

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.activity.viewModels
import com.mapbox.common.MapboxOptions
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FloatingActionButton
import androidx.compose.ui.Alignment
import com.abuja.taxi.driver.ui.AuthViewModel
import com.abuja.taxi.driver.ui.ChatViewModel
import com.abuja.taxi.driver.ui.DriverViewModel
import com.abuja.taxi.driver.ui.EarningsViewModel
import com.abuja.taxi.driver.ui.KycViewModel
import com.abuja.taxi.driver.ui.screens.ChatScreen
import com.abuja.taxi.driver.ui.screens.DriverMapScreen
import com.abuja.taxi.driver.ui.screens.EarningsDashboardScreen
import com.abuja.taxi.driver.ui.screens.KycScreen
import com.abuja.taxi.driver.ui.screens.LoginScreen
import com.abuja.taxi.driver.ui.screens.PassengerRatingScreen
import com.abuja.taxi.driver.ui.screens.SignupScreen
import com.abuja.taxi.driver.ui.theme.AbujaTaxiTheme
import androidx.compose.runtime.*

class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val driverViewModel: DriverViewModel by viewModels()
    private val chatViewModel: ChatViewModel by viewModels()
    private val kycViewModel: KycViewModel by viewModels()
    private val earningsViewModel: EarningsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Mapbox
        MapboxOptions.accessToken = getString(R.string.mapbox_access_token)

        setContent {
            AbujaTaxiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val user by authViewModel.currentUser.collectAsState()
                    val pendingRatingRideId by driverViewModel.pendingRatingRideId.collectAsState()
                    var showSignup by remember { mutableStateOf(false) }
                    var showEarnings by remember { mutableStateOf(false) }
                    var chatRideId by remember { mutableStateOf<String?>(null) }

                    if (user != null) {
                        if (user!!.role == "DRIVER" && user!!.id.startsWith("usr_")) { // New user without verified profile
                             KycScreen(
                                driverId = user!!.id,
                                viewModel = kycViewModel,
                                onLogout = { authViewModel.logout() }
                            )
                        } else if (pendingRatingRideId != null) {
                            PassengerRatingScreen(
                                rideId = pendingRatingRideId!!,
                                viewModel = driverViewModel
                            )
                        } else if (showEarnings) {
                            EarningsDashboardScreen(
                                driverId = user!!.id,
                                viewModel = earningsViewModel,
                                onBack = { showEarnings = false }
                            )
                        } else if (chatRideId != null) {
                            ChatScreen(
                                rideId = chatRideId!!,
                                viewModel = chatViewModel,
                                onBack = { chatRideId = null }
                            )
                        } else {
                            Box(modifier = Modifier.fillMaxSize()) {
                                DriverMapScreen(
                                    viewModel = driverViewModel,
                                    driverId = user!!.id,
                                    onNavigateToChat = { chatRideId = it }
                                )
                                
                                // Floating Action Button for Earnings
                                FloatingActionButton(
                                    onClick = { showEarnings = true },
                                    modifier = Modifier.padding(16.dp).align(Alignment.TopEnd),
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                ) {
                                    Text("₦", modifier = Modifier.padding(8.dp))
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
