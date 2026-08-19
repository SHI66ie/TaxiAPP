package com.abuja.taxi.driver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.LocationUpdate
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.WalletInfo
import com.abuja.taxi.core.network.models.Coordinates
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DriverViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _updateStatus = MutableStateFlow<String>("Idle")
    val updateStatus: StateFlow<String> = _updateStatus

    private val _walletInfo = MutableStateFlow<WalletInfo?>(null)
    val walletInfo: StateFlow<WalletInfo?> = _walletInfo

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
