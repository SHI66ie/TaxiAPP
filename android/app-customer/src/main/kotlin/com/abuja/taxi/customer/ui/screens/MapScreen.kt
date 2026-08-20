package com.abuja.taxi.customer.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
import com.abuja.taxi.customer.ui.theme.AbujaEmerald
import com.abuja.taxi.customer.ui.theme.AbujaGold
import com.mapbox.geojson.Point
import com.mapbox.maps.MapInitOptions
import com.mapbox.maps.Style
import com.mapbox.maps.extension.compose.MapboxMap

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
fun MapScreen(
    viewModel: CustomerViewModel,
    authViewModel: AuthViewModel,
    onNavigateToChat: (String) -> Unit,
    onNavigateToScan: () -> Unit
) {
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

    Scaffold { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            MapboxMap(
                modifier = Modifier.fillMaxSize(),
                mapInitOptions = MapInitOptions(
                    context = context,
                    styleUri = Style.TRAFFIC_DAY
                )
            )

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
                    RideStatusCard(
                        ride = bookedRide!!,
                        sosActive = sosActive,
                        paymentVerified = paymentVerified,
                        onChat = { onNavigateToChat(bookedRide!!.id) },
                        onScan = onNavigateToScan,
                        onDone = { viewModel.resetBooking() }
                    )
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
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Carpool?", style = MaterialTheme.typography.bodySmall)
                            if (isCarpool) {
                                Badge(containerColor = AbujaEmerald, contentColor = Color.White) {
                                    Text("Save 50%", modifier = Modifier.padding(2.dp))
                                }
                            }
                        }
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
fun RideStatusCard(
    ride: com.abuja.taxi.core.network.models.Ride,
    sosActive: Boolean,
    paymentVerified: Boolean,
    onChat: () -> Unit,
    onScan: () -> Unit,
    onDone: () -> Unit
) {
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
            
            if (ride.status == "ARRIVED") {
                Button(
                    onClick = onScan,
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AbujaGold, contentColor = Color.Black)
                ) {
                    Text("SCAN DRIVER QR TO START")
                }
            }

            if (ride.isCarpool) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Badge(containerColor = AbujaEmerald, contentColor = Color.White) {
                        Text("Carpool Match Found")
                    }
                    if (ride.carpoolPartner != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("with ${ride.carpoolPartner}", style = MaterialTheme.typography.bodySmall)
                    }
                }
                
                val savings = ride.originalFare - ride.fare
                if (savings > 0) {
                    Text("You saved ₦$savings!", color = AbujaEmerald, style = MaterialTheme.typography.labelLarge)
                }
            }

            if (ride.paymentMethod != "Cash") {
                Text(
                    text = if (paymentVerified) "💳 Payment Verified" else "⏳ Payment Pending",
                    color = if (paymentVerified) AbujaEmerald else Color.Gray,
                    style = MaterialTheme.typography.labelLarge
                )
            }
            Text("Driver: ${ride.driverName ?: "Searching..."}", style = MaterialTheme.typography.bodyMedium)
            Text("Vehicle: ${ride.driverVehicle ?: "---"}", style = MaterialTheme.typography.bodySmall)
            
            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onChat, modifier = Modifier.weight(1f)) {
                    Text("Chat with Driver")
                }
                OutlinedButton(onClick = onDone, modifier = Modifier.weight(1f)) {
                    Text("Dismiss")
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Text("QR Code: ${ride.qrCode}", style = MaterialTheme.typography.titleLarge)
        }
    }
}
