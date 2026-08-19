package com.abuja.taxi.driver.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.abuja.taxi.core.network.models.Ride

@Composable
fun ActiveRideOverlay(
    ride: Ride,
    onStatusUpdate: (String) -> Unit,
    onChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showQrDialog by remember { mutableStateOf(false) }

    if (showQrDialog) {
        AlertDialog(
            onDismissRequest = { showQrDialog = false },
            title = { Text("Trip Verification QR") },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Passenger scans this to start trip", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(16.dp))
                    // Simulated QR Code UI
                    Box(
                        modifier = Modifier
                            .size(200.dp)
                            .background(Color.White, RoundedCornerShape(8.dp))
                            .border(2.dp, Color.Black, RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = ride.qrCode ?: "QR-ERROR",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }
            },
            confirmButton = {
                Button(onClick = { showQrDialog = false }) {
                    Text("Close")
                }
            }
        )
    }

    Card(
        modifier = modifier.fillMaxWidth().padding(16.dp),
        elevation = CardDefaults.cardElevation(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Ongoing Trip", style = MaterialTheme.typography.titleMedium)
                    if (ride.isCarpool) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Badge(containerColor = AbujaEmerald, contentColor = Color.White) {
                            Text("Carpool", modifier = Modifier.padding(2.dp))
                        }
                    }
                }
                IconButton(onClick = onChat) {
                    Badge(containerColor = MaterialTheme.colorScheme.primary) {
                        Text("Chat", modifier = Modifier.padding(4.dp))
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Text("Passenger: ${ride.passengerName}", style = MaterialTheme.typography.bodyMedium)
            Text("To: ${ride.dropoffLocation}", style = MaterialTheme.typography.bodySmall)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                when (ride.status) {
                    "MATCHED" -> {
                        Button(onClick = { onStatusUpdate("ARRIVED") }, modifier = Modifier.weight(1f)) {
                            Text("I've Arrived")
                        }
                    }
                    "ARRIVED" -> {
                        Button(onClick = { showQrDialog = true }, modifier = Modifier.weight(1f)) {
                            Text("Show QR Code")
                        }
                    }
                    "IN_PROGRESS" -> {
                        Button(
                            onClick = { onStatusUpdate("COMPLETED") }, 
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF50C878))
                        ) {
                            Text("Complete Trip")
                        }
                    }
                }
                
                OutlinedButton(onClick = { onStatusUpdate("CANCELLED") }) {
                    Text("Cancel", color = Color.Red)
                }
            }
        }
    }
}
