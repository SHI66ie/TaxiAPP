package com.abuja.taxi.core.network.api

import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import org.json.JSONObject

object SocketManager {
    private const val SOCKET_URL = "http://10.0.2.2:5000"
    private var socket: Socket? = null

    private val _messages = MutableSharedFlow<JSONObject>(extraBufferCapacity = 10)
    val messages: SharedFlow<JSONObject> = _messages

    private val _rideUpdates = MutableSharedFlow<JSONObject>(extraBufferCapacity = 10)
    val rideUpdates: SharedFlow<JSONObject> = _rideUpdates

    fun connect() {
        if (socket?.connected() == true) return

        try {
            socket = IO.socket(SOCKET_URL).apply {
                on(Socket.EVENT_CONNECT) {
                    println("Socket Connected")
                }
                on("new_chat_message") { args ->
                    (args[0] as? JSONObject)?.let { _messages.tryEmit(it) }
                }
                on("ride_status_updated") { args ->
                    (args[0] as? JSONObject)?.let { _rideUpdates.tryEmit(it) }
                }
                connect()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
    }
}
