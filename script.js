mapboxgl.accessToken = "YourAPIToken";

// Get Current Position
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true,
});

// Set the current location
function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

// Set default position if location not found
function errorLocation() {
    setupMap([-2.24, 53.48]);
}

// Rotate camera on one point
function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
}

function setupMap(center) {
    console.log(center);
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: 15,
    });

    // Add Full Screen
    map.addControl(new mapboxgl.FullscreenControl());

    // Add GeoCode Search
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
        })
    );

    // Place Marker to current position
    new mapboxgl.Marker().setLngLat(center).addTo(map);

    // Add Style changer Menu
    const layerList = document.getElementById("menu");
    const inputs = layerList.getElementsByTagName("input");

    for (const input of inputs) {
        input.onclick = (layer) => {
            const layerId = layer.target.id;
            map.setStyle("mapbox://styles/mapbox/" + layerId);
        };
    }

    map.on("load", () => {
        // Insert the layer beneath any symbol layer.
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === "symbol" && layer.layout["text-field"]
        ).id;

        // Start the Animation
        // rotateCamera(0);

        map.setPaintProperty("building", "fill-color", [
            "interpolate",
            // Set the exponential rate of change to 0.5
            ["exponential", 0.5],
            ["zoom"],
            // When zoom is 15, buildings will be beige.
            15,
            "#D9D3C9",
            // When zoom is 18 or higher, buildings will be yellow.
            18,
            "#ffd700",
        ]);

        map.setPaintProperty("building", "fill-opacity", [
            "interpolate",
            // Set the exponential rate of change to 0.5
            ["exponential", 0.5],
            ["zoom"],
            // When zoom is 10, buildings will be 100% transparent.
            10,
            0.5,
            // When zoom is 18 or higher, buildings will be 100% opaque.
            18,
            1,
        ]);

        // Adding 3D Buildings
        map.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    15,
                    0,
                    15.05,
                    ["get", "height"],
                ],
                "fill-extrusion-base": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    15,
                    0,
                    15.05,
                    ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
            },
        });
    });

    // Add Navigation Controls
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, "bottom-right");

    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
    });

    map.addControl(directions, "top-left");
}
