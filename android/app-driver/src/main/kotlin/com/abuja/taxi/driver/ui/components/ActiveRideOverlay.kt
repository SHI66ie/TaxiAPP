package com.abuja.taxi.driver.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.abuja.taxi.core.network.models.Ride

@Composable
fun ActiveRideOverlay(
    ride: Ride,
    onStatusUpdate: (String) -> Unit,
    onChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth().padding(16.dp),
        elevation = CardDefaults.cardElevation(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text("Ongoing Trip", style = MaterialTheme.typography.titleMedium)
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
                        Button(onClick = { onStatusUpdate("IN_PROGRESS") }, modifier = Modifier.weight(1f)) {
                            Text("Start Trip")
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
