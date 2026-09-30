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

    @GET("drivers/{id}/earnings")
    suspend fun getDriverEarnings(@Path("id") id: String): ApiResponse<EarningSummary>

    @POST("payments/payout")
    suspend fun requestPayout(@Body request: PayoutRequest): ApiResponse<PayoutResponse>

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

    @POST("rides/{id}/verify-qr")
    suspend fun verifyQrCode(@Path("id") id: String, @Body request: QrVerificationRequest): ApiResponse<Ride>

    @POST("routes/optimize")
    suspend fun optimizeRoutes(@Body request: RouteOptimizeRequest): ApiResponse<DriverTripRoutes>
}
