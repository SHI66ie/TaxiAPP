package com.abuja.taxi.driver.ui.screens

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Looper
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.abuja.taxi.driver.ui.DriverViewModel
import com.abuja.taxi.driver.ui.components.ActiveRideOverlay
import com.abuja.taxi.driver.ui.components.RideRequestDialog
import com.google.android.gms.location.*
import com.mapbox.geojson.Point
import com.mapbox.maps.MapInitOptions
import com.mapbox.maps.Style
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberViewportState
import com.mapbox.maps.extension.compose.LocationComponentSettings
import kotlinx.coroutines.delay

@SuppressLint("MissingPermission")
@Composable
fun DriverMapScreen(viewModel: DriverViewModel, driverId: String) {
    val context = LocalContext.current
    val updateStatus by viewModel.updateStatus.collectAsState()
    val walletInfo by viewModel.walletInfo.collectAsState()
    val activeRide by viewModel.activeRide.collectAsState()
    val isOnline by viewModel.isOnline.collectAsState()

    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasLocationPermission = isGranted
    }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    var currentPoint by remember { mutableStateOf<Point?>(null) }

    val viewportState = rememberViewportState {
        setCameraOptions {
            center(Point.fromLngLat(7.3985, 9.0765)) // Default to Abuja
            zoom(15.0)
        }
    }

    LaunchedEffect(Unit) {
        if (!hasLocationPermission) {
            permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        viewModel.fetchWalletInfo(driverId)
    }

    LaunchedEffect(hasLocationPermission) {
        if (hasLocationPermission) {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
                .setMinUpdateIntervalMillis(5000)
                .build()

            val locationCallback = object : LocationCallback() {
                override fun onLocationResult(locationResult: LocationResult) {
                    locationResult.lastLocation?.let { location ->
                        val point = Point.fromLngLat(location.longitude, location.latitude)
                        currentPoint = point
                        
                        // Center camera on first location update
                        if (viewportState.cameraOptions.center == Point.fromLngLat(7.3985, 9.0765)) {
                            viewportState.setCameraOptions {
                                center(point)
                            }
                        }
                    }
                }
            }

            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )

            // Periodic update to backend
            while (true) {
                currentPoint?.let { point ->
                    viewModel.updateLocation(driverId, point.latitude(), point.longitude())
                }
                delay(10000) // 10 seconds
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MapboxMap(
            modifier = Modifier.fillMaxSize(),
            mapInitOptionsFactory = { context ->
                MapInitOptions(
                    context = context,
                    styleUri = Style.MAPBOX_STREETS
                )
            },
            viewportState = viewportState,
            locationComponentSettings = LocationComponentSettings(
                enabled = hasLocationPermission,
                pulsingEnabled = true
            )
        )

        // Availability Toggle
        Switch(
            checked = isOnline,
            onCheckedChange = { viewModel.toggleAvailability(driverId) },
            modifier = Modifier.align(Alignment.TopCenter).padding(16.dp),
            thumbContent = {
                if (isOnline) Icon(Icons.Default.Check, null)
            }
        )

        // Ride Management Overlays
        activeRide?.let { ride ->
            if (ride.status == "MATCHED") {
                RideRequestDialog(
                    ride = ride,
                    onAccept = { viewModel.updateRideStatus(ride.id, "ARRIVED") }, // Move to Arrived status on accept
                    onDecline = { viewModel.updateRideStatus(ride.id, "CANCELLED") }
                )
            } else {
                ActiveRideOverlay(
                    ride = ride,
                    onStatusUpdate = { status -> viewModel.updateRideStatus(ride.id, status) },
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 120.dp)
                )
            }
        }

        // Overlay for status
        Card(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f)
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "Driver ID: $driverId", style = MaterialTheme.typography.bodyMedium)
                walletInfo?.let {
                    Text(
                        text = "Earnings: ₦${it.balance}",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Text(text = "Status: $updateStatus", style = MaterialTheme.typography.bodySmall)
                currentPoint?.let {
                    Text(
                        text = "Location: ${String.format("%.4f", it.latitude())}, ${String.format("%.4f", it.longitude())}",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
        }
    }
}
