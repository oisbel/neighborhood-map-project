/* Init map and markers*/

var map;

// Create an array for all the locations markers
var markers = [];

// InfoWindow to show when a marker is selected
var infoWindow = null;

// Load the map and the markers
function initMap() {
    // Create a styles array to use with the map(Attribution to snazzymaps.com)
    var styles = [{
    "elementType": "geometry",
    "stylers": [{
            "hue": "#ff4400"
        },
        {
            "saturation": -68
        },
        {
            "lightness": -4
        },
        {
            "gamma": 0.72
        }
    ]
    },
    {
    "featureType": "road",
    "elementType": "labels.icon"
    },
    {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [{
        "hue": "#0077ff"
    }, {
        "gamma": 3.1
    }]
    }, {
    "featureType": "water",
    "stylers": [{
        "hue": "#00ccff"
    }, {
        "gamma": 0.44
    }, {
        "saturation": -33
    }]
    }, {
    "featureType": "poi.park",
    "stylers": [{
        "hue": "#44ff00"
    }, {
        "saturation": -23
    }]
    }, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
        "hue": "#007fff"
    }, {
        "gamma": 0.77
    }, {
        "saturation": 65
    }, {
        "lightness": 99
    }]
    }, {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "gamma": 0.11
    }, {
        "weight": 5.6
    }, {
        "saturation": 99
    }, {
        "hue": "#0091ff"
    }, {
        "lightness": -86
    }]
    }, {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{
        "lightness": -48
    }, {
        "hue": "#ff5e00"
    }, {
        "gamma": 1.2
    }, {
        "saturation": -23
    }]
    }, {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "saturation": -64
    }, {
        "hue": "#ff9100"
    }, {
        "lightness": 16
    }, {
        "gamma": 0.47
    }, {
        "weight": 2.7
    }]
    }
    ];

    // Center of the map
    var center = {lat: 30.1147939, lng: -95.2307214};

    var defaultIcon = 'img/default-icon.png';
    // Icon when mouse over
    var icon = 'img/icon.png';

    // To show info when markers are selected
    infoWindow = new google.maps.InfoWindow();

    // Create a map using Google Maps API.
    map = new google.maps.Map(document.getElementById('map'), {
    	center: center,
        zoom: 14,
        styles: styles
    });

    // Listen for the map-container resize event & trigger Google Maps to update too,
    // so the map take all the space
    $('.map-container').bind('resize', function() {
        google.maps.event.trigger(map, "resize");
    });

    // Create the markers base on locations
    for (var i = 0; i < locations.length; i++) {
    	var marker = new google.maps.Marker({
    		position: locations[i].location,
    		title: locations[i].title,
    		visible: true,
    		icon: defaultIcon,
    		id: locations[i].id
    	});
    	markers.push(marker);

    	// Change the icon when mouse over
    	marker.addListener('mouseover', function() {
    		this.setIcon(icon);
    	});
    	marker.addListener('mouseout', function() {
    		this.setIcon(defaultIcon);
        });

    	// Open the infowindow when click on the marker
        marker.addListener('click', function(){
        	populateInfoWindow(this, infoWindow);
        });
    };

}

// Error callback for Map API request
function mapError() {
    console.log("Fail to load the map");
    alert("Fail to load the map. Check your internet connection and try again.");
}

// Shows the markers with the visible property set to true
function showMarkers(markers) {
	if(!map || !markers){
		// Wait for the map to load and markers be created
		setTimeout(function(){showMarkers(markers);},100);
	}
	else{
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < markers.length; i++) {
			if(markers[i].visible){
				markers[i].setMap(map);
				bounds.extend(markers[i].position);
			}
			else
				markers[i].setMap(null);
		}
		if(!bounds.equals(new google.maps.LatLngBounds()))
			map.fitBounds(bounds);
	}
}

// Populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow) {
	//check if the infowindow is already opened on this marker
	if (!infowindow || infowindow.marker == marker)
		return;

	// Animate the marker
	marker.setAnimation(google.maps.Animation.BOUNCE)
	setTimeout(function(){
		marker.setAnimation(null);
	},700);

	infowindow.setContent('<div class="iw-container">'+
        '<div class="iw-title">' + marker.title + '</div>'+
        '<div class="info-container">');
	infowindow.marker = marker;
	// Clear the marker property when closing the infowindow.
    infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
    });

    loadFoursquare_Wikipedia(marker.position, marker.title, infowindow);

    infowindow.open(map, marker);
}

