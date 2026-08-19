package com.abuja.taxi.customer.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.FareRequest
import com.abuja.taxi.core.network.api.FleetCategory
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.PaymentInitRequest
import com.abuja.taxi.core.network.api.PaymentMethod
import com.abuja.taxi.core.network.api.PaymentVerifyRequest
import com.abuja.taxi.core.network.api.RideBookingRequest
import com.abuja.taxi.core.network.api.SosRequest
import com.abuja.taxi.core.network.api.SurgeZone
import com.abuja.taxi.core.network.models.Coordinates
import com.abuja.taxi.core.network.models.Driver
import com.abuja.taxi.core.network.models.Ride
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CustomerViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _drivers = MutableStateFlow<List<Driver>>(emptyList())
    val drivers: StateFlow<List<Driver>> = _drivers

    private val _fleetCategories = MutableStateFlow<Map<String, FleetCategory>>(emptyMap())
    val fleetCategories: StateFlow<Map<String, FleetCategory>> = _fleetCategories

    private val _paymentMethods = MutableStateFlow<List<PaymentMethod>>(emptyList())
    val paymentMethods: StateFlow<List<PaymentMethod>> = _paymentMethods

    private val _estimation = MutableStateFlow<com.abuja.taxi.core.network.api.FareEstimation?>(null)
    val estimation: StateFlow<com.abuja.taxi.core.network.api.FareEstimation?> = _estimation

    private val _bookedRide = MutableStateFlow<Ride?>(null)
    val bookedRide: StateFlow<Ride?> = _bookedRide

    private val _paymentUrl = MutableStateFlow<String?>(null)
    val paymentUrl: StateFlow<String?> = _paymentUrl

    private val _paymentVerified = MutableStateFlow(false)
    val paymentVerified: StateFlow<Boolean> = _paymentVerified

    private val _surgeZones = MutableStateFlow<List<SurgeZone>>(emptyList())
    val surgeZones: StateFlow<List<SurgeZone>> = _surgeZones

    private val _sosActive = MutableStateFlow(false)
    val sosActive: StateFlow<Boolean> = _sosActive

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        fetchFleetCategories()
        fetchPaymentMethods()
        fetchSurgeZones()
    }

    private fun fetchFleetCategories() {
        viewModelScope.launch {
            try {
                val response = apiService.getFleetCategories()
                if (response.success) {
                    _fleetCategories.value = response.data
                }
            } catch (e: Exception) {}
        }
    }

    private fun fetchPaymentMethods() {
        viewModelScope.launch {
            try {
                val response = apiService.getPaymentMethods()
                if (response.success) {
                    _paymentMethods.value = response.data
                }
            } catch (e: Exception) {}
        }
    }

    fun fetchSurgeZones() {
        viewModelScope.launch {
            try {
                val response = apiService.getSurgeZones()
                if (response.success) {
                    _surgeZones.value = response.data
                }
            } catch (e: Exception) {}
        }
    }

    fun fetchNearbyDrivers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getDrivers()
                if (response.success) {
                    _drivers.value = response.data
                }
            } catch (e: Exception) {
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun getFareEstimate(pickup: Coordinates, dropoff: Coordinates, vehicleType: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.estimateFare(FareRequest(pickup, dropoff, vehicleType))
                if (response.success) {
                    _estimation.value = response.data
                }
            } catch (e: Exception) {
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun bookRide(
        name: String,
        phone: String,
        pickup: String,
        dropoff: String,
        pickupCoords: Coordinates,
        dropoffCoords: Coordinates,
        vehicleType: String,
        isCarpool: Boolean,
        fare: Int,
        paymentMethod: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.bookRide(
                    RideBookingRequest(
                        name, phone, pickup, dropoff, pickupCoords, dropoffCoords,
                        vehicleType, isCarpool, fare, paymentMethod
                    )
                )
                if (response.success) {
                    val ride = response.data.ride ?: response.data.rides?.firstOrNull()
                    _bookedRide.value = ride
                    
                    if (paymentMethod != "Cash" && ride != null) {
                        initializePayment(ride.id, fare, "passenger@taxi.com", paymentMethod)
                    }
                }
            } catch (e: Exception) {
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun initializePayment(rideId: String, amount: Int, email: String, method: String) {
        viewModelScope.launch {
            try {
                val response = apiService.initializePayment(PaymentInitRequest(rideId, amount, email, method))
                if (response.success) {
                    _paymentUrl.value = response.data.authorizationUrl
                }
            } catch (e: Exception) {}
        }
    }

    fun verifyPayment(reference: String) {
        viewModelScope.launch {
            try {
                val response = apiService.verifyPayment(PaymentVerifyRequest(reference))
                if (response.success && response.data) {
                    _paymentVerified.value = true
                    _paymentUrl.value = null
                }
            } catch (e: Exception) {}
        }
    }

    fun triggerSos(rideId: String, passengerName: String, lat: Double, lng: Double) {
        viewModelScope.launch {
            try {
                val response = apiService.triggerSos(SosRequest(rideId, passengerName, Coordinates(lat, lng)))
                if (response.success) {
                    _sosActive.value = true
                }
            } catch (e: Exception) {
                // Fallback: SMS could be implemented here if needed
            }
        }
    }

    fun resetBooking() {
        _bookedRide.value = null
        _estimation.value = null
        _sosActive.value = false
        _paymentUrl.value = null
        _paymentVerified.value = false
    }
}
