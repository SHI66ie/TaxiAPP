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
import androidx.activity.viewModels
import com.mapbox.common.MapboxOptions
import com.abuja.taxi.driver.ui.AuthViewModel
import com.abuja.taxi.driver.ui.DriverViewModel
import com.abuja.taxi.driver.ui.screens.DriverMapScreen
import com.abuja.taxi.driver.ui.screens.LoginScreen
import com.abuja.taxi.driver.ui.screens.SignupScreen
import com.abuja.taxi.driver.ui.theme.AbujaTaxiTheme
import androidx.compose.runtime.*

class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val driverViewModel: DriverViewModel by viewModels()

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
                    var showSignup by remember { mutableStateOf(false) }

                    if (user != null) {
                        DriverMapScreen(viewModel = driverViewModel, driverId = user!!.id)
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
