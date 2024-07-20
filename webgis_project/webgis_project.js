// Declarations
var map;
var osmLayer, cartoLayer;
var iranProvincesLayer, iranCountiesWMSLayer, iranCountiesWFSLayer;
var bingMap;
var initialView = {
    center: ol.proj.fromLonLat([53.6880, 32.4279]),
    zoom: 5
};

// Initialization
function init() {
    osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true
    });

    cartoLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }),
        visible: false
    });

    iranCountiesWMSLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/cite/wms',
            params: {
                'LAYERS': 'cite:Shahrestan',
                'TILED': true
            },
            serverType: 'geoserver'
        }),
        visible: true
    });

    iranCountiesWFSLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function(extent) {
                return 'http://localhost:8080/geoserver/cite/wfs?service=WFS&' +
                    'version=1.1.0&request=GetFeature&typename=cite:Shahrestan&' +
                    'outputFormat=application/json&srsname=EPSG:3857&' +
                    'bbox=' + extent.join(',') + ',EPSG:3857';
            },
            strategy: ol.loadingstrategy.bbox
        }),
        visible: true,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0)',
                width: 0
            })
        })
    });

    iranProvincesLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: 'iran_provinces.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible: true,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.05)'
            })
        })
    });

    map = new ol.Map({
        target: 'map',
        layers: [osmLayer, cartoLayer, iranProvincesLayer, iranCountiesWMSLayer, iranCountiesWFSLayer],
        view: new ol.View({
            projection: 'EPSG:3857',
            center: initialView.center,
            zoom: initialView.zoom
        })
    });

    setupLayerSwitcher();
    setupClickHandlers();

    Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: GetMap });
}

// Bing
function GetMap() {
    bingMap = new Microsoft.Maps.Map('#bingMap', {
        credentials: 'YOUR_BING_MAPS_KEY',
        center: new Microsoft.Maps.Location(32.4279, 53.6880),
        zoom: 5,
        mapTypeId: Microsoft.Maps.MapTypeId.road
    });

    Microsoft.Maps.loadModule(['Microsoft.Maps.GeoJson', 'Microsoft.Maps.SpatialDataService'], updateBingLayers);
}

// Layers
function addLayer(layerType) {
    var url, fillColor, strokeColor;
    if (layerType === 'provinces') {
        url = 'iran_provinces.geojson';
        fillColor = 'rgba(255, 0, 0, 0.05)';
        strokeColor = 'red';
    } else {
        url = 'http://localhost:8080/geoserver/cite/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=cite:Shahrestan&outputFormat=application/json&srsname=EPSG:4326';
        fillColor = 'rgba(128, 128, 128, 1)'; 
        strokeColor = 'black'; 
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            var geoJsonLayer = new Microsoft.Maps.Layer();
            var shapes = Microsoft.Maps.GeoJson.read(data, {
                polygonOptions: {
                    fillColor: fillColor,
                    strokeColor: strokeColor,
                    strokeThickness: 1
                }
            });
            shapes.forEach(shape => {
                Microsoft.Maps.Events.addHandler(shape, 'click', function (e) {
                    var name = layerType === 'provinces' ? e.primitive.metadata.name : e.primitive.metadata.Name_1_En;
                    document.getElementById('info').innerHTML = (layerType === 'provinces' ? 'Province' : 'County') + ' Name: ' + name;
                });
            });
            geoJsonLayer.add(shapes);
            bingMap.layers.insert(geoJsonLayer);
        });
}

// Toggle
function toggleBingMap(show) {
    document.getElementById('bingMap').style.display = show ? 'block' : 'none';
    document.getElementById('map').style.display = show ? 'none' : 'block';

    if (show && bingMap) {
        var center = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
        var zoom = map.getView().getZoom();
        bingMap.setView({
            center: new Microsoft.Maps.Location(center[1], center[0]),
            zoom: zoom
        });

        updateBingLayers();
    }
}

// Controls
function setupLayerSwitcher() {
    document.querySelectorAll('input[name="baseLayer"]').forEach(function(input) {
        input.addEventListener('change', function(e) {
            var layerName = e.target.value;
            if (layerName === 'Bing') {
                toggleBingMap(true);
            } else {
                toggleBingMap(false);
                osmLayer.setVisible(layerName === 'OSM');
                cartoLayer.setVisible(layerName === 'CARTO');
                map.getView().setCenter(initialView.center);
                map.getView().setZoom(initialView.zoom);
            }
        });
    });

    document.getElementById('iranCountiesCheck').addEventListener('change', function(e) {
        iranCountiesWMSLayer.setVisible(e.target.checked);
        iranCountiesWFSLayer.setVisible(e.target.checked);
        updateBingLayers();
    });

    document.getElementById('iranProvincesCheck').addEventListener('change', function(e) {
        iranProvincesLayer.setVisible(e.target.checked);
        updateBingLayers();
    });
}

// Update
function updateBingLayers() {
    if (bingMap && document.querySelector('input[name="baseLayer"]:checked').value === 'Bing') {
        bingMap.layers.clear();
        if (document.getElementById('iranProvincesCheck').checked) addLayer('provinces');
        if (document.getElementById('iranCountiesCheck').checked) addLayer('counties');
    }
}

// Interactions
function setupClickHandlers() {
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            if (layer === iranCountiesWFSLayer && iranCountiesWFSLayer.getVisible()) {
                return feature;
            }
            if (layer === iranProvincesLayer && iranProvincesLayer.getVisible()) {
                return feature;
            }
            return null;
        });

        if (feature) {
            var name = feature.get('Name_1_En') || feature.get('name');
            var layerType = feature.get('Name_1_En') ? 'County' : 'Province';
            document.getElementById('info').innerHTML = layerType + ' Name: ' + name;
        } else if (iranCountiesWMSLayer.getVisible()) {
            var viewResolution = map.getView().getResolution();
            var url = iranCountiesWMSLayer.getSource().getFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'application/json'}
            );
            if (url) {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.features && data.features.length > 0) {
                            var countyName = data.features[0].properties.Name_1_En;
                            document.getElementById('info').innerHTML = 'County Name: ' + countyName;
                        } else {
                            document.getElementById('info').innerHTML = '';
                        }
                    });
            }
        } else {
            document.getElementById('info').innerHTML = '';
        }
    });
}

// Load
document.addEventListener('DOMContentLoaded', init);