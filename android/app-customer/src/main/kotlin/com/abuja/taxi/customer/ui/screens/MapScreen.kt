package com.abuja.taxi.customer.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.abuja.taxi.core.network.models.Coordinates
import com.abuja.taxi.customer.ui.AuthViewModel
import com.abuja.taxi.customer.ui.CustomerViewModel
import com.abuja.taxi.customer.ui.components.PaymentWebView
import com.abuja.taxi.customer.ui.components.SosButton
import com.mapbox.geojson.Point
import com.mapbox.maps.MapInitOptions
import com.mapbox.maps.Style
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.annotation.generated.CircleAnnotation
import com.mapbox.maps.extension.compose.animation.viewport.rememberViewportState

data class AbujaLandmark(val name: String, val coords: Coordinates)

val ABUJA_LANDMARKS = listOf(
    AbujaLandmark("Central Business District (CBD)", Coordinates(9.0333, 7.4833)),
    AbujaLandmark("Wuse II", Coordinates(9.0578, 7.4950)),
    AbujaLandmark("Maitama", Coordinates(9.0833, 7.5000)),
    AbujaLandmark("Gwarinpa Estate", Coordinates(9.0764, 7.3985)),
    AbujaLandmark("Nnamdi Azikiwe Airport", Coordinates(9.0068, 7.2631)),
    AbujaLandmark("Kubwa", Coordinates(9.1333, 7.3333)),
    AbujaLandmark("Lugbe", Coordinates(8.9667, 7.3667))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(viewModel: CustomerViewModel, authViewModel: AuthViewModel) {
    val context = LocalContext.current
    val drivers by viewModel.drivers.collectAsState()
    val surgeZones by viewModel.surgeZones.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val fleetCategories by viewModel.fleetCategories.collectAsState()
    val paymentMethods by viewModel.paymentMethods.collectAsState()
    val estimation by viewModel.estimation.collectAsState()
    val bookedRide by viewModel.bookedRide.collectAsState()
    val paymentUrl by viewModel.paymentUrl.collectAsState()
    val paymentVerified by viewModel.paymentVerified.collectAsState()
    val sosActive by viewModel.sosActive.collectAsState()
    val user by authViewModel.currentUser.collectAsState()

    var selectedDestination by remember { mutableStateOf<AbujaLandmark?>(null) }
    var selectedVehicleType by remember { mutableStateOf("standard") }
    var selectedPaymentMethod by remember { mutableStateOf("Cash") }
    var isCarpool by remember { mutableStateOf(false) }

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

    LaunchedEffect(Unit) {
        if (!hasLocationPermission) {
            permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        viewModel.fetchNearbyDrivers()
    }

    val abuja = Point.fromLngLat(7.3985, 9.0765)
    val viewportState = rememberViewportState {
        setCameraOptions {
            center(abuja)
            zoom(12.0)
        }
    }

    Scaffold { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            MapboxMap(
                modifier = Modifier.fillMaxSize(),
                mapInitOptionsFactory = { context ->
                    MapInitOptions(
                        context = context,
                        styleUri = Style.MAPBOX_STREETS
                    )
                },
                viewportState = viewportState
            ) {
                // Surge Zones Heatmap
                surgeZones.forEach { zone ->
                    val center = when (zone.id) {
                        "maitama" -> Point.fromLngLat(7.5000, 9.0833)
                        "wuse2" -> Point.fromLngLat(7.4950, 9.0578)
                        "cbd" -> Point.fromLngLat(7.4833, 9.0333)
                        "gwarinpa" -> Point.fromLngLat(7.3985, 9.0764)
                        "airport" -> Point.fromLngLat(7.2631, 9.0068)
                        "utako" -> Point.fromLngLat(7.4600, 9.0600)
                        else -> null
                    }

                    center?.let {
                        val color = when {
                            zone.multiplier >= 1.7 -> "#FF0000" // Red
                            zone.multiplier >= 1.3 -> "#FFA500" // Orange
                            else -> "#FFFF00" // Yellow
                        }
                        
                        CircleAnnotation(
                            point = it
                        ) {
                            circleRadius = 60.0
                            circleColorInt = android.graphics.Color.parseColor(color)
                            circleOpacity = 0.2
                            circleStrokeWidth = 1.0
                            circleStrokeColorInt = android.graphics.Color.parseColor(color)
                        }
                    }
                }

                drivers.forEach { driver ->
                    val color = if (driver.status == "AVAILABLE") {
                        "#50C878" // Emerald Green
                    } else {
                        "#FFD700" // Gold
                    }

                    CircleAnnotation(
                        point = Point.fromLngLat(driver.location.lng, driver.location.lat)
                    ) {
                        circleRadius = 8.0
                        circleColorInt = android.graphics.Color.parseColor(color)
                        circleStrokeWidth = 2.0
                        circleStrokeColorInt = android.graphics.Color.WHITE
                    }
                }
            }

            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // SOS Button
            if (bookedRide != null) {
                SosButton(
                    isEmergencyActive = sosActive,
                    onTriggerSos = {
                        user?.let { u ->
                            viewModel.triggerSos(
                                bookedRide!!.id,
                                u.name,
                                9.0765, // Current lat
                                7.3985  // Current lng
                            )
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                )
            }

            // UI Overlays
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                if (bookedRide != null) {
                    RideStatusCard(bookedRide!!, sosActive, paymentVerified, onDone = { viewModel.resetBooking() })
                } else if (selectedDestination == null) {
                    DestinationSearchCard(onDestinationSelected = {
                        selectedDestination = it
                        viewModel.getFareEstimate(
                            Coordinates(9.0765, 7.3985), // Mock current location (Abuja Center)
                            it.coords,
                            selectedVehicleType
                        )
                    })
                } else {
                    BookingCard(
                        destination = selectedDestination!!,
                        estimation = estimation,
                        fleetCategories = fleetCategories,
                        paymentMethods = paymentMethods,
                        selectedVehicleType = selectedVehicleType,
                        selectedPaymentMethod = selectedPaymentMethod,
                        isCarpool = isCarpool,
                        onVehicleTypeChange = {
                            selectedVehicleType = it
                            viewModel.getFareEstimate(
                                Coordinates(9.0765, 7.3985),
                                selectedDestination!!.coords,
                                it
                            )
                        },
                        onPaymentMethodChange = { selectedPaymentMethod = it },
                        onCarpoolChange = { isCarpool = it },
                        onBook = {
                            user?.let { u ->
                                viewModel.bookRide(
                                    u.name,
                                    "+234 800 000 0000",
                                    "Abuja Center",
                                    selectedDestination!!.name,
                                    Coordinates(9.0765, 7.3985),
                                    selectedDestination!!.coords,
                                    selectedVehicleType,
                                    isCarpool,
                                    estimation?.estimatedFare ?: 1500,
                                    selectedPaymentMethod
                                )
                            }
                        },
                        onCancel = { selectedDestination = null }
                    )
                }
            }

            // Payment WebView Overlay
            if (paymentUrl != null) {
                Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
                    PaymentWebView(
                        url = paymentUrl!!,
                        onPaymentComplete = { reference ->
                            viewModel.verifyPayment(reference)
                        }
                    )
                    IconButton(
                        onClick = { viewModel.resetBooking() },
                        modifier = Modifier.align(Alignment.TopStart).padding(16.dp)
                    ) {
                        Icon(Icons.Default.LocationOn, contentDescription = "Close")
                    }
                }
            }
        }
    }
}

@Composable
fun DestinationSearchCard(onDestinationSelected: (AbujaLandmark) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Where to?", style = MaterialTheme.typography.headlineSmall)
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = "",
                onValueChange = {},
                placeholder = { Text("Search Abuja landmarks...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                enabled = false // For now, just a list below
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyColumn(modifier = Modifier.heightIn(max = 200.dp)) {
                items(ABUJA_LANDMARKS) { landmark ->
                    ListItem(
                        headlineContent = { Text(landmark.name) },
                        leadingContent = { Icon(Icons.Default.LocationOn, contentDescription = null) },
                        modifier = Modifier.clickable { onDestinationSelected(landmark) }
                    )
                }
            }
        }
    }
}

@Composable
fun BookingCard(
    destination: AbujaLandmark,
    estimation: com.abuja.taxi.core.network.api.FareEstimation?,
    fleetCategories: Map<String, com.abuja.taxi.core.network.api.FleetCategory>,
    paymentMethods: List<com.abuja.taxi.core.network.api.PaymentMethod>,
    selectedVehicleType: String,
    selectedPaymentMethod: String,
    isCarpool: Boolean,
    onVehicleTypeChange: (String) -> Unit,
    onPaymentMethodChange: (String) -> Unit,
    onCarpoolChange: (Boolean) -> Unit,
    onBook: () -> Unit,
    onCancel: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onCancel) {
                    Icon(Icons.Default.LocationOn, contentDescription = "Back", tint = MaterialTheme.colorScheme.primary)
                }
                Text(destination.name, style = MaterialTheme.typography.titleMedium)
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            
            Text("Select Ride", style = MaterialTheme.typography.labelLarge)
            
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                fleetCategories.values.forEach { category ->
                    FilterChip(
                        selected = selectedVehicleType == category.id,
                        onClick = { onVehicleTypeChange(category.id) },
                        label = { Text(category.name) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("Payment Method", style = MaterialTheme.typography.labelLarge)
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                paymentMethods.forEach { method ->
                    FilterChip(
                        selected = selectedPaymentMethod == method.id,
                        onClick = { onPaymentMethodChange(method.id) },
                        label = { Text(method.name) }
                    )
                }
            }

            if (estimation != null) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Estimated Fare", style = MaterialTheme.typography.labelSmall)
                        Text("₦${estimation.estimatedFare}", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)
                        if (estimation.isSurgeActive) {
                            Text("⚡ Surge ${estimation.surgeMultiplier}x", color = Color(0xFFFFA500), style = MaterialTheme.typography.labelSmall)
                        }
                    }
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Carpool?", style = MaterialTheme.typography.bodySmall)
                        Switch(checked = isCarpool, onCheckedChange = onCarpoolChange)
                    }
                }
            }

            Button(
                onClick = onBook,
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium
            ) {
                Text(if (isCarpool) "Request Carpool Match" else "Confirm Abuja Taxi")
            }
        }
    }
}

