pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

rootProject.name = "AbujaTaxi"
include(":app-customer")
include(":app-driver")
include(":core-network")

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://api.mapbox.com/downloads/v2/releases/maven")
            credentials {
                username = "mapbox"
                password = providers.gradleProperty("MAPBOX_DOWNLOADS_TOKEN").get()
            }
        }
    }
}
