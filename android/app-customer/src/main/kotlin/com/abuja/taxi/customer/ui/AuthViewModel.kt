package com.abuja.taxi.customer.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.AuthRequest
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.ReferralRequest
import com.abuja.taxi.core.network.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _referralBonus = MutableStateFlow<Int?>(null)
    val referralBonus: StateFlow<Int?> = _referralBonus

    private val _referralStatus = MutableStateFlow<String?>(null)
    val referralStatus: StateFlow<String?> = _referralStatus

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _referralBonus.value = null
            _referralStatus.value = null
            try {
                val response = apiService.login(AuthRequest(email, password))
                if (response.success) {
                    _currentUser.value = response.data
                } else {
                    _error.value = "Login failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "An error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun signup(email: String, password: String, name: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _referralBonus.value = null
            _referralStatus.value = null
            try {
                val response = apiService.register(AuthRequest(email, password, name, "PASSENGER"))
                if (response.success) {
                    _currentUser.value = response.data
                } else {
                    _error.value = "Signup failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "An error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun claimReferral(code: String) {
        if (code.isBlank()) {
            _error.value = "Referral code cannot be empty"
            return
        }
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = apiService.claimReferral(ReferralRequest(code))
                if (response.success) {
                    _referralBonus.value = response.data.bonusAmount
                    _referralStatus.value = response.data.message
                } else {
                    _error.value = "Failed to claim referral"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "An error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun logout() {
        _currentUser.value = null
        _referralBonus.value = null
        _referralStatus.value = null
    }
}
