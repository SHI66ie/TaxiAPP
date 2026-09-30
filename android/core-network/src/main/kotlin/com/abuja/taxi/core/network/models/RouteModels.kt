package com.abuja.taxi.core.network.models

import kotlinx.serialization.Serializable

@Serializable
data class RouteGeometry(
    val points: List<Coordinates>
)

@Serializable
data class RouteCongestion(
    val label: String? = null,
    val heavyShare: Double? = null
)

@Serializable
data class OptimizedLeg(
    val source: String? = null,
    val profile: String? = null,
    val distanceKm: Double = 0.0,
    val durationSec: Int = 0,
    val durationMin: Int = 0,
    val congestion: RouteCongestion? = null,
    val points: List<Coordinates> = emptyList()
)

@Serializable
data class RouteTotals(
    val distanceKm: Double = 0.0,
    val durationSec: Int = 0,
    val durationMin: Int = 0
)

@Serializable
data class DriverTripRoutes(
    val profile: String? = null,
    val selection: String? = null,
    val providerConfigured: Boolean = false,
    val toPickup: OptimizedLeg? = null,
    val toDestination: OptimizedLeg? = null,
    val totals: RouteTotals? = null
)

@Serializable
data class RouteOptimizeRequest(
    val driverCoords: Coordinates? = null,
    val pickupCoords: Coordinates,
    val dropoffCoords: Coordinates
)

object RouteUtils {
    /**
     * Simplistic straight-line route between two points for offline visualization.
     * Production routing uses POST /api/routes/optimize (Mapbox driving-traffic).
     */
    fun createMockRoute(start: Coordinates, end: Coordinates): List<Coordinates> {
        return listOf(start, end)
    }
}
