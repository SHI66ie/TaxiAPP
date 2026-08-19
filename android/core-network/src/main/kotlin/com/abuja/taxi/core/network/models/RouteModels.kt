package com.abuja.taxi.core.network.models

import kotlinx.serialization.Serializable

@Serializable
data class RouteGeometry(
    val points: List<Coordinates>
)

object RouteUtils {
    /**
     * Simplistic straight-line route between two points for MVP visualization.
     * In production, this would call the Mapbox Directions API.
     */
    fun createMockRoute(start: Coordinates, end: Coordinates): List<Coordinates> {
        return listOf(start, end)
    }
}
