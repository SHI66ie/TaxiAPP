package com.abuja.taxi.driver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.LocationUpdate
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.StatusUpdate
import com.abuja.taxi.core.network.api.SurgeZone
import com.abuja.taxi.core.network.api.WalletInfo
import com.abuja.taxi.core.network.models.Coordinates
import com.abuja.taxi.core.network.models.Ride
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DriverViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _updateStatus = MutableStateFlow<String>("Idle")
    val updateStatus: StateFlow<String> = _updateStatus

    private val _walletInfo = MutableStateFlow<WalletInfo?>(null)
    val walletInfo: StateFlow<WalletInfo?> = _walletInfo

    private val _activeRide = MutableStateFlow<Ride?>(null)
    val activeRide: StateFlow<Ride?> = _activeRide

    private val _surgeZones = MutableStateFlow<List<SurgeZone>>(emptyList())
    val surgeZones: StateFlow<List<SurgeZone>> = _surgeZones

    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline

    private var pollingJob: Job? = null

    fun fetchWalletInfo(driverId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.getDriverWallets()
                if (response.success) {
                    val info = response.data.find { it.driverId == driverId }
                    _walletInfo.value = info
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

    fun toggleAvailability(driverId: String) {
        _isOnline.value = !_isOnline.value
        if (_isOnline.value) {
            startPolling(driverId)
        } else {
            stopPolling()
        }
    }

    private fun startPolling(driverId: String) {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            while (true) {
                try {
                    val response = apiService.getRides()
                    if (response.success) {
                        // Find a ride assigned to this driver that isn't completed/cancelled
                        val ride = response.data.find { 
                            it.driverId == driverId && 
                            it.status != "COMPLETED" && 
                            it.status != "CANCELLED" 
                        }
                        if (ride != null && _activeRide.value?.id != ride.id) {
                            _activeRide.value = ride
                        }
                    }
                } catch (e: Exception) {}
                delay(5000) // Poll every 5 seconds
            }
        }
    }

    private fun stopPolling() {
        pollingJob?.cancel()
    }

    fun updateRideStatus(rideId: String, status: String) {
        viewModelScope.launch {
            try {
                val response = apiService.updateRideStatus(rideId, StatusUpdate(status))
                if (response.success) {
                    _activeRide.value = response.data
                    if (status == "COMPLETED" || status == "CANCELLED") {
                        _activeRide.value = null
                        // Refresh wallet after completion
                        response.data.driverId?.let { fetchWalletInfo(it) }
                    }
                }
            } catch (e: Exception) {}
        }
    }

    fun updateLocation(driverId: String, lat: Double, lng: Double) {
        viewModelScope.launch {
            _updateStatus.value = "Updating..."
            try {
                val coords = Coordinates(lat, lng)
                val response = apiService.updateLocation(LocationUpdate(driverId, coords))
                if (response.success) {
                    _updateStatus.value = "Location Updated"
                } else {
                    _updateStatus.value = "Update Failed"
                }
            } catch (e: Exception) {
                _updateStatus.value = "Error: ${e.message}"
            }
        }
    }
}
