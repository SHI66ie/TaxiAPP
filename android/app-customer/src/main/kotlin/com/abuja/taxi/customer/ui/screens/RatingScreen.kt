package com.abuja.taxi.customer.ui.screens

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
import com.abuja.taxi.customer.ui.CustomerViewModel
import com.abuja.taxi.customer.ui.theme.AbujaGold

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RatingScreen(
    rideId: String,
    viewModel: CustomerViewModel
) {
    var rating by remember { mutableStateOf(5) }
    val compliments = listOf("Good Music", "Polite Driver", "Clean Car", "Great Navigator", "Safe Driving", "Fast Arrival")
    val selectedCompliments = remember { mutableStateListOf<String>() }
    var comment by remember { mutableStateOf("") }
    val tipAmounts = listOf(0, 200, 500, 1000)
    var selectedTip by remember { mutableStateOf(0) }
    val isLoading by viewModel.isLoading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Rate Your Trip", style = MaterialTheme.typography.headlineMedium)
        Text("How was your ride #$rideId?", style = MaterialTheme.typography.bodySmall)

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

        Text("What did you like?", style = MaterialTheme.typography.titleMedium)
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

        Text("Add a Tip (Optional)", style = MaterialTheme.typography.titleMedium)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            tipAmounts.forEach { amount ->
                FilterChip(
                    selected = selectedTip == amount,
                    onClick = { selectedTip = amount },
                    label = { Text(if (amount == 0) "No Tip" else "₦$amount") }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = comment,
            onValueChange = { comment = it },
            label = { Text("Leave a comment") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                viewModel.rateRide(rideId, rating, selectedCompliments.toList(), comment, selectedTip)
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
            } else {
                Text("Submit Review")
            }
        }
        
        TextButton(onClick = { viewModel.resetBooking() }) {
            Text("Skip")
        }
    }
}
