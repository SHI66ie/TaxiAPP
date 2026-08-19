package com.abuja.taxi.driver.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.abuja.taxi.driver.ui.KycViewModel

@Composable
fun KycScreen(
    driverId: String,
    viewModel: KycViewModel,
    onLogout: () -> Unit
) {
    var nin by remember { mutableStateOf("") }
    var licenseNo by remember { mutableStateOf("") }
    var vehicleReg by remember { mutableStateOf("") }
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val isSubmitted by viewModel.isSubmitted.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isSubmitted) {
            Text(
                "KYC Documents Submitted!",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                "Your documents are being reviewed by the Abuja Taxi team. You will be able to go online once verified.",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onLogout) {
                Text("Logout")
            }
        } else {
            Text("Complete Your Profile", style = MaterialTheme.typography.headlineMedium)
            Text(
                "Submit your documents to start driving in Abuja.",
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = nin,
                onValueChange = { nin = it },
                label = { Text("NIN (National ID Number)") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = licenseNo,
                onValueChange = { licenseNo = it },
                label = { Text("Driver's License Number") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = vehicleReg,
                onValueChange = { vehicleReg = it },
                label = { Text("Vehicle Registration Number") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (error != null) {
                Text(error!!, color = MaterialTheme.colorScheme.error)
                Spacer(modifier = Modifier.height(8.dp))
            }

            Button(
                onClick = { viewModel.submitKyc(driverId, nin, licenseNo, vehicleReg) },
                enabled = !isSubmitting && nin.isNotBlank() && licenseNo.isNotBlank() && vehicleReg.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Submit for Verification")
                }
            }
            
            TextButton(onClick = onLogout) {
                Text("Cancel & Logout")
            }
        }
    }
}
