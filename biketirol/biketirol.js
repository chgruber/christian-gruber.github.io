/*
    Vorbereitung: GPX Track herunterladen und nach GeoJSON konvertieren
    -------------------------------------------------------------------
    Datenquelle https://www.data.gv.at/suche/?search-term=bike+trail+tirol&searchIn=catalog
    Download Einzeletappen / Zur Ressource ...
    Alle Dateien im unterverzeichnis data/ ablegen
    Die .gpx Datei der eigenen Etappe als etappe00.gpx speichern
    Die .gpx Datei über https://mapbox.github.io/togeojson/ in .geojson umwandeln und als etappe00.geojson speichern
    Die etappe00.geojson Datei in ein Javascript Objekt umwandeln und als etappe00.geojson.js speichern

    -> statt 00 natürlich die eigene Etappe (z.B. 01,02, ...25)
*/
let myMap = L.map("map",{
    fullscreenControl: true
});
// eine neue Leaflet Karte definieren

//let overlayTrack = L.featureGroup().addTo(myMap);
//let overlayMarker = L.featureGroup().addTo(myMap);
let overlaySteigung = L.featureGroup().addTo(myMap);

const etappe09Group = L.featureGroup();

// Grundkartenlayer mit OSM, basemap.at, Elektronische Karte Tirol (Sommer, Winter, Orthophoto jeweils mit Beschriftung) über L.featureGroup([]) definieren
// WMTS URLs siehe https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol

let myLayers = {
    geolandbasemap : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
        subdomains : ["maps", "maps1", "maps2", "maps3", "maps4"],
        attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at"
        }
    ),
    osm : L.tileLayer( 
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
        subdomains: ['a', 'b', 'c'], // subdomains hinzugefügt
        attribution : "Datenquelle: <a href='https://www.openstreetmap.org'>OpenStreetMap"
        }
    ), 
   
    bmaporthofoto30cm : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg",{
        subdomains : ["maps", "maps1", "maps2", "maps3", "maps4"],
        attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at"
        }
    ),
    gdi_ortho : L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_ortho/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
        attribution : "Datenquelle: <a href ='https://www.tirol.gv.at/data/nutzungsbedingungen/'> Land Tirol - data.tirol.gv.at </a>"
     }
    ),
    gdi_sommer: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_summer/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
        attribution : "Datenquelle: <a href ='https://www.tirol.gv.at/data/nutzungsbedingungen/'> Land Tirol - data.tirol.gv.at </a>"
    }
    ),
    gdi_winter: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_winter/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
        attribution : "Datenquelle: <a href ='https://www.tirol.gv.at/data/nutzungsbedingungen/'> Land Tirol - data.tirol.gv.at </a>"
    }
    ),
    gdi_nomenklatur: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_nomenklatur/GoogleMapsCompatible/{z}/{x}/{y}.png8", {
        attribution : "Datenquelle: <a href ='https://www.tirol.gv.at/data/nutzungsbedingungen/'> Land Tirol - data.tirol.gv.at </a>",
        pane: "overlayPane"                         
        }
    ),  
}

myMap.addLayer(myLayers.geolandbasemap); 

const gdi_sommer = L.layerGroup([
    myLayers.gdi_sommer,
    myLayers.gdi_nomenklatur
]);
const gdi_winter = L.layerGroup([
    myLayers.gdi_winter,
    myLayers.gdi_nomenklatur
]);
const gdi_ortho = L.layerGroup([
    myLayers.gdi_ortho,
    myLayers.gdi_nomenklatur
]);


// Maßstab metrisch ohne inch
//Maßstabsleiste
L.control.scale({       // http://leafletjs.com/reference-1.3.0.html#control-scale
    maxWidth: 200,      // http://leafletjs.com/reference-1.3.0.html#control-scale-maxwidth
    metric: true,       // http://leafletjs.com/reference-1.3.0.html#control-scale-metric
    imperial: false     // http://leafletjs.com/reference-1.3.0.html#control-scale-imperial
}).addTo(myMap);


// Start- und Endpunkte der Route als Marker mit Popup, Namen, Wikipedia Link und passenden Icons für Start/Ziel von https://mapicons.mapsmarker.com/

const marker_Kaiserhaus = [47.536631,11.912908]
let Kaiserhaus_popup = '<h1>Kaiserhaus </h1>https://de.wikipedia.org/wiki/Kaiserklamm<a href="">Wikipedia</a>'
L.marker(marker_Kaiserhaus, {icon: L.icon({
  iconUrl: '../icons/bike.png',

})
}).addTo(etappe09Group).bindPopup(Kaiserhaus_popup);

const marker_Kufstein = [47.605964,12.196378]
let Kufstein_popup = '<h1>Kufstein </h1>https://de.wikipedia.org/wiki/Kufstein<a href="">Wikipedia</a>'
L.marker(marker_Kufstein, {icon: L.icon({
 iconUrl: '../icons/bike.png',
})
}).addTo(etappe09Group).bindPopup(Kufstein_popup);


