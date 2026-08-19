package com.abuja.taxi.driver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.EarningSummary
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.PayoutRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class EarningsViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _summary = MutableStateFlow<EarningSummary?>(null)
    val summary: StateFlow<EarningSummary?> = _summary

    private val _payoutStatus = MutableStateFlow<String?>(null)
    val payoutStatus: StateFlow<String?> = _payoutStatus

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    fun fetchEarnings(driverId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getDriverEarnings(driverId)
                if (response.success) {
                    _summary.value = response.data
                }
            } catch (e: Exception) {
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun requestPayout(driverId: String, amount: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.requestPayout(PayoutRequest(driverId, amount))
                if (response.success) {
                    _payoutStatus.value = "Payout Successful! Ref: ${response.data.nibssReference}"
                    fetchEarnings(driverId)
                }
            } catch (e: Exception) {
                _payoutStatus.value = "Payout Failed: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
