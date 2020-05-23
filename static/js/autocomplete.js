var autocomplete;
function initAutocomplete() {
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new google.maps.places.Autocomplete(
        $('.autocomplete')[0], { types: ['geocode'] });

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    autocomplete.setFields(['address_component']);

    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', function (e) {
        // Place finder
        var service = new google.maps.places.PlacesService(map);
        var request = {
            query: $('.autocomplete').val(),
            fields: ['name', 'formatted_address', 'geometry'],
        };
        service.findPlaceFromQuery(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Check if within perimiter
                var eligible = google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryPerimiter)
                console.log('found location', results[0], 'eligible: ' + eligible);
                if (eligible) {
                    $('.success').show();
                    $('.failure').hide();
                } else {
                    $('.success').hide();
                    $('.failure').show();
                }
            }
        });
    });
}