@Composable
fun RideStatusCard(ride: com.abuja.taxi.core.network.models.Ride, sosActive: Boolean, paymentVerified: Boolean, onDone: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (sosActive) Color.Red.copy(alpha = 0.1f) else MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            if (sosActive) {
                Text("🚨 EMERGENCY SOS ACTIVE", color = Color.Red, style = MaterialTheme.typography.titleMedium)
                Text("Dispatch and emergency contacts notified.", color = Color.Red, style = MaterialTheme.typography.bodySmall)
                Spacer(modifier = Modifier.height(8.dp))
            }
            Text("🚕 Ride Booked!", style = MaterialTheme.typography.headlineSmall)
            if (ride.paymentMethod != "Cash") {
                Text(
                    text = if (paymentVerified) "💳 Payment Verified" else "⏳ Payment Pending",
                    color = if (paymentVerified) AbujaEmerald else Color.Gray,
                    style = MaterialTheme.typography.labelLarge
                )
            }
            Text("Driver: ${ride.driverName ?: "Searching..."}", style = MaterialTheme.typography.bodyMedium)
            Text("Vehicle: ${ride.driverVehicle ?: "---"}", style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(8.dp))
            Text("QR Code: ${ride.qrCode}", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onDone) {
                Text("Dismiss")
            }
        }
    }
}
