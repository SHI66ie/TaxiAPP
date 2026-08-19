package com.abuja.taxi.customer.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun SosButton(
    isEmergencyActive: Boolean,
    onTriggerSos: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showDialog by remember { mutableStateOf(false) }

    Box(modifier = modifier) {
        FloatingActionButton(
            onClick = { if (!isEmergencyActive) showDialog = true },
            containerColor = if (isEmergencyActive) Color.Gray else Color.Red,
            contentColor = Color.White
        ) {
            Icon(Icons.Default.Warning, contentDescription = "SOS")
        }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Emergency SOS") },
                text = { Text("Are you sure you want to trigger an emergency alert? This will notify dispatch and emergency contacts.") },
                confirmButton = {
                    Button(
                        onClick = {
                            onTriggerSos()
                            showDialog = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                    ) {
                        Text("YES, TRIGGER SOS", color = Color.White)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
