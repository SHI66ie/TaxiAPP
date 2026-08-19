package com.abuja.taxi.driver.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.abuja.taxi.driver.ui.DriverViewModel
import com.abuja.taxi.driver.ui.theme.AbujaGold

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PassengerRatingScreen(
    rideId: String,
    viewModel: DriverViewModel
) {
    var rating by remember { mutableStateOf(5) }
    val compliments = listOf("Polite Passenger", "Ready on Time", "Good Directions", "Cleanliness", "Pleasant Conversation", "Safety Conscious")
    val selectedCompliments = remember { mutableStateListOf<String>() }
    var comment by remember { mutableStateOf("") }
    val isLoading by viewModel.isLoading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Rate Passenger", style = MaterialTheme.typography.headlineMedium)
        Text("How was your trip #$rideId?", style = MaterialTheme.typography.bodySmall)

        Spacer(modifier = Modifier.height(32.dp))

        // Star Rating
        Row {
            repeat(5) { index ->
                IconButton(onClick = { rating = index + 1 }) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = null,
                        tint = if (index < rating) AbujaGold else Color.LightGray,
                        modifier = Modifier.size(48.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text("Passenger Highlights", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        // Compliments Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.heightIn(max = 200.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(compliments) { compliment ->
                FilterChip(
                    selected = selectedCompliments.contains(compliment),
                    onClick = {
                        if (selectedCompliments.contains(compliment)) {
                            selectedCompliments.remove(compliment)
                        } else {
                            selectedCompliments.add(compliment)
                        }
                    },
                    label = { Text(compliment) }
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = comment,
            onValueChange = { comment = it },
            label = { Text("Private comments for Abuja Taxi") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                viewModel.ratePassenger(rideId, rating, selectedCompliments.toList(), comment)
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(size = 24.dp, color = MaterialTheme.colorScheme.onPrimary)
            } else {
                Text("Submit Passenger Review")
            }
        }
        
        TextButton(onClick = { viewModel.skipRating() }) {
            Text("Skip")
        }
    }
}
