var app = app || {};

app.Place = function(map, id, place) {
    var self = this;

    this.id = id; // Index from View Model
    this.title = place.title;
    this.description = place.description;
    this.lat = place.lat;
    this.lon = place.lon;
    this.url = place.url;
    this.placeId = place.placeId
    this.yelp = place.yelp;

    this.selected = ko.observable(false);
    this.isVisible = ko.observable(false);
    this.apiData = ko.observable();

    // Google Maps
    this.position = new google.maps.LatLng(place.lat, place.lon);

    this.marker = new google.maps.Marker({
        position: self.position,
        animation: google.maps.Animation.DROP
    });

    // Click handler toggles value of selected var
    google.maps.event.addListener(this.marker, 'click', function() {
        self.selected(!self.selected());
    });

    // Subscribe to the visible observable for showing/hiding the marker
    this.isVisible.subscribe(function(state) {
        if (state) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
    });

    // Initialized as false then set true here so callback is called on page load and marker is made visible
    this.isVisible(true);

    // Frustrating... The InfoWindow adds to the DOM tree so Knockout bindings don't get applied.
    // Work around by building content string manually, yuck.
    this.infoWindow = new google.maps.InfoWindow({
        content: '<div><h3>' + self.title + '</h3><p>' + self.description + '</p><hr/><div id="info-window-' + id + '"><i class="fa fa-spinner fa-spin"></i>&nbsp;Loading...</div></div>'
    });

    // Subscribe to apiData to update InfoWindow content once loaded
    this.apiData.subscribe(function(data) {
        var element = $("#info-window-" + self.id);
        element.html(data);
    });

    // Subscribe to selected state so we can open/close the info window when selected == true
    this.selected.subscribe(function(state) {
        if (state) {
            self.infoWindow.open(map, self.marker);
            self.getApiData();
        } else {
            self.infoWindow.close();
        }
    });

    // HTML "templates"
    var success = "";
    var errorString = "<i class=\"fa fa-exclamation-triangle\"></i>&nbsp;Error loading data!";

    // Function to get third party API data. Updates apiData observable. Handles timeout/error conditions.
    // Thanks to Mark N at Udacity for the OAuth help (http://discussions.udacity.com/t/how-to-make-ajax-request-to-yelp-api/13699/5?u=mack_322358)
    this.getApiData = function() {
        var nonce = (Math.floor(Math.random() * 1e12).toString());
        var yelpUrl = 'http://api.yelp.com/v2/business/' + self.yelp;
        var parameters = {
            oauth_consumer_key: 'xkM3I-UlkwbxHbKf8BJJLA',
            oauth_token: 'F1PMaYbG4p5cfayKlTLw_aHEbaPP68O0',
            oauth_nonce: nonce,
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            callback: 'cb'
        };
        var consumerSecret = 'zaje5XaGq-GAbmZ3mxiFa72DRHE';
        var tokenSecret = 'jQ5wGFMfO6ppxbbe7_eCD1YIWn0';

        var encodedSignature = oauthSignature.generate('GET', yelpUrl, parameters, consumerSecret, tokenSecret);
        parameters.oauth_signature = encodedSignature;

        var settings = {
            url: yelpUrl,
            data: parameters,
            cache: true,
            dataType: 'jsonp',
            timeout: 500,
            success: function(results) {
                console.log(results);
            },
            error: function (parsedjson, textStatus, errorThrown) {
                self.apiData(errorString);
            }
        };

        $.ajax(settings);
    };
};
