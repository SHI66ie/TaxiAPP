package com.abuja.taxi.customer.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.FareRequest
import com.abuja.taxi.core.network.api.FleetCategory
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.RideBookingRequest
import com.abuja.taxi.core.network.api.SosRequest
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

    private val _estimation = MutableStateFlow<com.abuja.taxi.core.network.api.FareEstimation?>(null)
    val estimation: StateFlow<com.abuja.taxi.core.network.api.FareEstimation?> = _estimation

    private val _bookedRide = MutableStateFlow<Ride?>(null)
    val bookedRide: StateFlow<Ride?> = _bookedRide

    private val _sosActive = MutableStateFlow(false)
    val sosActive: StateFlow<Boolean> = _sosActive

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        fetchFleetCategories()
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
        fare: Int
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.bookRide(
                    RideBookingRequest(
                        name, phone, pickup, dropoff, pickupCoords, dropoffCoords,
                        vehicleType, isCarpool, fare, "Paystack"
                    )
                )
                if (response.success) {
                    _bookedRide.value = response.data.ride ?: response.data.rides?.firstOrNull()
                }
            } catch (e: Exception) {
            } finally {
                _isLoading.value = false
            }
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
    }
}
