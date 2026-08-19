package com.abuja.taxi.driver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.KycData
import com.abuja.taxi.core.network.api.KycRequest
import com.abuja.taxi.core.network.api.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class KycViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting

    private val _isSubmitted = MutableStateFlow(false)
    val isSubmitted: StateFlow<Boolean> = _isSubmitted

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun submitKyc(driverId: String, nin: String, licenseNo: String, vehicleReg: String) {
        viewModelScope.launch {
            _isSubmitting.value = true
            _error.value = null
            try {
                val data = KycData(nin, licenseNo, vehicleReg)
                val response = apiService.submitKyc(KycRequest(driverId, data))
                if (response.success) {
                    _isSubmitted.value = true
                } else {
                    _error.value = "Submission failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "An error occurred"
            } finally {
                _isSubmitting.value = false
            }
        }
    }
}
