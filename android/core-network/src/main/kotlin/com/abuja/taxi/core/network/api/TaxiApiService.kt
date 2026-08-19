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

    @GET("rides")
    suspend fun getRides(): ApiResponse<List<Ride>>

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

    @GET("payments/methods")
    suspend fun getPaymentMethods(): ApiResponse<List<PaymentMethod>>

    @POST("payments/initialize")
    suspend fun initializePayment(@Body request: PaymentInitRequest): ApiResponse<PaymentInitResponse>

    @POST("payments/verify")
    suspend fun verifyPayment(@Body request: PaymentVerifyRequest): ApiResponse<Boolean>

    @GET("payments/wallets")
    suspend fun getDriverWallets(): ApiResponse<List<WalletInfo>>

    @GET("surge/zones")
    suspend fun getSurgeZones(): ApiResponse<List<SurgeZone>>

    @GET("messages/{rideId}")
    suspend fun getMessages(@Path("rideId") rideId: String): ApiResponse<List<ChatMessage>>

    @POST("messages/send")
    suspend fun sendMessage(@Body request: ChatMessageRequest): ApiResponse<ChatMessage>

    @POST("drivers/kyc/submit")
    suspend fun submitKyc(@Body request: KycRequest): ApiResponse<KycResponse>

    @POST("referrals/claim")
    suspend fun claimReferral(@Body request: ReferralRequest): ApiResponse<ReferralResponse>

    @POST("rides/{id}/rate")
    suspend fun rateRide(@Path("id") id: String, @Body request: RateRequest): ApiResponse<String>

    @POST("rides/{id}/rate-passenger")
    suspend fun ratePassenger(@Path("id") id: String, @Body request: RateRequest): ApiResponse<String>
}

@kotlinx.serialization.Serializable
data class RateRequest(
    val rating: Int,
    val compliments: List<String>,
    val comment: String,
    val tipAmount: Int
)

@kotlinx.serialization.Serializable
data class ReferralRequest(
    val code: String
)

@kotlinx.serialization.Serializable
data class ReferralResponse(
    val message: String,
    val bonusAmount: Int
)

@kotlinx.serialization.Serializable
data class KycRequest(
    val driverId: String,
    val kycData: KycData
)

@kotlinx.serialization.Serializable
data class KycData(
    val nin: String,
    val licenseNo: String,
    val vehicleReg: String
)

@kotlinx.serialization.Serializable
data class KycResponse(
    val driverId: String,
    val status: String
)

@kotlinx.serialization.Serializable
data class ChatMessage(
    val id: String,
    val rideId: String,
    val sender: String,
    val text: String,
    val time: String
)

@kotlinx.serialization.Serializable
data class ChatMessageRequest(
    val rideId: String,
    val sender: String,
    val text: String
)

@kotlinx.serialization.Serializable
data class SurgeZone(
    val id: String,
    val name: String,
    val multiplier: Double,
    val level: String,
    val center: Coordinates? = null // Will be mapped in app if null
)

@kotlinx.serialization.Serializable
data class PaymentMethod(
    val id: String,
    val name: String,
    val icon: String? = null
)

@kotlinx.serialization.Serializable
data class PaymentInitRequest(
    val rideId: String,
    val amount: Int,
    val email: String,
    val method: String
)

@kotlinx.serialization.Serializable
data class PaymentInitResponse(
    val authorizationUrl: String,
    val accessCode: String,
    val reference: String
)

@kotlinx.serialization.Serializable
data class PaymentVerifyRequest(
    val reference: String
)

@kotlinx.serialization.Serializable
data class WalletInfo(
    val driverId: String,
    val balance: Int,
    val tripsCount: Int
)

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
