var map;
var deliveryPerimiter;
var autocomplete;

function init() {
    console.log($);
    initMap();
    initAutocomplete();

}

function initAutocomplete() {
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new google.maps.places.Autocomplete(
        $('.delivery-wrapper .autocomplete')[0], { types: ['geocode'] });

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    autocomplete.setFields(['address_component']);

    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', function (e) {
        // Place finder
        var service = new google.maps.places.PlacesService(map);
        var request = {
            query: $('.delivery-wrapper .autocomplete').val(),
            fields: ['name', 'geometry'],
        };
        service.findPlaceFromQuery(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Check if within perimiter
                var eligible = google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryPerimiter)
                console.log('found location', results[0], 'eligible: ' + eligible);
                if (eligible) {
                    $('.delivery-wrapper .success').show();
                    $('.delivery-wrapper .failure').hide();
                } else {
                    $('.delivery-wrapper .success').hide();
                    $('.delivery-wrapper .failure').show();
                }
            }
        });
    });
}

function initMap() {
    map = new google.maps.Map($('#map')[0], {
        zoom: 11.5,
        center: { lat: 45.502720, lng: -73.611732 },
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: 'none',
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dadada"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#c9c9c9"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            }
        ]
    });

    // Define the LatLng coordinates for the polygon's path. Note that there's
    // no need to specify the final coordinates to complete the polygon, because
    // The Google Maps JavaScript API will automatically draw the closing side.
    var triangleCoords = [
        { lat: 45.458235, lng: -73.561412 },
        { lat: 45.486141, lng: -73.538054 },
        { lat: 45.529519, lng: -73.544041 },
        { lat: 45.558546, lng: -73.611075 },
        { lat: 45.548480, lng: -73.635238 },
        { lat: 45.503051, lng: -73.667048 },
        { lat: 45.468781, lng: -73.601089 },
        { lat: 45.441326, lng: -73.649498 },
        { lat: 45.421329, lng: -73.651901 },
        { lat: 45.415786, lng: -73.641258 },
        { lat: 45.415545, lng: -73.610702 },
        { lat: 45.434099, lng: -73.583923 },
    ];

    deliveryPerimiter = new google.maps.Polygon({
        paths: triangleCoords,
        strokeColor: 'grey',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#f6d4d2',
        fillOpacity: 0.5
    });

    deliveryPerimiter.setMap(map);
}