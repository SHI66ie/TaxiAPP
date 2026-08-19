package com.abuja.taxi.driver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.abuja.taxi.core.network.api.ChatMessage
import com.abuja.taxi.core.network.api.ChatMessageRequest
import com.abuja.taxi.core.network.api.NetworkModule
import com.abuja.taxi.core.network.api.SocketManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ChatViewModel : ViewModel() {
    private val apiService = NetworkModule.apiService

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages

    init {
        SocketManager.connect()
        viewModelScope.launch {
            SocketManager.messages.collect { json ->
                val newMessage = ChatMessage(
                    id = json.getString("id"),
                    rideId = json.getString("rideId"),
                    sender = json.getString("sender"),
                    text = json.getString("text"),
                    time = json.getString("time")
                )
                _messages.value = _messages.value + newMessage
            }
        }
    }

    fun fetchMessages(rideId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.getMessages(rideId)
                if (response.success) {
                    _messages.value = response.data
                }
            } catch (e: Exception) {}
        }
    }

    fun sendMessage(rideId: String, text: String) {
        viewModelScope.launch {
            try {
                apiService.sendMessage(ChatMessageRequest(rideId, "driver", text))
            } catch (e: Exception) {}
        }
    }

    override fun onCleared() {
        super.onCleared()
        SocketManager.disconnect()
    }
}
