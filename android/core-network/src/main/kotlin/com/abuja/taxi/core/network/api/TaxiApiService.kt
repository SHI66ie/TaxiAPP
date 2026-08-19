package com.abuja.taxi.core.network.api

import com.abuja.taxi.core.network.models.*
import retrofit2.http.*

interface TaxiApiService {
    @POST("auth/register")
    suspend fun register(@Body request: AuthRequest): ApiResponse<User>

    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): ApiResponse<User>

    @GET("drivers")
    suspend fun getDrivers(): ApiResponse<List<Driver>>

    @POST("rides/book")
    suspend fun bookRide(@Body request: RideBookingRequest): ApiResponse<BookingResponse>

    @PATCH("rides/{id}/status")
    suspend fun updateRideStatus(@Path("id") id: String, @Body status: StatusUpdate): ApiResponse<Ride>

    @POST("location/update")
    suspend fun updateLocation(@Body locationUpdate: LocationUpdate): ApiResponse<Driver>

    @GET("fleet/categories")
    suspend fun getFleetCategories(): ApiResponse<Map<String, FleetCategory>>

    @POST("fare/estimate")
    suspend fun estimateFare(@Body request: FareRequest): ApiResponse<FareEstimation>

    @POST("sos/trigger")
    suspend fun triggerSos(@Body request: SosRequest): ApiResponse<SosResponse>
}

@kotlinx.serialization.Serializable
data class SosRequest(
    val rideId: String,
    val passengerName: String,
    val coords: Coordinates
)

@kotlinx.serialization.Serializable
data class SosResponse(
    val status: String,
    val message: String
)

@kotlinx.serialization.Serializable
data class FleetCategory(
    val id: String,
    val name: String,
    val multiplier: Double,
    val etaBonus: Int
)

@kotlinx.serialization.Serializable
data class FareRequest(
    val pickupCoords: Coordinates,
    val dropoffCoords: Coordinates,
    val vehicleType: String? = null,
    val isAirport: Boolean = false
)

@kotlinx.serialization.Serializable
data class FareEstimation(
    val distanceKm: Double,
    val fleetCategory: String,
    val estimatedFare: Int,
    val surgeMultiplier: Double,
    val isSurgeActive: Boolean
)

@kotlinx.serialization.Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T
)

@kotlinx.serialization.Serializable
data class RideBookingRequest(
    val passengerName: String,
    val passengerPhone: String,
    val pickupLocation: String,
    val dropoffLocation: String,
    val pickupCoords: Coordinates,
    val dropoffCoords: Coordinates,
    val vehicleType: String,
    val isCarpool: Boolean,
    val fare: Int,
    val paymentMethod: String
)

@kotlinx.serialization.Serializable
data class BookingResponse(
    val status: String,
    val ride: Ride? = null,
    val rides: List<Ride>? = null,
    val assignedDriver: Driver? = null
)

@kotlinx.serialization.Serializable
data class StatusUpdate(
    val status: String
)

@kotlinx.serialization.Serializable
data class LocationUpdate(
    val driverId: String,
    val coords: Coordinates
)

@kotlinx.serialization.Serializable
data class AuthRequest(
    val email: String,
    val password: String,
    val name: String? = null,
    val role: String? = null
)
