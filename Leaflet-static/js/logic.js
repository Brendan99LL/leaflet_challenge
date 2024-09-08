// Step 1: Create the map based on the image provided in the instructions of the challenge
// Step 2: Style the points on the map based on the data that is going to be used
// Step 3: Pull the data,then push the appropriate data into their respective layes
// Step 4: Create the legend

// Create the tile layer to hold the streetmap layer
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the topographic layer
let topo = L.tileLayer.wms('http://ows.mundialis.de/services/service?',{layers: 'TOPO-WMS'});

// Create the satellite layer
let satelliteLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});


// Create the map object with options
let myMap = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 3.5,
    layers: [streetmap]
});

// Create a baseMap object to hold the streetmap layer
let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo,
    "Satallite Map": satelliteLayer
};

// Create two separate layer groups: one for the earthquakes and another for the tectonic plates
let earthquakes_data = new L.layerGroup();
let tectonics_data = new L.layerGroup();

// Create an overlaysMaps object to hold the earthquakes_data and tectonics_data
let overlayMaps = {
    "Earthquakes": earthquakes_data,
    "Tectonic Plates": tectonics_data
};

// Create a layer control, and pass it baseMaps and overlayMaps.  Add the layer to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);



// Store the url of the GeoJSON data used to make the map
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Query the url with d3
d3.json(url).then(data => {

    // Print the data that will be used for the map within the console to see what we are working with
    console.log(data);
});

// Create a function that styles the points on the map
function styleInfo(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]),
        fillColor: chooseColor(feature.geometry.coordinates[2]),  // the fillcolor is going to be dependent on the depth of the earthquake
        fillOpacity: 0.8,
        weight: 0.5,
        radius: chooseRadius(feature.properties.mag)  // the radius is going to be dependent on the magnitude of the earthquake
    }
};

// The magnitudes of the earthquakes are fairly small numbers and can affect the size of the circles on the map
// Create the chooseRadius function to multiply the magnitude to adjust the visuals on the map
function chooseRadius(magnitude) {
    return magnitude * 4;
};

// Create the chooseColor function to determine the color of the earthquakes based on the depth
function chooseColor(depth) {
    if (depth <= 10) 
        return "#F75D59";
    else if (depth > 10 & depth <= 30) 
        return "#FFA600";
    else if (depth > 30 & depth <= 50) 
        return "#F53216";
    else if (depth > 50 & depth <= 70) 
        return "#622F22";
    else if (depth > 70 & depth <= 90) 
        return "#040720";
    else 
        return "#2E8B57";
};


// Pull the earthquake data using d3.json
d3.json(url).then(function (data) {

    L.geoJson(data, {
        pointToLayer: function (feature, location) {
            return L.circleMarker(location).bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3><hr><h3>Location: ${feature.properties.place}</h3><hr><h3>Date: ${new Date(feature.properties.time)}</h3>`);
        },
        style: styleInfo
    }).addTo(earthquakes_data);
    earthquakes_data.addTo(myMap);
});

// Pull the tectonics data using the url of the raw json file directed from the instructions of the challenge
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {

    L.geoJson(data, {
        color: "#DAEE01",
        weight: 3
    }).addTo(tectonics_data);
    tectonics_data.addTo(myMap);
});


// Create a legend for the map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let colors = ["#2E8B57", "#F75D59", "#FFA600", "#F53216", "#622F22", "#040720"];
    let limits = [-10, 10, 30, 50, 70, 90];
    let labels = [
        '-10-10',
        '10-30',
        '30-50',
        '50-70',
        '70-90',
        '90+'
    ];

    // Add the title
    let legendInfo = "<h3>All Earthquakes in the Past 30 Days</h3>" + "<h4>Depth (km)</h4>";

    div.innerHTML = legendInfo;

    // Create a list of color boxes and labels
    for (let i = 0; i < limits.length; i++) {
        div.innerHTML +=
            '<div class="legend-item">' +
            '<i style="background:' + colors[i] + '"></i> ' +
            labels[i] + '<br>' +
            '</div>';
    }

    return div;
};

// Add the legend to the map
legend.addTo(myMap);