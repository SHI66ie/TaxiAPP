package com.abuja.taxi.customer.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.abuja.taxi.customer.ui.AuthViewModel
import com.abuja.taxi.customer.ui.theme.AbujaEmerald

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReferralScreen(
    viewModel: AuthViewModel,
    onBack: () -> Unit
) {
    var code by remember { mutableStateOf("") }
    val isLoading by viewModel.isLoading.collectAsState()
    val bonus by viewModel.referralBonus.collectAsState()
    val status by viewModel.referralStatus.collectAsState()
    val error by viewModel.error.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Referral Program") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (bonus != null) {
                Text(
                    "Success!",
                    style = MaterialTheme.typography.headlineLarge,
                    color = AbujaEmerald
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    status ?: "Referral code claimed!",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    colors = CardDefaults.cardColors(containerColor = AbujaEmerald.copy(alpha = 0.1f))
                ) {
                    Text(
                        "₦$bonus credit added to your wallet!",
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.titleMedium,
                        color = AbujaEmerald
                    )
                }
                Spacer(modifier = Modifier.height(32.dp))
                Button(onClick = onBack) {
                    Text("Continue")
                }
            } else {
                Text(
                    "Have a Referral Code?",
                    style = MaterialTheme.typography.headlineMedium
                )
                Text(
                    "Enter a code from a friend to earn ₦1,000 credit.",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(modifier = Modifier.height(32.dp))

                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it.uppercase() },
                    label = { Text("Enter Referral Code") },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("e.g. ABUJA100") }
                )

                Spacer(modifier = Modifier.height(24.dp))

                if (error != null) {
                    Text(error!!, color = MaterialTheme.colorScheme.error)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Button(
                    onClick = { viewModel.claimReferral(code) },
                    enabled = !isLoading && code.isNotBlank(),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Claim Reward")
                    }
                }
            }
        }
    }
}