// GeoJSON Track als Linie in der Karte einzeichnen und auf Ausschnitt zoomen
// Einbauen nicht über async, sondern über ein L.geoJSON() mit einem Javascript Objekt (wie beim ersten Stadtspaziergang Wien Beispiel)

//let geojson = L.geoJSON(etappe09).addTo(etappe09Group);

// elevation tool - Höhenprofil
var hoehenprofil = L.control.elevation({
    position : "topright",
    theme: "lime-theme",
    collapsed: true,
    });
hoehenprofil.addTo(myMap);
var g=new L.GPX("data/etappe09.gpx", {async: true});
g.on("addline",function(evt){
	hoehenprofil.addData(evt.line);
});
g.addTo(myMap);

// Baselayer control für OSM, basemap.at, Elektronische Karte Tirol hinzufügen
let myMapControl  = L.control.layers({                
    "Geoland Basemap" : myLayers.geolandbasemap,
    "OpenStreetMap" : myLayers.osm,
    "bma_Orthofoto" : myLayers.bmaporthofoto30cm,
    "gdi_Orthofoto" : myLayers.gdi_ortho,
    "gdi_Sommer"    : myLayers.gdi_sommer,
    "gdi_Winter"    : myLayers.gdi_winter,
    
  }, {
    "gdi_Nomenklatur" : myLayers.gdi_nomenklatur,
    "Bike Route"      : etappe09Group, // funktioniert leider noch nicht....
    "Steigungslinie"  : overlaySteigung,
} ); 

myMap.addControl(myMapControl);

//myMap.addLayer(etappe09Group)

//myMap.fitBounds(etappe09Group.getBounds()); 
/*var gpx = '...'; // URL to your GPX file or the GPX itself
new L.GPX(gpx, {
    async: true}).on('loaded', function(e) {
  map.fitBounds(e.target.getBounds());
}).addTo(map);*/

let gpxTrack = new L.GPX("data/etappe09.gpx", {
    async : true,
}).addTo(etappe09Group);
gpxTrack.on("loaded", function(evt) {
    //console.log(evt.target.get_distance(0))
    //console.log(evt.target.get_elevation_min().toFixed(0))
    //console.log(evt.target.get_elevation_max().toFixed(0))
    //console.log(evt.target.get_elevation_gain().toFixed(0))
    //console.log(evt.target.get_elevation_loss().toFixed(0))
    let laenge = evt.target.get_distance().toFixed(0);
    document.getElementById("laenge").innerHTML = laenge;

    let min = evt.target.get_elevation_min().toFixed(0);
    document.getElementById("min").innerHTML = min

    let max = evt.target.get_elevation_max().toFixed(0);
    document.getElementById("max").innerHTML = max

    let hinauf = evt.target.get_elevation_gain().toFixed(0);
    document.getElementById("aufstieg").innerHTML = hinauf

    let hinab = evt.target.get_elevation_loss().toFixed(0);
    document.getElementById("abstieg").innerHTML = hinab
    
    myMap.fitBounds(evt.target.getBounds());

});


gpxTrack.on("addline", function(evt){
    hoehenprofil.addData(evt.line);
    //console.log(evt.line);
    //console.log(evt.line.getLatLngs());
    //console.log(evt.line.getLatLngs()[0]);
    //console.log(evt.line.getLatLngs()[0].lat);
    //console.log(evt.line.getLatLngs()[0].long);
    //console.log(evt.line.getLatLngs()[0].meta);
    //console.log(evt.line.getLatLngs()[0].meta.ele);

    let gpxLinie = evt.line.getLatLngs();
    for (let i = 1; i < gpxLinie.length; i++) {
        let p1 = gpxLinie [i-1];
        let p2 = gpxLinie [i];
        //console.log(p1.lat,p1.long,p2.lat,p2.lng);

// Entfernung zwischen den Punkten
        let dist = myMap.distance(
                [p1.lat,p1.lng]
                [p2.lat,p2.lng]
        );

// Hoehenunterschied
        let delta = p2meta.ele - p1.meta.ele;

// Steiung in %
        let proz = 0;
        if (dist > 0) {
            proz = (delta / dist *100.0).toFixed(1);
        }
//      Das gleiche in Kurz // ? Ausdruck 1 sonst Ausdruck 2        
//       let proz2 = (dist > 0) ? (delta / dist *100.0).toFixed(1) : 0;
      
        let farbe =
         proz > 10   ? "#de2d26" :
         proz > 6    ? "#fb6a4a" :
         proz > 2    ? "#fc9272" :
         proz > 0    ? "#edf8e9" :
         proz > -2   ? "#bae4b3" :
         proz > -6   ? "#a1d99b" :
         proz > -10  ? "#31a354" :
                        "#006d2c";

        let polyline = L.polyline(
            [
                [p1.lat,p1.lng]
                [p2.lat,p2.lng]
            ],{
                color : farbe,
                weight : 10,
            }
        ).addTo(overlaySteigung)
    }
});
