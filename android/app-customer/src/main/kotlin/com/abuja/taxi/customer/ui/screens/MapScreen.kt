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
    val isLoading by viewModel.isLoading.collectAsState()
    val fleetCategories by viewModel.fleetCategories.collectAsState()
    val estimation by viewModel.estimation.collectAsState()
    val bookedRide by viewModel.bookedRide.collectAsState()
    val user by authViewModel.currentUser.collectAsState()

    var selectedDestination by remember { mutableStateOf<AbujaLandmark?>(null) }
    var selectedVehicleType by remember { mutableStateOf("standard") }
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

            // UI Overlays
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                if (bookedRide != null) {
                    RideStatusCard(bookedRide!!, onDone = { viewModel.resetBooking() })
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
                        selectedVehicleType = selectedVehicleType,
                        isCarpool = isCarpool,
                        onVehicleTypeChange = {
                            selectedVehicleType = it
                            viewModel.getFareEstimate(
                                Coordinates(9.0765, 7.3985),
                                selectedDestination!!.coords,
                                it
                            )
                        },
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
                                    estimation?.estimatedFare ?: 1500
                                )
                            }
                        },
                        onCancel = { selectedDestination = null }
                    )
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
    selectedVehicleType: String,
    isCarpool: Boolean,
    onVehicleTypeChange: (String) -> Unit,
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
fun RideStatusCard(ride: com.abuja.taxi.core.network.models.Ride, onDone: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("🚕 Ride Booked!", style = MaterialTheme.typography.headlineSmall)
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
