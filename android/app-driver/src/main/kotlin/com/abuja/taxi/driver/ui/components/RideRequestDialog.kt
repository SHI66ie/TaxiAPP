package com.abuja.taxi.driver.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.abuja.taxi.core.network.models.Ride

@Composable
fun RideRequestDialog(
    ride: Ride,
    onAccept: () -> Unit,
    onDecline: () -> Unit
) {
    AlertDialog(
        onDismissRequest = { },
        title = { Text("New Ride Request") },
        text = {
            Column {
                Text("Passenger: ${ride.passengerName}")
                Text("Pickup: ${ride.pickupLocation}")
                Text("Dropoff: ${ride.dropoffLocation}")
                Text("Fare: ₦${ride.fare}")
                if (ride.isCarpool) {
                    Badge(containerColor = MaterialTheme.colorScheme.secondary) {
                        Text("Carpool")
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onAccept) {
                Text("Accept")
            }
        },
        dismissButton = {
            TextButton(onClick = onDecline) {
                Text("Decline")
            }
        }
    )
}
