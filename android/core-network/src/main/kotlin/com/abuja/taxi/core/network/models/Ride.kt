package com.abuja.taxi.core.network.models

import kotlinx.serialization.Serializable

@Serializable
data class Ride(
    val id: String,
    val passengerName: String,
    val passengerPhone: String,
    val pickupLocation: String,
    val dropoffLocation: String,
    val pickupCoords: Coordinates,
    val dropoffCoords: Coordinates,
    val vehicleType: String,
    val isCarpool: Boolean,
    val carpoolPartner: String? = null,
    val status: String,
    val fare: Int,
    val originalFare: Int,
    val driverId: String? = null,
    val driverName: String? = null,
    val driverPhone: String? = null,
    val driverVehicle: String? = null,
    val qrCode: String? = null,
    val paymentMethod: String,
    val createdAt: String
)
