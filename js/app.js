var app = app || {};

$(function() {
    app.viewModel = (function() {
        "use strict";

        // Some view model properties
        var places = ko.observableArray(),
            selectedPlace = ko.observable(),
            searchText = ko.observable(''),
            Orlando = new google.maps.LatLng(28.541047, -81.389074),

            map = new google.maps.Map($('#map-canvas')[0], {
                center: Orlando,
                zoom: 11
            }),

            infoWindow = new google.maps.InfoWindow({
                content: ''
            }),

            // Filtered places will be the observeable exposed to the View, filtered based on
            // contents of searchText observable.
            // Using this pattern to filter our Google Maps pins: http://stackoverflow.com/a/20857972
            filteredPlaces = ko.computed(function() {
                var searchString = searchText().toLowerCase();
                return ko.utils.arrayFilter(places(), function(place) {
                    var match = (place.title.toLowerCase().indexOf(searchString) >= 0);

                    place.isVisible(match);

                    return match;
                });
            }),

            // Now our view model methods
            initialize = function() {
                // Initialize our list of places from the hard coded data in the model.
                $.each(app.places.Places, function(i, p) {
                    places.push(new app.Place(map, i, p));
                });

                selectedPlace.subscribe(function(place) {
                    if (place !== undefined) {
                        console.log(place);
                        infoWindow.setContent(place.description);
                        infoWindow.open(map, place.marker);

                    } else {
                        infoWindow.close();
                    }
                });

                google.maps.event.addListener(infoWindow, 'closeclick', function() {
                    selectedPlace(undefined);
                });
            },

            handlePlaceClick = function(place) {
                if (place === selectedPlace()) {
                    // If no place selected return map to starting position/zoom level
                    selectedPlace(undefined);
                } else {
                    selectedPlace(place);
                }
            };



        initialize();

        // This is our "public" interface, using the revealing module pattern
        return {
            selectedPlace: selectedPlace,
            searchText: searchText,
            filteredPlaces: filteredPlaces,
            handlePlaceClick: handlePlaceClick
        };
    })();

    ko.applyBindings(app.viewModel);
});
