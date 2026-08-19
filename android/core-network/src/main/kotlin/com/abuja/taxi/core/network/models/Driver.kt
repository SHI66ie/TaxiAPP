package com.abuja.taxi.core.network.models

import kotlinx.serialization.Serializable

@Serializable
data class Driver(
    val id: String,
    val name: String,
    val phone: String,
    val vehicle: String,
    val type: String,
    val location: Coordinates,
    val status: String,
    val kycStatus: String,
    val rating: Double = 5.0,
    val walletBalance: Int = 0,
    val tripsCompleted: Int = 0
)