// Get location details from foursquare' API and wikipedia to populates the infowindow
function loadFoursquare_Wikipedia(latlng, title, infowindow){
	var client_id = 'HMVY14URZYXQ0VMDATLAFOYPTHX2H0PLDDUXSDLCWBT5V55K';
	var client_secret = 'FVECJD3DALZWETVHP0VU1ZQJAOP2ELTNP0GCI31UZSCTRYVU';

	// This first call will be to get the id,address and phone
	$.ajax({
		type: "GET",
		url: 'https://api.foursquare.com/v2/venues/search',
		data: {ll: latlng.lat() + ',' + latlng.lng(),
			query: title, limit: '1',
			venuePhotos: '1',
			client_id: client_id, client_secret: client_secret,
			v: '20170512'},
		dataType: "jsonp",
		success: function(response){
			// Get data from response
			var item = response.response.venues[0];
			var id = item.id;
			var address = item.location.formattedAddress[0];
			var phone = item.contact.formattedPhone;

			var srcImg = '';
			var rating = '';
			var url = 'https://api.foursquare.com/v2/venues/' + id +
				'?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20170512';

			// Make another call to get photo and rating using the id
			$.getJSON( url, function( response){
				if(response.response.venue){
					if(response.response.venue.bestPhoto){
						var prefix = response.response.venue.bestPhoto.prefix;
						var suffix = response.response.venue.bestPhoto.suffix;
						srcImg = prefix + "100x100" + suffix;
					}
					else
						srcImg = 'img/noImg.png';
					if(response.response.venue.rating)
						rating = response.response.venue.rating;
					else
						rating = '*';
				}
				else{
					srcImg = 'img/noImg.png';
					rating = '*';
				}
                var newContent = '<div><p>' + address + '</p>' +
                    '<div class="row"><div class="col-xs-6"><img src="' + srcImg + '" ></div>' +
                    '<div class="col-xs-6">' +
                    (typeof phone != 'undefined'?('<p>' + phone + '</p>'):'') +
                    '<p>rating:<span class="badge">'+rating+'</span></p></div></div></div>';

                infowindow.setContent(infowindow.getContent() + newContent);

                loadWikipedia(title, infowindow);

			}).fail(function(){
				console.log("Fail to load foursquare details");
                alert("There was an error. Please refresh the page and try again.");
			});
		},
        error: function(){
            console.log("Fail to load foursquare id");
            alert("There was an error. Please refresh the page and try again.");
        }
	});
}

// Search for articles in wikipedia to populates the infowindow
function loadWikipedia(title, infowindow){
    var newContent = '<ul class="list-unstyled">';

    $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        data: {action: 'opensearch', search: title, limit: '4', format: 'json'},
        dataType: 'jsonp',
        success: function(response){
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
                var url = 'https://en.wikipedia.org/wiki/' + articleList[i];
                newContent += '<li><a target="_blank" href="' + url + '">' +
                    articleList[i] +'</a></li>';
            };
            newContent += '</ul></div></div>';
            infowindow.setContent(infowindow.getContent() + newContent);
        },
        error: function(){
            console.log("Fail to load wikipedia articles");
            alert("Fail to load wikipedia articles");
        }
    });
}

/*ko*/

// All the locations displayed on the map
var locations = [
   	{title: 'First Baptist Porter', location: {lat: 30.1024607, lng: -95.2389851}, id: 0},
   	{title: 'Captain D\'s', location: {lat: 30.1023553,lng: -95.2362218}, id: 1},
   	{title: 'Academy Sports + Outdoors', location: {lat: 30.1331085,lng: -95.2320966}, id: 2},
   	{title: 'Texan Drive Stadium', location: {lat: 30.1357423,lng: -95.2329521}, id: 3},
   	{title: 'Little Caesars Pizza', location: {lat: 30.1025538,lng: -95.2350824}, id: 4},
   	{title: 'Domino\'s Pizza', location: {lat: 30.1019643,lng: -95.2305003}, id: 5},
   	{title: 'Oakhurst Golf Club', location: {lat: 30.0862627,lng: -95.2598051}, id: 6},
   	{title: 'Porter High School', location: {lat: 30.1205102,lng: -95.2704333}, id: 7},
   	{title: 'New Caney High School', location: {lat: 30.132305,lng: -95.2214674}, id: 8},
   	{title: 'Burger King', location: {lat: 30.1049038,lng: -95.2383795}, id: 9},
   	{title: 'Mercadito La Mexicana', location: {lat: 30.1075306,lng: -95.2589777}, id: 10},
   	{title: 'Emerald Lake Resort', location: {lat: 30.1106145,lng: -95.2272312}, id: 11},
   	{title: 'El Kiosko Frutas Y Helados', location: {lat: 30.1050485,lng: -95.2450048}, id: 12}
];

// Represent a location item
var place = function(data){
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
	this.id = data.id;
	this.shown = ko.observable(true);
}

// The viewmodel
var ViewModel = function(){
	self = this;

    // Indicates when the list view is hidden
    this.isHide = ko.observable(false);

    // List of objects place
	this.locationsList = ko.observableArray([]);
	locations.forEach(function(locationItem){
		self.locationsList.push(new place(locationItem));
	});

	// Store the text used for filter the list of locations
	this.filterText = ko.observable();

	//list of locations to show
	this.filteredLocations = ko.computed(function(){
		return self.locationsList().filter(function(location){
			return location.shown();
		});
	});

    // Title of the hamburger's icon
    this.hamburgerText = ko.computed(function(){
        return self.isHide()?"Show List" : "Hide List";
    });

	// Handle key up event on filter text
	this.filter = function(){
		self.locationsList().forEach(function(locationItem){
			// Check if the title contains the text entered
			if(locationItem.title().toLowerCase().includes(self.filterText().toLowerCase())){
				locationItem.shown(true);
				markers[locationItem.id].visible = true;
			}
			else{
				locationItem.shown(false);
				markers[locationItem.id].visible = false;
			}
		});

		showMarkers(markers);
	}

	// Handles click event on list item
	this.highlightLocation = function(location){
		populateInfoWindow(markers[location.id], infoWindow);
	}

    //To hide and show the listview
    this.hideshowList = function(){
        self.isHide(!self.isHide());
        $('.map-container').resize();// To make the map refresh all the width
    }

	showMarkers(markers);
}

ko.applyBindings(new ViewModel());