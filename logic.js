

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";



// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createMap function
  createMap(data.features);
});


function createMap(earthquakeData) {

    // Loop through locations and markers elements
      EarthquakeMarkers = earthquakeData.map((feature) =>
                    //Yes, the geojson 'FORMAT' stores it in reverse, for some reason. (L.geojson parses it as [lat,lng] for you)
                     //lat                         //long  
        L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],{
            radius: magCheck(feature.properties.mag),
            stroke: true,
            color: 'black',
            opacity: 1,
            weight: 0.5,
            fill: true,
            fillColor: magColor(feature.properties.mag),
            fillOpacity: 0.9   
        })
        .bindPopup("<h1> Magnitude : " + feature.properties.mag +
        "</h1><hr><h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
      )

      // Add the earthquakes layer to a marker cluster group.
      var earthquakes=L.layerGroup(EarthquakeMarkers)
    //    console.log(d3.extent(d3.values(earthquakeData,((d) => +d.properties.mag))));
       var mags = earthquakeData.map((d) => magCheck(+d.properties.mag));
       console.log(d3.extent(mags));
       console.log(mags);
    //    console.log(earthquakeData.properties.mag);

  





  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

//   var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.dark",
//     accessToken: API_KEY
//   });

//   // Define a baseMaps object to hold our base layers
//   var baseMaps = {
//     "Street Map": streetmap,
//     "Dark Map": darkmap
//   };

//   // Create overlay object to hold our overlay layer
//   var overlayMaps = {
//     Earthquakes: earthquakes
//   };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

// Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(myMap){
    var div = L.DomUtil.create("div","legend");
    div.innerHTML = [
        "<k class='maglt2'></k><span>0-2</span><br>",
        "<k class='maglt3'></k><span>2-3</span><br>",
        "<k class='maglt4'></k><span>3-4</span><br>",
        "<k class='maglt5'></k><span>4-5</span><br>",
        "<k class='maggt5'></k><span>5+</span><br>"
      ].join("");
    return div;
}

legend.addTo(myMap);
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
//   L.control.layers(baseMaps, overlayMaps, {
//     collapsed: false
//   }).addTo(myMap);
}
/* Define a function to assign a color to the magnitude of the earthquake.
    Note: Below we use the d3.extent to determine the domain of values in the dataset
    and find that the magnitudes vary from -1.29 to 5.9 (on 4/10/2020). Given a negative value
    for the earthquake magnitude it was researched and found that in fact a magnitude can be negative
    (https://www.usgs.gov/faqs/how-can-earthquake-have-a-negative-magnitude?qt-news_science_products=0#qt-news_science_products)
    Therefore we will use these negative values but need to adjust them so the magnitude values can be used
    to plot the radius of the circleMarker. Also, we will allow for larger values than 5.9 as this is just
    the largest value witnessed in the prior seven days to 4/10/20. After research we found that there is an 
    upper limit due to the fact it is related to the length of the fault so a magnitude 10 is theoretically
    impossible. But a 9.5 has been recorded, so we will allow for magnitudes of -2 through >9.
    (https://www.usgs.gov/faqs/can-megaquakes-really-happen-a-magnitude-10-or-larger?qt-news_science_products=0#qt-news_science_products)
    It was reviewed how to write this function as either an if/else or a switch. This article recommends the if/else
    for performance reasons over a "switch-range2" option (https://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than)
    Finally Colorbrewer 2.0 was used to determine the gradient of colors (https://colorbrewer2.org/#type=sequential&scheme=OrRd&n=9)
     The article also recommends the maximum number of data classes is 5-7 after experimenting with a number
     of options we decided to use 5. */

     function magColor(mag) {
      var color = "";
      if (mag <= 2) { color = "#ffffb2"; }
      else if (mag <= 3) {color = "#fecc5c"; }
      else if (mag <= 4) { color = "#fd8d3c"; }
      else if (mag <= 5) {color = "#f03b20"; }
      else { color = "#bd0026"; }
    
    return color;
    
    };
// Function to determine if the magnitude is zero or less (See above discussion as it is possible to have
// negative magnitudes, which obviously can't be used for setting the circleMarker radius)
function magCheck(mag){
  if (mag <= 1){
      return 8
  }
  return mag * 8;
}