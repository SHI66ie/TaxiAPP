package com.abuja.taxi.driver.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.abuja.taxi.driver.ui.EarningsViewModel
import com.abuja.taxi.driver.ui.theme.AbujaEmerald

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EarningsDashboardScreen(
    driverId: String,
    viewModel: EarningsViewModel,
    onBack: () -> Unit
) {
    val summary by viewModel.summary.collectAsState()
    val payoutStatus by viewModel.payoutStatus.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(driverId) {
        viewModel.fetchEarnings(driverId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Driver Earnings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Summary Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                EarningSummaryCard(
                    title = "Today",
                    amount = summary?.todayTotal ?: 0,
                    modifier = Modifier.weight(1f)
                )
                EarningSummaryCard(
                    title = "Weekly",
                    amount = summary?.weeklyTotal ?: 0,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Payout Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = AbujaEmerald.copy(alpha = 0.1f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Available Balance", style = MaterialTheme.typography.labelMedium)
                    Text(
                        "₦${summary?.weeklyTotal ?: 0}", // Mocking balance as weekly total for MVP
                        style = MaterialTheme.typography.headlineLarge,
                        color = AbujaEmerald
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.requestPayout(driverId, summary?.weeklyTotal ?: 0) },
                        enabled = !isLoading && (summary?.weeklyTotal ?: 0) > 0,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Request NIBSS Payout")
                    }
                    payoutStatus?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text("Recent Trips", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))

            // Transaction List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.weight(1f)
            ) {
                summary?.transactions?.let { txs ->
                    items(txs) { tx ->
                        TransactionItem(tx)
                    }
                }
            }
        }
    }
}

@Composable
fun EarningSummaryCard(title: String, amount: Int, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, style = MaterialTheme.typography.labelSmall)
            Text("₦$amount", style = MaterialTheme.typography.titleLarge, color = AbujaEmerald)
        }
    }
}

@Composable
fun TransactionItem(tx: com.abuja.taxi.core.network.api.EarningTransaction) {
    ListItem(
        headlineContent = { Text("Trip #${tx.rideId}") },
        supportingContent = { Text(tx.timestamp.split("T")[0]) },
        trailingContent = { 
            Text("+₦${tx.amount}", color = AbujaEmerald, style = MaterialTheme.typography.titleMedium) 
        },
        overlineContent = { Text("Net Earnings") }
    )
}
