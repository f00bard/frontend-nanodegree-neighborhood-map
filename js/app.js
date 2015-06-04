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
                zoom: 10
            }),

            // Create a single InfoWindow so that only one is open at any given time
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
                    var newPlace = new app.Place(map, i, p)
                    google.maps.event.addListener(newPlace.marker, 'click', function() {
                        updateSelectedPlace(newPlace);
                    });
                    places.push(newPlace);
                });

                // Handle clicking the close button in the InfoWindow
                google.maps.event.addListener(infoWindow, 'closeclick', function(butts) {
                    updateSelectedPlace(undefined);
                });
            },

            // Here is where the magic happens
            updateSelectedPlace = function(place) {
                if(place === undefined) {
                    $('#collapse' + selectedPlace().id).collapse('hide');
                    infoWindow.close();
                } else {
                    $('#collapse' + place.id).collapse({parent : '#accordion', toggle: true});
                    infoWindow.setContent(place.title);
                    infoWindow.open(map, place.marker);

                    // Model is responsible for fetching the data
                    place.getApiData();
                }

                selectedPlace(place);
            },

            handlePlaceClick = function(place) {
                if (place === selectedPlace()) {
                    updateSelectedPlace(undefined);
                } else {
                    updateSelectedPlace(place);
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

    // Custom binding so we can use bind ICH templates using KO
    // http://stackoverflow.com/a/14762251
    ko.bindingHandlers.element = {
        update: function(element, valueAccessor) {
            var elem = ko.utils.unwrapObservable(valueAccessor());
            $(element).empty();
            $(element).append(elem);
        }
    };

    ko.applyBindings(app.viewModel);
});
